import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sistema de Chamados Multi-Empresas"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # JWT Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "chamados_super_secret_jwt_key_2026_antigravity_secure_token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Settings (Default: MySQL with fallback support)
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DB: str = os.getenv("MYSQL_DB", "chamados_db")
    
    # Custom DATABASE_URL override if provided in .env (e.g. mysql+pymysql://user:pass@host:3306/db or sqlite:///./chamados.db)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"mysql+pymysql://{os.getenv('MYSQL_USER', 'root')}:{os.getenv('MYSQL_PASSWORD', '')}@{os.getenv('MYSQL_HOST', 'localhost')}:{os.getenv('MYSQL_PORT', 3306)}/{os.getenv('MYSQL_DB', 'chamados_db')}?charset=utf8mb4"
    )
    
    # CORS Origins (Allow React frontend / Desktop / Mobile)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://localhost:19006",
        "exp://localhost:19000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = [
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
            ".env",
            "backend/.env"
        ]
        extra = "allow"

settings = Settings()
