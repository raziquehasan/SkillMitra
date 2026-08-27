# SkillMitra — Supabase PostgreSQL Integration
**Phase 2E — Database Hosting Migration**

## 1. Why Supabase PostgreSQL is used
Supabase is used strictly as the cloud-hosted PostgreSQL database provider for SkillMitra. It replaces the local Docker-based PostgreSQL instance for staging and production environments, providing a scalable, managed database solution while retaining full compatibility with the existing SQLAlchemy 2.x and Alembic stack.

## 2. Why Supabase Auth is NOT used
SkillMitra uses a custom FastAPI authentication system (Phase 2D) built with JWT, pwdlib (Argon2), and a normalized RBAC model. Supabase Auth is intentionally excluded to keep the application identity entity (`users` table) decoupled from external proprietary authentication services. All auth logic remains fully controlled within the FastAPI backend.

## 3. Connection Architecture
```text
Next.js
   ↓
FastAPI
   ↓
Custom JWT Authentication
   ↓
Custom RBAC
   ↓
SQLAlchemy 2.x (postgresql+psycopg)
   ↓
Supabase Hosted PostgreSQL (Session/Transaction Pooler)
```

## 4. Environment Variables
The application dynamically switches environments based on the `DATABASE_URL` environment variable.

```env
# Example .env configuration
DATABASE_URL=postgresql+psycopg://postgres.[project-ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```
*Note: The password must be percent-encoded if it contains special characters (e.g., `@` becomes `%40`).*

## 5. Local vs Supabase Environments
The project supports both local and remote database development:
- **LOCAL:** Configured via `DATABASE_URL=postgresql+psycopg://skillmitra@localhost:5433/skillmitra` using the `docker-compose.yml` stack.
- **SUPABASE (SHARED/STAGING):** Configured via the Supabase pooler URL.

Developers should manage their `backend/.env` file locally to switch between environments as needed.

## 6. Alembic Migration Process
Alembic remains the sole authority for database schema migrations.
To migrate the Supabase database:
1. Set `DATABASE_URL` in `backend/.env` to the Supabase connection string.
2. Run `alembic upgrade head` from the `backend/` directory.

**Never create tables manually in the Supabase SQL Editor.**

## 7. SSL/Security Expectations
Connections to Supabase PostgreSQL over the internet are encrypted by default. SQLAlchemy uses the `postgresql+psycopg` dialect which natively supports SSL.

## 8. Secret Management
- Database passwords **MUST NOT** be committed to Git.
- `backend/.env` and `.env` are listed in `.gitignore`.
- JWT secrets are also managed entirely via environment variables and must be rotated for production.

## 9. Deployment Considerations
- When deploying the FastAPI server to a cloud provider, set the `DATABASE_URL` environment variable securely in the provider's dashboard.
- The application does not depend on local PostgreSQL files or the local filesystem for database persistence.

## 10. Troubleshooting
- **Connection pooling errors:** If FastAPI exhausts connections, ensure Supabase connection pooling (Session pooler on port 6543) is used instead of direct connections (port 5432).
- **Interpolation Errors:** If Alembic fails with `ValueError: invalid interpolation syntax`, ensure the `%` symbol in the password is appropriately encoded or bypass ConfigParser in `env.py`.

## 11. Rollback Strategy
If the Supabase migration introduces issues, developers can revert to the local database by simply changing the `DATABASE_URL` in `.env` back to the localhost Docker instance. Migrations can be rolled back using `alembic downgrade [revision]`.
