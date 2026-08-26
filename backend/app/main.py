"""
SkillMitra Backend — FastAPI Application Entry Point
SIH 2026 — Problem Statement 26134
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SkillMitra API",
    description=(
        "Labour Market Intelligence and Curriculum Alignment Platform. "
        "SIH 2026 — Problem Statement 26134."
    ),
    version="0.1.0",
)

# ─────────────────────────────────────────────
# CORS Middleware (open in dev; lock down in prod)
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Health Check & Root
# ─────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root_endpoint() -> dict:
    """
    Root endpoint.
    """
    return {
        "message": "Welcome to SkillMitra API",
        "docs_url": "/docs",
        "health_url": "/health"
    }

@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """
    Health check endpoint.
    Returns service status for load balancers and monitoring.
    """
    return {
        "status": "ok",
        "service": "skillmitra-backend",
    }
