"""
Authentication routes:
  POST /api/v1/auth/login
  POST /api/v1/auth/refresh
  POST /api/v1/auth/logout
  GET  /api/v1/auth/me
"""

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.config import settings
from app.core.database import get_db
from app.schemas.auth import AuthResponse, LoginRequest, UserPublic
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
