# Database Documentation

This directory contains database design documentation for SkillMitra.

## Planned Documents

- `er-diagram.md` — Entity Relationship diagram
- `schema-design.md` — Detailed table and column definitions
- `indexing-strategy.md` — Index design for performance
- `pgvector-usage.md` — Vector embedding storage and similarity search design
- `migrations-guide.md` — How to run and write migrations

## Database

- **Provider**: Supabase (managed PostgreSQL)
- **Extensions**: pgvector (for semantic skill embedding search)
- **ORM**: Raw SQL / Supabase client (no ORM planned at this stage)

> Database schema will be designed and implemented in a dedicated phase after the ER model is finalized.
