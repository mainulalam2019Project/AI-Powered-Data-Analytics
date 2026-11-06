from pydantic import BaseModel
from typing import Any, List, Optional

class ProfileRequest(BaseModel):
    storagePath: str
    fileType: str

class ColumnProfile(BaseModel):
    name: str
    dataType: str
    isNullable: bool
    missingCount: int
    distinctCount: Optional[int] = None
    sampleValues: Optional[Any] = None
    statistics: Optional[Any] = None

class DatasetProfileResponse(BaseModel):
    rowCount: int
    columnCount: int
    missingValueCount: int
    duplicateRowCount: int
    columns: List[ColumnProfile]