"""
FastAPI authentication dependencies.
"""

import uuid

from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.identity import User
from app.repositories.auth_repository import AuthRepository

_bearer = HTTPBearer(auto_error=False)


def _extract_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    access_token: str | None = Cookie(default=None),
) -> str | None:
    """Extract JWT from Authorization header or cookie."""
    if credentials:
        return credentials.credentials
    return access_token


def get_current_user(
    token: str | None = Depends(_extract_token),
    db: Session = Depends(get_db),
) -> User:
    """Validate JWT and return the corresponding User."""
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exc
    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub", "")
        if not user_id_str:
            raise credentials_exc
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exc

    repo = AuthRepository(db)
    user = repo.get_user_by_id(user_id)
    if not user:
        raise credentials_exc
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure the user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user.",
        )
    return current_user


def get_current_user_optional(
    token: str | None = Depends(_extract_token),
    db: Session = Depends(get_db),
) -> User | None:
    """Optionally validate JWT and return the corresponding User, or None."""
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub", "")
        if not user_id_str:
            return None
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        return None

    repo = AuthRepository(db)
    user = repo.get_user_by_id(user_id)
    if not user or not user.is_active:
        return None
    return user


def require_roles(*role_names: str):
    """
    Dependency factory: require at least one of the specified roles.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles("government_admin"))])
    """
    def _checker(current_user: User = Depends(get_current_active_user)) -> User:
        user_roles = {ur.role.name for ur in current_user.user_roles}
        if not user_roles.intersection(set(role_names)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )
        return current_user
    return _checker


def require_any_role(*role_names: str):
    """Alias for require_roles — requires any one of the listed roles."""
    return require_roles(*role_names)
