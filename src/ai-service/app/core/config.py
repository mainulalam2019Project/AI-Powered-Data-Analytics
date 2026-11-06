from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    service_key: str = "dev-service-key"
    storage_root: str = "uploads"
    allowed_origins: List[str] = ["http://localhost:5173", "http://localhost:5000"]
    model_dir: str = "models"
    max_upload_mb: int = 50

    class Config:
        env_file = ".env"
        env_prefix = "AI_"

settings = Settings()