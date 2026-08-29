from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, candidates, skills, courses, jobs, employers, applications, placements, career_guidance, demand, government, industry, training_providers, phase4, phase5, phase6, sih, geography

app = FastAPI(
    title="SkillMitra API",
    version="1.0.0",
    description="Maharashtra Government Skill Development Platform - Phase 3 Business APIs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
