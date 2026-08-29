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
from app.models.auth import Role, UserRole
from app.models.identity import (
    User, CandidateProfile, Employer,
)
from app.models.phase4 import TrainingProvider
from app.models.phase8 import GovernmentOfficial


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

    # ── Registration (Phase 8 — SIH PS) ──────────────────────────────

    def _get_role(self, name: str) -> Role:
        role = self.db.query(Role).filter(Role.name == name).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"System role '{name}' is missing. Run role seed.",
            )
        return role

    def _create_user_with_role(self, *, full_name: str, email: str,
                               phone: str | None, password: str,
                               role_name: str) -> User:
        """Common identity creation + role assignment. Rolls back on dup email."""
        existing = self.repo.get_user_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists.",
            )
        validate_password_policy(password)
        user = User(
            full_name=full_name,
            email=email,
            phone=phone,
            hashed_password=hash_password(password),
            is_active=True,
        )
        self.db.add(user)
        self.db.flush()
        self.db.add(UserRole(user_id=user.id, role_id=self._get_role(role_name).id))
        return user

    def register_candidate(self, data) -> User:
        user = self._create_user_with_role(
            full_name=data.full_name, email=data.email, phone=data.phone,
            password=data.password, role_name="candidate",
        )
        profile = CandidateProfile(
            user_id=user.id,
            district_id=data.district_id,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            education_level=data.education_level,
        )
        self.db.add(profile)
        self.db.flush()
        if data.stream_specialization or data.education_level:
            from app.models.identity import CandidateEducationHistory
            self.db.add(CandidateEducationHistory(
                candidate_id=profile.id,
                education_level=data.education_level or "not_specified",
                stream_specialization=data.stream_specialization,
            ))
        self.db.commit()
        self.db.refresh(user)
        return user

    def register_employer(self, data) -> User:
        user = self._create_user_with_role(
            full_name=data.full_name, email=data.email, phone=data.phone,
            password=data.password, role_name="employer",
        )
        self.db.add(Employer(
            user_id=user.id,
            company_name=data.company_name,
            contact_person=data.contact_person or data.full_name,
            phone=data.phone,
            industry_sector_id=data.industry_sector_id,
            district_id=data.district_id,
            organization_type=data.organization_type,
            website=data.website,
            size_category=data.size_category,
            is_verified=False,
        ))
        self.db.commit()
        self.db.refresh(user)
        return user

    def register_training_provider(self, data) -> User:
        user = self._create_user_with_role(
            full_name=data.full_name, email=data.email, phone=data.phone,
            password=data.password, role_name="training_provider",
        )
        self.db.add(TrainingProvider(
            user_id=user.id,
            name=data.institute_name,
            contact_person=data.full_name,
            phone=data.phone,
            provider_type=data.provider_type,
            district_id=data.district_id,
            registration_number=data.registration_number,
            status="active",
        ))
        self.db.commit()
        self.db.refresh(user)
        return user

    def register_government_official(self, data) -> User:
        """
        Officials self-register but get NO dashboard role. They land in
        PENDING_VERIFICATION; the government_admin role is granted only
        after an existing admin approves them.
        """
        user = self._create_user_with_role(
            full_name=data.full_name, email=data.email, phone=data.phone,
            password=data.password, role_name="government_official",
        )
        self.db.add(GovernmentOfficial(
            user_id=user.id,
            department=data.department,
            designation=data.designation,
            district_id=data.district_id,
            employee_code=data.employee_code,
            verification_status="pending_verification",
        ))
        self.db.commit()
        self.db.refresh(user)
        return user

    def list_pending_officials(self) -> list[GovernmentOfficial]:
        return (
            self.db.query(GovernmentOfficial)
            .filter(GovernmentOfficial.verification_status == "pending_verification")
            .order_by(GovernmentOfficial.created_at)
            .all()
        )

    def review_government_official(self, *, official_id: uuid.UUID,
                                   decision: str, reviewer: User,
                                   review_notes: str | None = None) -> GovernmentOfficial:
        """
        Admin approval flow:
            PENDING_VERIFICATION -> APPROVED -> grant government_admin role
                                 -> REJECTED
        """
        official = self.db.query(GovernmentOfficial).filter(
            GovernmentOfficial.id == official_id
        ).first()
        if not official:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Government official registration not found.")
        if official.verification_status != "pending_verification":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="This registration has already been reviewed.")

        official.verification_status = decision
        official.reviewed_by_user_id = reviewer.id
        official.reviewed_at = datetime.now(timezone.utc)
        official.review_notes = review_notes

        if decision == "approved":
            admin_role = self._get_role("government_admin")
            already = self.db.query(UserRole).filter(
                UserRole.user_id == official.user_id,
                UserRole.role_id == admin_role.id,
            ).first()
            if not already:
                self.db.add(UserRole(user_id=official.user_id, role_id=admin_role.id))

        self.db.commit()
        self.db.refresh(official)
        return official

    def forgot_password(self, email: str) -> dict:
        user = self.repo.get_user_by_email(email)
        if not user:
            return {"message": "If an account with that email exists, a password reset link has been sent."}

        raw_token = generate_refresh_token()
        token_hash = hash_refresh_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        user.reset_token = token_hash
        user.reset_token_expires_at = expires_at
        self.db.commit()

        return {
            "message": "If an account with that email exists, a password reset link has been sent.",
            "reset_token": raw_token,
            "user_id": user.id,
        }

    def reset_password(self, token: str, new_password: str) -> dict:
        token_hash = hash_refresh_token(token)
        user = self.repo.get_user_by_reset_token(token_hash)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")

        now = datetime.now(timezone.utc)
        if user.reset_token_expires_at is None or user.reset_token_expires_at.replace(tzinfo=timezone.utc) < now:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired.")

        validate_password_policy(new_password)
        user.hashed_password = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires_at = None
        self.db.commit()

        return {"message": "Password has been reset successfully. You can now log in."}
