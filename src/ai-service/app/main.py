from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import datasets, analysis, ml, insights, reports

app = FastAPI(title="Analytics AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router)
app.include_router(analysis.router)
app.include_router(ml.router)
app.include_router(insights.router)
app.include_router(reports.router)

@app.get("/health")
def health():
    return {"status": "ok"}