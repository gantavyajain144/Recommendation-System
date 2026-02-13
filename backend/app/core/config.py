import os
from typing import List
from urllib.parse import quote_plus
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Modern Analytics Platform"
    API_V1_STR: str = "/api/v1"
    
    # DATABASE
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "password")
    MYSQL_SERVER: str = os.getenv("MYSQL_SERVER", "localhost")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DB: str = os.getenv("MYSQL_DB", "analytics_db")
    
    @property
    def DATABASE_URL(self) -> str:
        # Use DATABASE_URL from Render if available (PostgreSQL)
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            return database_url
        # Fallback to MySQL for local development
        return f"mysql+pymysql://{self.MYSQL_USER}:{quote_plus(self.MYSQL_PASSWORD)}@{self.MYSQL_SERVER}:{self.MYSQL_PORT}/{self.MYSQL_DB}"

    # AUTHENTICATION
    SECRET_KEY: str = os.getenv("SECRET_KEY", "changethis_secret_key_for_jwt_encoding")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # GOOGLE OAUTH
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    MAX_CONTENT_LENGTH: int = 1024 * 1024 * 10 # 10MB
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://recommendation-system-frontend-aop6.vercel.app",
    ]

    model_config = {"env_file": ".env", "case_sensitive": True}

settings = Settings()
