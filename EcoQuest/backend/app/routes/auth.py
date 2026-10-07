from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.account import Account
from app.models.gamification import Achievement, ChallengeMission, UserAchievement, UserXP
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserBrief
from app.services.auth import create_access_token, get_password_hash, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Create new user
    hashed_pwd = get_password_hash(data.password)
    user = User(
        name=data.name.strip(),
        email=data.email.lower().strip(),
        password_hash=hashed_pwd,
        has_completed_onboarding=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize starter accounts (₦0 balance for fresh user)
    acc_savings = Account(
        user_id=user.id,
        bank="Access Bank",
        account_number="•••• 4321",
        account_type="savings",
        name="Savings Account",
        balance=0.0,
    )
    acc_current = Account(
        user_id=user.id,
        bank="GTBank",
        account_number="•••• 8765",
        account_type="current",
        name="Current Account",
        balance=0.0,
    )
    acc_flex = Account(
        user_id=user.id,
        bank="First Bank",
        account_number="•••• 1234",
        account_type="flex",
        name="Flex Account",
        balance=0.0,
    )
    db.add_all([acc_savings, acc_current, acc_flex])

    # Initialize XP record
    user_xp = UserXP(
        user_id=user.id,
        xp=0,
        points=0,
        level_index=1,
        level_name="Starter",
        streak_days=1,
    )
    db.add(user_xp)

    # Initialize starter challenge mission
    first_mission = ChallengeMission(
        user_id=user.id,
        code="TRANSACT_5_TIMES",
        title="Make 5 Transactions",
        description="Experience EcoQuest simulated banking features to build digital confidence.",
        category="transaction",
        current_progress=0.0,
        target_progress=5.0,
        unit="txns",
        xp_reward=200,
        points_reward=300,
        status="active",
        is_first_mission=True,
    )
    db.add(first_mission)
    db.commit()

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserBrief(
            id=user.id,
            name=user.name,
            email=user.email,
            has_completed_onboarding=user.has_completed_onboarding,
        ),
    }


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserBrief(
            id=user.id,
            name=user.name,
            email=user.email,
            has_completed_onboarding=user.has_completed_onboarding,
        ),
    }


@router.post("/logout")
def logout():
    # In stateless JWT architecture, the client discards the token
    return {"message": "Logged out successfully"}
