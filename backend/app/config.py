from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "SIBIRU Service"
    PROJECT_DESCRIPTION: str = "Sistem Informasi Peminjaman Ruangan Internal - Backend REST API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database - Default MySQL Laragon (port 3306, user root, tanpa password)
    DATABASE_URL: str = "mysql+pymysql://root:@127.0.0.1:3306/sibiru?charset=utf8mb4"
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Security / Auth
    SECRET_KEY: str = "sibiru-secret-key-super-secure-change-in-production"
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
