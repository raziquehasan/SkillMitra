# SkillMitra Phase 2D — Custom FastAPI Authentication + JWT + RBAC

## Architecture

Custom authentication fully controlled by our FastAPI backend.
**Supabase Auth is NOT used.**

### Stack
- FastAPI
- SQLAlchemy 2.x + PostgreSQL
- JWT (python-jose, HS256)
- Argon2 password hashing (pwdlib)
- HTTP-only secure cookies for refresh tokens

## Database Tables Added

| Table | Purpose |
|---|---|
| `roles` | RBAC role definitions |
| `user_roles` | M:M junction users ↔ roles |
| `refresh_tokens` | Hashed refresh tokens with rotation/revocation |

### Columns Added to Existing Tables

| Table | Column | Type |
|---|---|---|
| `users` | `hashed_password` | VARCHAR(255) nullable |
| `users` | `last_login_at` | TIMESTAMPTZ nullable |

## Roles (Seeded)
- `candidate` — job-seeking candidate/student
- `employer` — employer posting jobs
- `training_provider` — training institute
- `government_admin` — Maharashtra admin (privileged, not self-assignable)

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Email + password login |
| POST | `/api/v1/auth/refresh` | Rotate refresh token, issue new access token |
| POST | `/api/v1/auth/logout` | Revoke refresh token, clear cookie |
| GET | `/api/v1/auth/me` | Get current authenticated user info |

## JWT Strategy
- **Access token**: Short-lived (default 30 min), contains `sub`, `roles`, `jti`, `type`, `iat`, `exp`
- **Signing**: HS256 with configurable `JWT_SECRET_KEY`
- No sensitive data (password, phone) in JWT payload

## Refresh Token Strategy
- Raw token generated with `secrets.token_urlsafe(64)`
- Only SHA-256 **hash** stored in database (never the raw value)
- Tokens support: expiration, revocation (`revoked_at`), rotation (`replaced_by_token_id`)
- Delivered via HTTP-only cookie
- On refresh: old token revoked → new token issued → new access token issued

## RBAC
- `require_roles("candidate")` — FastAPI dependency
- 401 for unauthenticated, 403 for wrong role
- Roles are normalized via `roles` + `user_roles` tables

## Environment Variables
```
JWT_SECRET_KEY=<change-me>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
COOKIE_SECURE=False         # True in production
COOKIE_HTTPONLY=True
COOKIE_SAMESITE=lax
PASSWORD_MIN_LENGTH=8
```

## Migration
```
e78b6ce1483f_phase2d_auth.py
```

## Security Decisions
1. Argon2 for password hashing (memory-hard, side-channel resistant)
2. Refresh tokens hashed with SHA-256 before storage
3. Token rotation on every refresh (prevents reuse)
4. CORS locked to localhost:3000 (not wildcard with credentials)
5. government_admin role exists but has no public registration path

## Local Development
```bash
cd backend
alembic upgrade head
python -m app.seeds.roles
uvicorn app.main:app --reload
```

## Test Commands
```bash
pytest tests/test_db_phase2a.py -v
pytest tests/test_db_phase2b.py -v
pytest tests/test_db_phase2c.py -v
pytest tests/test_auth.py -v
alembic check
```
