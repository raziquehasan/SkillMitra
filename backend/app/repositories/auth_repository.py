"""
Database operations for authentication.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.auth import RefreshToken, Role, UserRole
from app.models.identity import User


class AuthRepository:
    def __init__(self, db: Session):
        self.db = db

    # ── User queries ──────────────────────────────────────────────────────
    def get_user_by_email(self, email: str) -> User | None:
        stmt = (
            select(User)
            .where(User.email == email)
            .options(selectinload(User.user_roles).selectinload(UserRole.role))
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_user_by_id(self, user_id: uuid.UUID) -> User | None:
        stmt = (
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.user_roles).selectinload(UserRole.role))
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_user_roles(self, user_id: uuid.UUID) -> list[str]:
        stmt = (
            select(Role.name)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(UserRole.user_id == user_id)
        )
        return list(self.db.execute(stmt).scalars().all())

    # ── Role queries ──────────────────────────────────────────────────────
    def get_role_by_name(self, name: str) -> Role | None:
        stmt = select(Role).where(Role.name == name)
        return self.db.execute(stmt).scalar_one_or_none()

    def assign_role(self, user_id: uuid.UUID, role_name: str) -> None:
        role = self.get_role_by_name(role_name)
        if not role:
            raise ValueError(f"Role '{role_name}' does not exist.")
        existing = self.db.execute(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role.id,
            )
        ).scalar_one_or_none()
        if not existing:
            self.db.add(UserRole(user_id=user_id, role_id=role.id))
            self.db.flush()

    # ── Refresh token ops ─────────────────────────────────────────────────
    def create_refresh_token(
        self,
        user_id: uuid.UUID,
        token_hash: str,
        expires_at: datetime,
        user_agent: str | None = None,
    ) -> RefreshToken:
        rt = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
        )
        self.db.add(rt)
        self.db.flush()
        return rt

    def get_refresh_token_by_hash(self, token_hash: str) -> RefreshToken | None:
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        return self.db.execute(stmt).scalar_one_or_none()

    def revoke_refresh_token(self, rt: RefreshToken, replaced_by_id: uuid.UUID | None = None) -> None:
        rt.revoked_at = datetime.now(timezone.utc)
        if replaced_by_id:
            rt.replaced_by_token_id = replaced_by_id
        self.db.flush()
