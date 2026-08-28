"""
Phase 3 API integration tests.
Covers: auth, RBAC, candidate profile, jobs, skills, courses, demand.
"""
import uuid
import pytest
from datetime import timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.auth import Role
from app.models.identity import User
from app.core.security import hash_password, create_access_token

client = TestClient(app)


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def db():
    from app.core.database import SessionLocal
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def _make_token(user_id: uuid.UUID, roles: list[str]) -> str:
    return create_access_token(user_id=user_id, roles=roles)


def _get_or_create_user(db: Session, email: str, role_name: str) -> tuple[User, str]:
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        role = Role(name=role_name, description=f"Test {role_name}")
        db.add(role)
        db.flush()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=f"Test {role_name.title()}",
            phone=str(uuid.uuid4().int)[:10],
            hashed_password=hash_password("TestPass@123"),
        )
        db.add(user)
        db.flush()
        if role not in [ur.role for ur in user.user_roles]:
            from app.models.auth import UserRole
            ur = UserRole(user_id=user.id, role_id=role.id)
            db.add(ur)
        db.commit()
        db.refresh(user)

    token = _make_token(user.id, [role_name])
    return user, token


# ─── Public endpoints ─────────────────────────────────────────────────────────

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_skills_public():
    r = client.get("/api/v1/skills")
    assert r.status_code == 200
    body = r.json()
    assert "items" in body
    assert "total" in body
    assert "page" in body


def test_skill_categories_public():
    r = client.get("/api/v1/skills/categories")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_proficiency_levels_public():
    r = client.get("/api/v1/skills/proficiency-levels")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_courses_public():
    r = client.get("/api/v1/courses")
    assert r.status_code == 200
    body = r.json()
    assert "items" in body
    assert "total" in body


def test_jobs_public():
    r = client.get("/api/v1/jobs")
    assert r.status_code == 200
    body = r.json()
    assert "items" in body
    assert "total" in body


def test_jobs_pagination():
    r = client.get("/api/v1/jobs?page=1&page_size=5")
    assert r.status_code == 200
    body = r.json()
    assert body["page"] == 1
    assert body["page_size"] == 5


def test_industry_sectors_public():
    r = client.get("/api/v1/industry/sectors")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_demand_public():
    r = client.get("/api/v1/demand")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_demand_industries_public():
    r = client.get("/api/v1/demand/industries")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ─── Auth guard tests ─────────────────────────────────────────────────────────

def test_candidate_me_requires_auth():
    r = client.get("/api/v1/candidates/me")
    assert r.status_code == 401


def test_employer_me_requires_auth():
    r = client.get("/api/v1/employers/me")
    assert r.status_code == 401


def test_government_placements_requires_auth():
    r = client.get("/api/v1/government/placements")
    assert r.status_code == 401


def test_government_demand_requires_auth():
    r = client.get("/api/v1/government/demand")
    assert r.status_code == 401


def test_training_provider_capacity_requires_auth():
    r = client.get("/api/v1/training-providers/me/capacity")
    assert r.status_code == 401


# ─── Candidate workflow ───────────────────────────────────────────────────────

def test_candidate_profile_get_and_create(db: Session):
    _, token = _get_or_create_user(db, "cand_phase3@test.com", "candidate")
    r = client.get("/api/v1/candidates/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert "education_history" in body
    assert "career_interests" in body
    assert "user_id" in body


def test_candidate_profile_update(db: Session):
    _, token = _get_or_create_user(db, "cand_phase3_upd@test.com", "candidate")
    r = client.patch(
        "/api/v1/candidates/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"education_level": "GRADUATE", "current_status": "SEEKING_JOB"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["education_level"] == "GRADUATE"


def test_candidate_add_education(db: Session):
    _, token = _get_or_create_user(db, "cand_edu@test.com", "candidate")
    r = client.post(
        "/api/v1/candidates/me/education",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "institution_name": "IIT Pune",
            "education_level": "GRADUATE",
            "stream_specialization": "Computer Science",
            "passing_year": 2022,
            "marks_percentage": 85.5,
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["institution_name"] == "IIT Pune"
    assert "id" in body


def test_candidate_education_delete(db: Session):
    _, token = _get_or_create_user(db, "cand_edu_del@test.com", "candidate")
    # Add then delete
    r1 = client.post(
        "/api/v1/candidates/me/education",
        headers={"Authorization": f"Bearer {token}"},
        json={"institution_name": "DeleteMe University", "education_level": "DIPLOMA"},
    )
    assert r1.status_code == 201
    edu_id = r1.json()["id"]

    r2 = client.delete(
        f"/api/v1/candidates/me/education/{edu_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r2.status_code == 200
    assert r2.json()["message"] == "Deleted successfully"


def test_candidate_skill_gaps(db: Session):
    _, token = _get_or_create_user(db, "cand_gaps@test.com", "candidate")
    r = client.get("/api/v1/candidates/me/skill-gaps",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ─── RBAC cross-role tests ────────────────────────────────────────────────────

def test_employer_cannot_access_candidate_me(db: Session):
    _, token = _get_or_create_user(db, "emp_rbac@test.com", "employer")
    r = client.get("/api/v1/candidates/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


def test_candidate_cannot_access_government(db: Session):
    _, token = _get_or_create_user(db, "cand_gov@test.com", "candidate")
    r = client.get("/api/v1/government/placements",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


def test_government_admin_can_access_demand(db: Session):
    _, token = _get_or_create_user(db, "gov_admin@test.com", "government_admin")
    r = client.get("/api/v1/government/demand",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_government_training_supply_placeholder(db: Session):
    _, token = _get_or_create_user(db, "gov_ts@test.com", "government_admin")
    r = client.get("/api/v1/government/training-supply",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "NOT_YET_AVAILABLE"


def test_training_provider_capacity_placeholder(db: Session):
    _, token = _get_or_create_user(db, "tp_cap@test.com", "training_provider")
    r = client.get("/api/v1/training-providers/me/capacity",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "NOT_YET_AVAILABLE"


def test_career_guidance_requires_auth():
    r = client.get("/api/v1/career-guidance")
    assert r.status_code == 401


def test_career_guidance_authenticated(db: Session):
    _, token = _get_or_create_user(db, "cand_cg@test.com", "candidate")
    r = client.get("/api/v1/career-guidance",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_placements_me_requires_auth():
    r = client.get("/api/v1/placements/me")
    assert r.status_code == 401


def test_placements_me_candidate(db: Session):
    _, token = _get_or_create_user(db, "cand_place@test.com", "candidate")
    r = client.get("/api/v1/placements/me",
                   headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_invalid_token_rejected():
    r = client.get("/api/v1/candidates/me",
                   headers={"Authorization": "Bearer not.a.real.token"})
    assert r.status_code == 401
