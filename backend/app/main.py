"""
SkillMitra Backend - FastAPI Application Entry Point
SIH 2026 - Problem Statement 26134
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router

app = FastAPI(
    title="SkillMitra API",
    description=(
        "Labour Market Intelligence and Curriculum Alignment Platform. "
        "SIH 2026 - Problem Statement 26134."
    ),
    version="0.1.0",
)

# CORS Middleware — tightened: no wildcard with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Routers
app.include_router(auth_router)


@app.get("/", tags=["Root"])
async def root_endpoint() -> dict:
    return {
        "message": "Welcome to SkillMitra API",
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    return {"status": "ok", "service": "skillmitra-backend"}
