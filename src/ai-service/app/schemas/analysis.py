from pydantic import BaseModel
from typing import Any, Optional

class AnalysisRequest(BaseModel):
    storagePath: str
    operation: str = "eda"
    parameters: Optional[Any] = None