from pydantic import BaseModel
from typing import Any, List, Optional, Dict

class TrainRequest(BaseModel):
    storagePath: str
    fileType: str
    taskType: str
    algorithm: str
    targetColumn: Optional[str] = None
    featureColumns: List[str]

class TrainResponse(BaseModel):
    metrics: Dict[str, Any]
    featureImportance: Optional[Dict[str, float]] = None
    artifactPath: Optional[str] = None

class PredictRequest(BaseModel):
    storagePath: str
    fileType: str
    artifactPath: Optional[str] = None
    rows: List[Dict[str, Any]]

class PredictResponse(BaseModel):
    predictions: List[Any]
    explanation: Optional[Dict[str, Any]] = None