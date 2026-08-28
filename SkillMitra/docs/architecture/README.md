# Architecture Documentation

This directory contains system architecture documentation for SkillMitra.

## Planned Documents

- `system-overview.md` — High-level system architecture diagram and description
- `data-flow.md` — End-to-end data flow from ingestion to recommendation
- `component-diagram.md` — Frontend, backend, ML and database component relationships
- `deployment-architecture.md` — Vercel + Render + Supabase deployment topology
- `api-gateway.md` — API gateway and routing strategy

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (TypeScript, App Router, Tailwind CSS) |
| Backend | FastAPI (Python 3, Uvicorn, Pydantic) |
| Database | Supabase PostgreSQL + pgvector |
| ML/AI | Python, pandas, numpy, scikit-learn, sentence-transformers |
| Deployment | Vercel (FE), Render + Docker (BE), Supabase (DB) |
