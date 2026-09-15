from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, FinancialGoal
from app.schemas.openapi import UserRegister, UserResponse, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register user with optional starter goal")
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role.value if hasattr(user_in.role, 'value') else user_in.role,
        points=0,
        level=1
    )
    db.add(new_user)
    db.flush() # flush to get new_user.id
    
    if user_in.initial_goal:
        new_goal = FinancialGoal(
            user_id=new_user.id,
            name=user_in.initial_goal.name,
            target_amount=user_in.initial_goal.target_amount,
            # category is not in the FinancialGoal model by default but we can ignore or add it if needed.
            # Assuming models don't have category we might skip it or we could add it to FinancialGoal. 
            # Looking at models.py, FinancialGoal doesn't have category. Let's not pass it or just leave it out.
        )
        db.add(new_goal)
        
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse, summary="Login to receive JWT token")
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_req.email).first()
    if not user or not verify_password(login_req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    return TokenResponse(access_token=access_token, token_type="bearer", role=user.role)
