from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.users import get_current_user
from app.models.models import User
from app.schemas.mission import MissionResponse, UserMissionResponse
from app.services.mission_service import get_eligible_missions, start_mission, get_mission

router = APIRouter(prefix="/missions", tags=["missions"])

@router.get("", response_model=List[MissionResponse])
def list_eligible_missions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    missions = get_eligible_missions(db, current_user)
    return missions

from app.services.personalization import get_recommended_missions

@router.get("/recommended", response_model=List[MissionResponse])
def list_recommended_missions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_recommended_missions(db, current_user)

@router.post("/{mission_id}/start", response_model=UserMissionResponse)
def start_mission_endpoint(mission_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mission = get_mission(db, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    user_mission = start_mission(db, current_user, mission)
    return user_mission

@router.get("/{mission_id}", response_model=MissionResponse)
def get_mission_endpoint(mission_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mission = get_mission(db, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission
