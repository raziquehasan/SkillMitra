"""
SQLAlchemy 2.x Declarative Base for SkillMitra.

All ORM models inherit from Base defined here.
Do NOT import engine or session here — that belongs in database.py.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    """Shared declarative base. All models inherit from this."""
    pass


class TimestampMixin:
    """
    Adds created_at / updated_at to any model that needs them.
    Use as a mixin BEFORE Base in MRO where needed.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )
