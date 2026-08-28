"""
Password hashing and JWT token utilities.

Uses:
- pwdlib + Argon2 for password hashing
- python-jose for JWT encoding/decoding

NEVER log plaintext passwords.
NEVER return password hashes in responses.
"""

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.core.config import settings

# ── Password hasher (Argon2) ──────────────────────────────────────────────
_password_hash = PasswordHash((Argon2Hasher(),))


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using Argon2. Never store plain_password."""
    return _password_hash.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its hash."""
    try:
        return _password_hash.verify(plain_password, hashed_password)
    except Exception:
        return False


def validate_password_policy(password: str) -> None:
    """Raise ValueError if password does not meet minimum policy."""
    if not password or len(password.strip()) == 0:
        raise ValueError("Password must not be empty.")
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        raise ValueError(
            f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long."
        )


# ── JWT Tokens ────────────────────────────────────────────────────────────
def create_access_token(
    *,
    user_id: uuid.UUID,
    roles: list[str],
    expires_delta: timedelta | None = None,
) -> str:
    """Create a short-lived JWT access token."""
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": str(user_id),
        "user_id": str(user_id),
        "roles": roles,
        "type": "access",
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.
    Raises JWTError on invalid/expired token.
    """
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("type") != "access":
        raise JWTError("Invalid token type.")
    return payload


# ── Refresh Tokens ────────────────────────────────────────────────────────
def generate_refresh_token() -> str:
    """Generate a cryptographically secure raw refresh token."""
    return secrets.token_urlsafe(64)


def hash_refresh_token(raw_token: str) -> str:
    """SHA-256 hash the raw refresh token for safe DB storage."""
    return hashlib.sha256(raw_token.encode()).hexdigest()
