"""
Phase 2D authentication integration tests.
Tests run against the actual PostgreSQL database.
"""

import uuid
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import inspect, text, select

from app.core.database import engine, SessionLocal
from app.core.security import (
    hash_password,
    verify_password,
    validate_password_policy,
    create_access_token,
    decode_access_token,
    generate_refresh_token,
    hash_refresh_token,
)
from app.models.auth import Role, UserRole, RefreshToken
from app.models.identity import User
from app.main import app

client = TestClient(app)


# ── Fixtures ──────────────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="module")
def test_user(db):
    """Create a throwaway test user with hashed password and candidate role."""
    email = f"testauth_{uuid.uuid4().hex[:8]}@test.com"
    user = User(
        email=email,
        full_name="Test Auth User",
        hashed_password=hash_password("TestPass123!"),
        is_active=True,
    )
    db.add(user)
    db.flush()

    # Assign candidate role
    role = db.execute(select(Role).where(Role.name == "candidate")).scalar_one()
    db.add(UserRole(user_id=user.id, role_id=role.id))
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="module")
def inactive_user(db):
    email = f"inactive_{uuid.uuid4().hex[:8]}@test.com"
    user = User(
        email=email,
        full_name="Inactive User",
        hashed_password=hash_password("TestPass123!"),
        is_active=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="module")
def employer_user(db):
    email = f"employer_{uuid.uuid4().hex[:8]}@test.com"
    user = User(
        email=email,
        full_name="Employer User",
        hashed_password=hash_password("TestPass123!"),
        is_active=True,
    )
    db.add(user)
    db.flush()
    role = db.execute(select(Role).where(Role.name == "employer")).scalar_one()
    db.add(UserRole(user_id=user.id, role_id=role.id))
    db.commit()
    db.refresh(user)
    return user


# ═══════════════════════════════════════════════════════════════════════════
# 1-3: Password hashing
# ═══════════════════════════════════════════════════════════════════════════
def test_password_hashing_works():
    h = hash_password("MySecret99")
    assert h is not None
    assert h != "MySecret99"


def test_password_verification_works():
    h = hash_password("Correct1")
    assert verify_password("Correct1", h) is True


def test_wrong_password_fails():
    h = hash_password("RightOne1")
    assert verify_password("WrongOne2", h) is False


# ═══════════════════════════════════════════════════════════════════════════
# 4-5: User lookup / inactive
# ═══════════════════════════════════════════════════════════════════════════
def test_user_lookup_works(test_user, db):
    found = db.execute(select(User).where(User.id == test_user.id)).scalar_one_or_none()
    assert found is not None


def test_inactive_user_cannot_login(inactive_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": inactive_user.email,
        "password": "TestPass123!",
    })
    assert resp.status_code == 403


# ═══════════════════════════════════════════════════════════════════════════
# 6-8: Login + access token
# ═══════════════════════════════════════════════════════════════════════════
def test_login_succeeds(test_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": test_user.email,
        "password": "TestPass123!",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_user.email


def test_access_token_is_generated(test_user):
    token = create_access_token(user_id=test_user.id, roles=["candidate"])
    assert token is not None and len(token) > 10


def test_access_token_contains_expected_claims(test_user):
    token = create_access_token(user_id=test_user.id, roles=["candidate"])
    payload = decode_access_token(token)
    assert payload["sub"] == str(test_user.id)
    assert payload["type"] == "access"
    assert "candidate" in payload["roles"]
    assert "jti" in payload


# ═══════════════════════════════════════════════════════════════════════════
# 9-10: Invalid / expired JWT
# ═══════════════════════════════════════════════════════════════════════════
def test_invalid_jwt_is_rejected():
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert resp.status_code == 401


def test_expired_jwt_is_rejected(test_user):
    expired_token = create_access_token(
        user_id=test_user.id, roles=["candidate"],
        expires_delta=timedelta(seconds=-10),
    )
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════
# 11-12: /auth/me
# ═══════════════════════════════════════════════════════════════════════════
def test_me_requires_authentication():
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_me_returns_safe_user_data(test_user):
    token = create_access_token(user_id=test_user.id, roles=["candidate"])
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == test_user.email
    assert "hashed_password" not in data
    assert "password" not in data


# ═══════════════════════════════════════════════════════════════════════════
# 13-18: RBAC
# ═══════════════════════════════════════════════════════════════════════════
def test_role_assignment_works(db):
    roles = db.execute(select(Role)).scalars().all()
    role_names = {r.name for r in roles}
    assert "candidate" in role_names
    assert "employer" in role_names
    assert "training_provider" in role_names
    assert "government_admin" in role_names


def test_candidate_role_recognized(test_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": test_user.email, "password": "TestPass123!",
    })
    assert "candidate" in resp.json()["user"]["roles"]


def test_employer_role_recognized(employer_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": employer_user.email, "password": "TestPass123!",
    })
    assert "employer" in resp.json()["user"]["roles"]


# ═══════════════════════════════════════════════════════════════════════════
# 19-23: Refresh token
# ═══════════════════════════════════════════════════════════════════════════
def test_refresh_token_works(test_user):
    # Login to get refresh cookie
    resp = client.post("/api/v1/auth/login", json={
        "email": test_user.email, "password": "TestPass123!",
    })
    assert resp.status_code == 200
    # Refresh
    resp2 = client.post("/api/v1/auth/refresh")
    assert resp2.status_code == 200
    assert "access_token" in resp2.json()


def test_refresh_token_rotation(test_user):
    # Login
    client.post("/api/v1/auth/login", json={
        "email": test_user.email, "password": "TestPass123!",
    })
    # First refresh
    r1 = client.post("/api/v1/auth/refresh")
    assert r1.status_code == 200
    # Second refresh (uses rotated token)
    r2 = client.post("/api/v1/auth/refresh")
    assert r2.status_code == 200
    assert r1.json()["access_token"] != r2.json()["access_token"]


def test_logout_revokes_refresh_token(test_user):
    # Login
    client.post("/api/v1/auth/login", json={
        "email": test_user.email, "password": "TestPass123!",
    })
    # Logout
    resp = client.post("/api/v1/auth/logout")
    assert resp.status_code == 200
    # Refresh should fail now
    resp2 = client.post("/api/v1/auth/refresh")
    assert resp2.status_code == 401


def test_revoked_refresh_cannot_refresh(test_user):
    # Login
    client.post("/api/v1/auth/login", json={
        "email": test_user.email, "password": "TestPass123!",
    })
    # Logout to revoke
    client.post("/api/v1/auth/logout")
    # Try refresh — should fail
    resp = client.post("/api/v1/auth/refresh")
    assert resp.status_code == 401


# ═══════════════════════════════════════════════════════════════════════════
# 24-25: Security assertions
# ═══════════════════════════════════════════════════════════════════════════
def test_password_hash_never_returned_by_api(test_user):
    resp = client.post("/api/v1/auth/login", json={
        "email": test_user.email, "password": "TestPass123!",
    })
    body = resp.text
    assert "hashed_password" not in body
    resp2 = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {resp.json()['access_token']}"},
    )
    assert "hashed_password" not in resp2.text


def test_refresh_token_raw_not_persisted(db):
    """Verify refresh_tokens table stores hashes, not raw tokens."""
    tokens = db.execute(select(RefreshToken)).scalars().all()
    for t in tokens:
        # Raw tokens are 86+ chars urlsafe base64; SHA-256 hex is exactly 64 hex chars
        assert len(t.token_hash) == 64, f"Token hash length {len(t.token_hash)} looks like raw, not SHA-256 hex"


# ═══════════════════════════════════════════════════════════════════════════
# DB schema verification
# ═══════════════════════════════════════════════════════════════════════════
def test_auth_tables_exist():
    inspector = inspect(engine)
    tables = set(inspector.get_table_names(schema="public"))
    assert "roles" in tables
    assert "user_roles" in tables
    assert "refresh_tokens" in tables


def test_users_has_hashed_password_column():
    inspector = inspect(engine)
    cols = {c["name"] for c in inspector.get_columns("users", schema="public")}
    assert "hashed_password" in cols


def test_roles_name_unique():
    inspector = inspect(engine)
    uqs = inspector.get_unique_constraints("roles", schema="public")
    col_sets = [set(u["column_names"]) for u in uqs]
    assert any({"name"} == s for s in col_sets)


def test_user_roles_composite_pk():
    inspector = inspect(engine)
    pk = inspector.get_pk_constraint("user_roles", schema="public")
    assert set(pk["constrained_columns"]) == {"user_id", "role_id"}


def test_refresh_tokens_fk_to_users():
    inspector = inspect(engine)
    fks = inspector.get_foreign_keys("refresh_tokens", schema="public")
    referred = {fk["referred_table"] for fk in fks}
    assert "users" in referred
