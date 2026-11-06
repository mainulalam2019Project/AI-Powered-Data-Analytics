from fastapi import APIRouter, Depends
from app.core.security import require_service_key
from app.services.data_profiling import profile_dataset
from app.schemas.datasets import ProfileRequest

router = APIRouter(prefix="/ai/datasets", tags=["datasets"], dependencies=[Depends(require_service_key)])

@router.post("/profile")
async def profile(req: ProfileRequest):
    return profile_dataset(req.storagePath, req.fileType)