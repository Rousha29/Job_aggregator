from fastapi import FastAPI
from app.routers import health

app = FastAPI(title="AI Service - Job Aggregator")
app.include_router(health.router)
