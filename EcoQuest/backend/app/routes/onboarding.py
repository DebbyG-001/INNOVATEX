import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.gamification import ChallengeMission
from app.models.goal import Goal
from app.models.user import User
from app.schemas.onboarding import OnboardingSubmit
from app.services.auth import get_current_user
from app.services.rules_engine import (
    calculate_required_monthly,
    determine_financial_tier,
    determine_savings_profile,
    determine_segment,
)

router = APIRouter(prefix="/api/onboarding", tags=["Onboarding"])


@router.post("/submit")
def submit_onboarding(
    data: OnboardingSubmit,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    primary_goal_name = ""
    goal_categories = [g.category for g in data.goals]

    if data.goals:
        first_g = data.goals[0]
        primary_goal_name = first_g.custom_name if first_g.category == "other" else first_g.category

    # Run Rules Engine
    seg_code, seg_name, seg_reasons = determine_segment(data.occupation, primary_goal_name)
    tier_code, tier_score, tier_reasons = determine_financial_tier(
        data.monthly_target, data.income_stability, data.active_accounts
    )
    prof_code, prof_name, prof_reasons = determine_savings_profile(
        data.occupation, goal_categories, data.has_emergency_savings, "none"
    )

    explanation = {
        "customer_segment": seg_reasons,
        "savings_profile": prof_reasons,
        "financial_tier": tier_reasons,
    }

    # Update User Profile in PostgreSQL
    user.occupation = data.occupation
    user.income_stability = data.income_stability
    user.monthly_target = data.monthly_target
    user.has_emergency_savings = data.has_emergency_savings
    user.active_accounts_count = data.active_accounts
    user.digital_usage = "moderate"  # Defaulting or computing if needed
    user.customer_segment = seg_code
    user.customer_segment_name = seg_name
    user.financial_tier = tier_code
    user.financial_score = tier_score
    user.savings_profile = prof_code
    user.savings_profile_name = prof_name
    user.explanation_json = json.dumps(explanation)
    user.has_completed_onboarding = True

    # Persist Goals in PostgreSQL
    for g_input in data.goals:
        g_name = (
            g_input.custom_name.strip()
            if g_input.category == "other" and g_input.custom_name
            else {
                "education": "University Essentials",
                "device": "Laptop Fund",
                "travel": "Travel Home",
                "emergency_fund": "Emergency Cushion",
                "business": "Business Growth",
            }.get(g_input.category, "Targeted Goal")
        )
        req_monthly = calculate_required_monthly(
            g_input.target_amount, g_input.current_amount, g_input.months
        )
        goal_rec = Goal(
            user_id=user.id,
            name=g_name,
            category=g_input.category,
            target_amount=g_input.target_amount,
            current_amount=g_input.current_amount,
            duration=g_input.months,
            bank=g_input.bank,
            required_monthly=req_monthly,
            status="active",
        )
        db.add(goal_rec)

    # First mission generation
    first_mission_title = (
        f"Build Your {primary_goal_name.replace('_', ' ').title()} Fund"
        if primary_goal_name
        else "Build Your Emergency Buffer"
    )
    mission = ChallengeMission(
        user_id=user.id,
        code="FIRST_GUIDED_MISSION",
        title=first_mission_title,
        description=f"Save your first contribution towards your goals to ignite your financial habits.",
        category="saving",
        current_progress=0.0,
        target_progress=min(10000.0, data.monthly_target * 0.3),
        unit="₦",
        xp_reward=200,
        points_reward=250,
        status="active",
        is_first_mission=True,
    )
    db.add(mission)

    db.commit()

    return {
        "message": "Onboarding completed successfully",
        "customer_segment": seg_name,
        "savings_profile": prof_name,
        "financial_tier": tier_code,
        "score": tier_score,
        "explanation": explanation,
        "first_mission": {
            "title": mission.title,
            "description": mission.description,
            "xp_reward": mission.xp_reward,
            "points_reward": mission.points_reward,
        },
    }
