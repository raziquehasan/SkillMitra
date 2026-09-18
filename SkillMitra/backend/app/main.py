from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, candidates, skills, courses, jobs, employers, applications, placements, career_guidance, demand, government, industry, training_providers, phase4, phase5, phase6, sih, geography, job_roles, ai_chatbot, employer_intelligence, career_planning, resume, training_recommendations, job_recommendations
from app.core.config import settings

app = FastAPI(
    title="SkillMitra API",
    version="1.0.0",
    description="Maharashtra Government Skill Development Platform - Phase 3 Business APIs"
)

# Parse CORS origins from environment variable
cors_origins_str = settings.CORS_ALLOWED_ORIGINS.strip()

# Handle wildcard for development
if cors_origins_str == "*":
    cors_origins = ["*"]
    allow_credentials = False
else:
    cors_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]
    allow_credentials = True

# Add CORS middleware with explicit configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

# Add OPTIONS handler for preflight requests
@app.options("/{path:path}")
async def options_handler(path: str):
    return {"status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "skillmitra-backend"}

# Register Routers
app.include_router(auth.router)
app.include_router(candidates.router)
app.include_router(skills.router)
app.include_router(courses.router)
app.include_router(jobs.router)
app.include_router(employers.router)
app.include_router(applications.router)
app.include_router(placements.router)
app.include_router(career_guidance.router)
app.include_router(demand.router)
app.include_router(government.router)
app.include_router(industry.router)
app.include_router(training_providers.router)
app.include_router(phase4.router)
app.include_router(phase5.router)
app.include_router(phase6.router)
app.include_router(sih.router)
app.include_router(geography.router)
app.include_router(job_roles.router)
app.include_router(employer_intelligence.router)
app.include_router(career_planning.router)
app.include_router(resume.router)
app.include_router(training_recommendations.router)
app.include_router(job_recommendations.router)
app.include_router(ai_chatbot.router, prefix="/api/v1/ai", tags=["AI Chatbot"])
