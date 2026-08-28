# Database Schema

This directory will contain the Supabase PostgreSQL schema definitions for SkillMitra.

## Planned Tables (to be finalized after ER model design)

| Table | Description |
|---|---|
| `skills` | Canonical skill taxonomy |
| `roles` | Job roles and titles |
| `job_postings` | Aggregated job posting data |
| `courses` | Training courses and qualifications |
| `institutions` | Training providers and institutions |
| `districts` | Geographic district reference data |
| `skill_demand` | Aggregated skill demand signals |
| `skill_gap` | Computed skill gap records |
| `employers` | Employer profiles |
| `candidates` | Candidate profiles (future) |
| `skill_embeddings` | pgvector skill embeddings |

> Schema will be implemented after the ER model is reviewed and approved by the team.

## Extensions Required

```sql
CREATE EXTENSION IF NOT EXISTS vector; -- pgvector for semantic search
```
