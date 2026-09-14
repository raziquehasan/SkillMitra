"""
SQLAlchemy 2.x engine and session factory.

DATABASE_URL is loaded from the environment / .env file.
Never hard-code credentials here.

Usage in FastAPI:
    from app.core.database import get_session
    async def route(session: AsyncSession = Depends(get_session)): ...
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings


def _build_url() -> str:
    url = settings.DATABASE_URL
    if not url:
        raise RuntimeError(
            "DATABASE_URL is not set. "
            "Add it to your .env file: "
            "DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/skillmitra"
        )
    return url


# Synchronous engine (used by Alembic + tests + initial CRUD)
engine = create_engine(
    _build_url(),
    echo=settings.DEBUG,          # logs SQL when DEBUG=True
    pool_pre_ping=True,           # validates connections before use
    pool_size=5,
    max_overflow=10,
    connect_args={
        "prepare_threshold": None,  # Disable automatic prepared statements for Supabase/PgBouncer compatibility
    },
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


def get_session() -> Session:
    """
    Dependency / context manager for a database session.

    Usage (plain Python):
        with get_session() as session:
            ...

    Usage (FastAPI Depends):
        session: Session = Depends(get_session)
    """
    with SessionLocal() as session:
        yield session


def verify_connection() -> bool:
    """Smoke-test: returns True if the DB is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        raise RuntimeError(f"Database connection failed: {exc}") from exc


def get_db():
    """FastAPI dependency yielding a database session (alias for get_session)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
