# Database Seed Data

This directory will contain seed SQL scripts and seed data files for SkillMitra.

## Planned Seed Files

| File | Description |
|---|---|
| `seed_skills.sql` | Populate canonical skill taxonomy |
| `seed_roles.sql` | Populate role reference data |
| `seed_districts.sql` | Populate Indian district reference data |
| `seed_sectors.sql` | Populate industry sector data |
| `seed_sample_jobs.sql` | Sample job posting data for development |

> Seed files will be implemented alongside schema migrations.

## Running Seeds

```bash
python scripts/seed_db.py
```
