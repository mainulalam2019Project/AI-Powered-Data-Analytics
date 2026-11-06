from fastapi import APIRouter, Depends
from app.core.security import require_service_key
from app.utils.data_loader import load_dataframe
from app.services.data_profiling import profile_dataset
from app.services.pandas_analysis import eda_summary
from app.services.insights import generate_insights
from app.schemas.insights import InsightsRequest

router = APIRouter(prefix="/ai/insights", tags=["insights"], dependencies=[Depends(require_service_key)])

@router.post("/generate")
async def generate(req: InsightsRequest):
    profile = profile_dataset(req.storagePath, req.fileType)
    df = load_dataframe(req.storagePath, req.fileType)
    eda = eda_summary(df)
    return generate_insights(profile, eda)