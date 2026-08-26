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

    # Database — required for Phase 2A onwards
    # Format: postgresql+psycopg://user:password@host:port/dbname
    # Example: postgresql+psycopg://skillmitra:secret@localhost:5432/skillmitra
    DATABASE_URL: str = ""

    # Supabase (optional in Phase 2A — kept for future compatibility)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Auth (future)
    JWT_SECRET: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
