import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routes import (
    accounts_router,
    auth_router,
    gamification_router,
    goals_router,
    onboarding_router,
    savings_router,
    transactions_router,
    users_router,
)
from app.services.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Create tables in PostgreSQL
        Base.metadata.create_all(bind=engine)

        # Seed initial demo persona and standard achievements
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Warning: Database connection failed during startup: {e}")
        print("The API server is running, but database-dependent routes will fail.")

    yield


app = FastAPI(
    title="EcoQuest API",
    description="Financial education, savings, goals, transactions, and gamification backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
origins.extend(["http://localhost:3000", "http://127.0.0.1:3000", "*"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(accounts_router)
app.include_router(transactions_router)
app.include_router(goals_router)
app.include_router(savings_router)
app.include_router(gamification_router)
app.include_router(onboarding_router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "EcoQuest", "database": "PostgreSQL"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
