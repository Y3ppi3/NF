import os
from typing import List
from pydantic import AnyHttpUrl, BaseSettings

class Settings(BaseSettings):
    # Основные настройки
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Север-Рыба"
    
    # База данных
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://northf_user:north_fish_password@localhost:5432/north_fish"
    )
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней
    
    # CORS
    CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:5173",  # Фронтенд клиентского приложения
        "http://localhost:5174",  # Фронтенд АИС
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()