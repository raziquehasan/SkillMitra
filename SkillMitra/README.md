# SkillMitra

**SIH 2026 — Problem Statement 26134**

> *Challenges in aligning skill development programs with industry requirements and emerging job market demands.*

---

## 1. Problem Overview

India faces a persistent and growing mismatch between the skills produced by its educational and vocational training system and the skills demanded by industry. Skill development programs are often designed based on outdated curricula, limited employer input, and insufficient intelligence about evolving job market dynamics. This results in unemployable graduates, unfilled industry positions, and wasted public investment in training infrastructure.

---

## 2. Objective

Build a **Labour Market Intelligence and Curriculum Alignment Platform** that aggregates signals from:

- Job postings and employer listings
- Employer surveys and industry consultations
- Sector growth and investment data
- Placement and outcome data
- Emerging technology and industry trends

to produce actionable intelligence on skill demand by role, skill, location, and proficiency level.

---

## 3. Proposed Solution

**SkillMitra** is a data-driven platform that bridges the gap between skill development programs and industry demand. It combines labour market signal processing, semantic skill analysis, and curriculum intelligence to:

- Surface what skills industry actually needs, where, and at what level
- Identify gaps between existing training outputs and market demand
- Map those gaps to specific courses and qualifications
- Generate targeted curriculum recommendations
- Support district-level training and resource planning
- Guide candidates toward high-demand career pathways

---

## 4. Core Features

| Feature | Description |
|---|---|
| **Skill Demand Intelligence** | Identifies in-demand roles, skills, and proficiency levels from multi-source signals |
| **Skill Gap Analysis** | Compares industry demand against available training output |
| **Curriculum Alignment** | Maps skill gaps to specific courses and recommends updates |
| **Obsolescence Detection** | Flags oversupplied or obsolete courses and skills |
| **Employer Validation** | Enables employers to validate and signal skill demand |
| **District-Level Planning** | Generates district-specific training and resource plans |
| **Trainer & Equipment Planning** | Supports training capacity planning |
| **Candidate Career Guidance** | Provides demand-driven career path recommendations |

---

## 5. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (TypeScript, App Router, Tailwind CSS, ESLint) |
| **Backend** | FastAPI (Python 3, Uvicorn, Pydantic, pydantic-settings) |
| **Database** | Supabase PostgreSQL + pgvector |
| **ML / AI** | Python, pandas, numpy, scikit-learn, sentence-transformers |
| **Deployment** | Vercel (Frontend), Render + Docker (Backend), Supabase (DB) |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SkillMitra                           │
├────────────────┬────────────────┬────────────────────────────┤
│   Frontend     │    Backend     │      ML / Intelligence     │
│  (Next.js)     │  (FastAPI)     │  (Python ML Modules)       │
│  Vercel        │  Render+Docker │                            │
├────────────────┴────────────────┴────────────────────────────┤
│                  Supabase PostgreSQL + pgvector              │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Repository Structure

```
SkillMitra/
├── frontend/          # Next.js TypeScript frontend
├── backend/           # FastAPI Python backend
├── ml/                # ML and intelligence modules
├── database/          # Schema, migrations, seed
├── data/              # Raw, processed, sample data
├── docs/              # Architecture, API, research docs
├── scripts/           # Utility and automation scripts
├── .github/           # GitHub Actions CI/CD workflows
├── .env.example       # Environment variable template
├── .gitignore
├── docker-compose.yml
├── README.md
└── LICENSE.md
```

---

## 8. Development Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- A Supabase project (for later phases)

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/health
```

### Docker (Full Stack)

```bash
docker-compose up --build
```

---

## 9. Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL for frontend |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) |
| `DATABASE_URL` | Full PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (future auth) |

> ⚠️ Never commit `.env` or any file containing real credentials.

---

## 10. Team

**Smart India Hackathon 2026 — Team**

| Role | Responsibility |
|---|---|
| Team Lead | Architecture, coordination |
| Frontend Developer | Next.js UI, UX |
| Backend Developer | FastAPI, APIs |
| ML Engineer | Skill intelligence, NLP |
| Data Engineer | Data pipelines, Supabase |

> Team members and institution details will be added here.

---

*Built for Smart India Hackathon 2026 — Problem Statement 26134*
