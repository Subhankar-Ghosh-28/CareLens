from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import engine

app = FastAPI(
    title="CareLens API",
    description="AI-Assisted Clinical Intake Platform",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "CareLens API is running",
        "status": "success"
    }


@app.get("/api/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }