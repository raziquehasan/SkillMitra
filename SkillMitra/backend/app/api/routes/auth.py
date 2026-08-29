"""
Authentication routes:
  POST /api/v1/auth/register/candidate
  POST /api/v1/auth/register/employer
  POST /api/v1/auth/register/training-provider
  POST /api/v1/auth/register/government-official   (-> PENDING_VERIFICATION)
  POST /api/v1/auth/login
  POST /api/v1/auth/refresh
  POST /api/v1/auth/logout
  GET  /api/v1/auth/me
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user, require_roles
from app.core.config import settings
from app.core.database import get_db
from app.schemas.auth import (
    AuthResponse,
    CandidateRegistrationRequest,
    ForgotPasswordRequest,
    EmployerRegistrationRequest,
    GovernmentOfficialOut,
    GovernmentOfficialRegistrationRequest,
    GovernmentOfficialReviewRequest,
    LoginRequest,
    RegistrationResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TrainingProviderRegistrationRequest,
    UserPublic,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

_REFRESH_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=raw_token,
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86_400,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=_REFRESH_COOKIE)


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthResponse:
    svc = AuthService(db)
    result = svc.login(body.email, body.password, request)
    _set_refresh_cookie(response, result["raw_refresh_token"])
    return AuthResponse(
        user=result["user"],
        access_token=result["access_token"],
        expires_in=result["expires_in"],
    )


@router.post("/refresh", response_model=AuthResponse, status_code=status.HTTP_200_OK)
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthResponse:
    from fastapi import HTTPException
    raw_token = request.cookies.get(_REFRESH_COOKIE)
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token provided.")
    svc = AuthService(db)
    result = svc.refresh(raw_token)
    _set_refresh_cookie(response, result["raw_refresh_token"])
    return AuthResponse(
        user=result["user"],
        access_token=result["access_token"],
        expires_in=result["expires_in"],
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> dict:
    raw_token = request.cookies.get(_REFRESH_COOKIE)
    if raw_token:
        svc = AuthService(db)
        svc.logout(raw_token)
    _clear_refresh_cookie(response)
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserPublic, status_code=status.HTTP_200_OK)
def me(current_user=Depends(get_current_active_user)) -> UserPublic:
    roles = [ur.role.name for ur in current_user.user_roles]
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        roles=roles,
    )


# ── Registration (role-specific forms, one common entry point family) ────

@router.post("/register/candidate", response_model=RegistrationResponse,
             status_code=status.HTTP_201_CREATED)
def register_candidate(body: CandidateRegistrationRequest,
                       db: Session = Depends(get_db)) -> RegistrationResponse:
    user = AuthService(db).register_candidate(body)
    return RegistrationResponse(
        user=AuthService(db)._build_user_public(user),
        message="Candidate registered successfully. You can now log in.",
    )


@router.post("/register/employer", response_model=RegistrationResponse,
             status_code=status.HTTP_201_CREATED)
def register_employer(body: EmployerRegistrationRequest,
                      db: Session = Depends(get_db)) -> RegistrationResponse:
    user = AuthService(db).register_employer(body)
    return RegistrationResponse(
        user=AuthService(db)._build_user_public(user),
        message="Employer registered successfully. You can now log in.",
    )


@router.post("/register/training-provider", response_model=RegistrationResponse,
             status_code=status.HTTP_201_CREATED)
def register_training_provider(body: TrainingProviderRegistrationRequest,
                               db: Session = Depends(get_db)) -> RegistrationResponse:
    user = AuthService(db).register_training_provider(body)
    return RegistrationResponse(
        user=AuthService(db)._build_user_public(user),
        message="Training provider registered successfully. You can now log in.",
    )


@router.post("/register/government-official", response_model=RegistrationResponse,
             status_code=status.HTTP_201_CREATED)
def register_government_official(body: GovernmentOfficialRegistrationRequest,
                                 db: Session = Depends(get_db)) -> RegistrationResponse:
    """
    Officials self-register but receive NO dashboard access until an
    existing government admin approves the registration.
    """
    svc = AuthService(db)
    user = svc.register_government_official(body)
    return RegistrationResponse(
        user=svc._build_user_public(user),
        message="Registration submitted. Your account is pending verification by an administrator.",
        verification_status="pending_verification",
    )


# ── Government official approval (admin-only) ────────────────────────────

@router.get("/government-officials/pending",
            response_model=list[GovernmentOfficialOut])
def list_pending_officials(
    current_user=Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    return AuthService(db).list_pending_officials()


@router.post("/government-officials/{official_id}/review",
             response_model=GovernmentOfficialOut)
def review_government_official(
    official_id: uuid.UUID,
    body: GovernmentOfficialReviewRequest,
    current_user=Depends(require_roles("government_admin")),
    db: Session = Depends(get_db),
):
    """PENDING_VERIFICATION -> APPROVED (grants dashboard role) | REJECTED."""
    official = AuthService(db).review_government_official(
        official_id=official_id,
        decision=body.decision,
        reviewer=current_user,
        review_notes=body.review_notes,
    )
    return official


# ── Password reset ────────────────────────────────────────────────────────

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
    body: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    svc = AuthService(db)
    result = svc.forgot_password(body.email)
    return result


@router.post("/reset-password", response_model=ResetPasswordResponse,
             status_code=status.HTTP_200_OK)
def reset_password(
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    svc = AuthService(db)
    result = svc.reset_password(body.token, body.new_password)
    return result
