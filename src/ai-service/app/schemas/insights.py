from pydantic import BaseModel
from typing import Any, Optional

class InsightsRequest(BaseModel):
    storagePath: str
    fileType: str = "csv"