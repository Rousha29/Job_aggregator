from fastapi import FastAPI
from app.routers import health, suggest, compare, index

app = FastAPI(title="AI Service - Job Aggregator")

app.include_router(health.router)
app.include_router(suggest.router)
app.include_router(compare.router)
app.include_router(index.router)
