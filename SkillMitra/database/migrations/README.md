# Database Migrations

This directory will contain SQL migration files for SkillMitra's Supabase PostgreSQL database.

## Migration Strategy

Migrations will be numbered sequentially:

```
migrations/
├── 001_initial_schema.sql
├── 002_add_pgvector.sql
├── 003_seed_skill_taxonomy.sql
└── ...
```

## Running Migrations

Migration execution scripts will be provided in `scripts/`.

> Migrations will be implemented after the ER model and schema design are finalized.
