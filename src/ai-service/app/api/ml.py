from fastapi import APIRouter, Depends
from app.core.security import require_service_key
from app.services.ml_pipeline import train, predict
from app.schemas.ml import TrainRequest, TrainResponse, PredictRequest, PredictResponse

router = APIRouter(prefix="/ai/ml", tags=["ml"], dependencies=[Depends(require_service_key)])

@router.post("/train")
async def train_model(req: TrainRequest):
    result = train(req.storagePath, req.fileType, req.taskType, req.algorithm, req.targetColumn, req.featureColumns)
    return result

@router.post("/predict")
async def predict_model(req: PredictRequest):
    result = predict(req.storagePath, req.fileType, req.artifactPath, req.rows)
    return result