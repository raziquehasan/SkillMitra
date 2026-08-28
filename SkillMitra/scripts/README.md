# Scripts

This directory contains utility and automation scripts for SkillMitra.

## Planned Scripts

| Script | Purpose |
|---|---|
| `ingest_jobs.py` | Ingest job posting data from raw sources |
| `clean_data.py` | Clean and normalize raw datasets |
| `seed_db.py` | Seed the Supabase database with sample data |
| `run_migrations.py` | Apply database migrations |
| `generate_embeddings.py` | Pre-compute skill embeddings for pgvector |

> Scripts will be implemented in later phases as data pipelines are built.

## Usage

All scripts should be run from the repository root:

```bash
python scripts/<script_name>.py
```
