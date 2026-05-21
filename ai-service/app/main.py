from fastapi import FastAPI
from app.routers import health, compare, index

app = FastAPI(title="AI Service - Job Aggregator")

app.include_router(health.router)
app.include_router(compare.router)
app.include_router(index.router)
