from fastapi import FastAPI
from app.api import auth, users, goals, rewards, admin

app = FastAPI(
    title="EcoQuest Streamlined API",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(goals.router)
app.include_router(rewards.router)
app.include_router(admin.router)
