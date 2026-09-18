"""
Application configuration using pydantic-settings.
Settings are loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # App
    APP_NAME: str = "SkillMitra"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    PORT: int = 8000

    # Database
    DATABASE_URL: str = ""

    # Supabase (optional - kept for future cloud migration)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_JWKS_URL: str = ""

    # Auth - Phase 2D
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cookie settings
    COOKIE_SECURE: bool = False          # True in production (HTTPS)
    COOKIE_HTTPONLY: bool = True
    COOKIE_SAMESITE: str = "lax"

    # Password policy
    PASSWORD_MIN_LENGTH: int = 8

    # OpenAI Configuration for AI Assistant
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # CORS Configuration
    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,https://skill-mitra-henna.vercel.app,https://skill-mitra-henna-git-main-shihab-rahman2002.vercel.app"  # Updated for Render deployment

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
