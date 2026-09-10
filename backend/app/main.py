from fastapi import FastAPI

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
    return {
        "status": "healthy",
        "service": "CareLens Backend"
    }