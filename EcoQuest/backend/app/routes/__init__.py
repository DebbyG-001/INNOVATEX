from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.accounts import router as accounts_router
from app.routes.transactions import router as transactions_router
from app.routes.goals import router as goals_router
from app.routes.savings import router as savings_router
from app.routes.gamification import router as gamification_router
from app.routes.onboarding import router as onboarding_router

__all__ = [
    "auth_router",
    "users_router",
    "accounts_router",
    "transactions_router",
    "goals_router",
    "savings_router",
    "gamification_router",
    "onboarding_router",
]
