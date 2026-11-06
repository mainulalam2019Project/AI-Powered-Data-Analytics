from fastapi import Header, HTTPException
from app.core.config import settings

def require_service_key(x_service_key: str = Header(default=None, alias="X-Service-Key")):
    if x_service_key != settings.service_key:
        raise HTTPException(status_code=401, detail="Invalid service key")
    return True