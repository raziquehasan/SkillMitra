"""
Authentication business logic service.
"""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    hash_password,
    verify_password,
    validate_password_policy,
)
from app.repositories.auth_repository import AuthRepository
from app.schemas.auth import AuthResponse, UserPublic


class AuthService:
    def __init__(self, db: Session):
        self.repo = AuthRepository(db)
        self.db = db

    def _build_user_public(self, user) -> UserPublic:
        roles = [ur.role.name for ur in user.user_roles]
        return UserPublic(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            roles=roles,
        )

    def login(self, email: str, password: str, request: Request | None = None) -> dict:
        """
        Authenticate user. Returns access token, refresh token (raw), and user info.
        Uses a generic error to avoid leaking whether email/password is wrong.
        """
        GENERIC_ERROR = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

        user = self.repo.get_user_by_email(email)
        if not user:
            raise GENERIC_ERROR

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive.",
            )

        if not user.hashed_password or not verify_password(password, user.hashed_password):
            raise GENERIC_ERROR

        roles = [ur.role.name for ur in user.user_roles]

        # Access token
        access_token = create_access_token(user_id=user.id, roles=roles)

        # Refresh token (generate raw, store hash only)
        raw_refresh = generate_refresh_token()
        token_hash = hash_refresh_token(raw_refresh)
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        user_agent = request.headers.get("user-agent") if request else None
        self.repo.create_refresh_token(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
        )
        self.db.commit()

        return {
            "user": self._build_user_public(user),
            "access_token": access_token,
            "raw_refresh_token": raw_refresh,
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    def refresh(self, raw_refresh_token: str) -> dict:
        """Rotate refresh token and issue new access token."""
        token_hash = hash_refresh_token(raw_refresh_token)
        rt = self.repo.get_refresh_token_by_hash(token_hash)

        if not rt:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")

        now = datetime.now(timezone.utc)
        if rt.revoked_at is not None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked.")
        if rt.expires_at.replace(tzinfo=timezone.utc) < now:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has expired.")

        user = self.repo.get_user_by_id(rt.user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive.")

        roles = [ur.role.name for ur in user.user_roles]

        # Rotate: new refresh token
        new_raw = generate_refresh_token()
        new_hash = hash_refresh_token(new_raw)
        new_expires = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        new_rt = self.repo.create_refresh_token(
            user_id=user.id,
            token_hash=new_hash,
            expires_at=new_expires,
            user_agent=rt.user_agent,
        )
        # Revoke old token, link to replacement
        self.repo.revoke_refresh_token(rt, replaced_by_id=new_rt.id)
        self.db.commit()

        access_token = create_access_token(user_id=user.id, roles=roles)
        return {
            "user": self._build_user_public(user),
            "access_token": access_token,
            "raw_refresh_token": new_raw,
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    def logout(self, raw_refresh_token: str) -> None:
        """Revoke refresh token. Idempotent — double-logout does not crash."""
        token_hash = hash_refresh_token(raw_refresh_token)
        rt = self.repo.get_refresh_token_by_hash(token_hash)
        if rt and rt.revoked_at is None:
            self.repo.revoke_refresh_token(rt)
            self.db.commit()
