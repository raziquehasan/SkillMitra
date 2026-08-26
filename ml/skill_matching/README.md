# Skill Matching Module

## Purpose

Match skills from different sources (job postings, course curricula, candidate profiles)
using semantic similarity to bridge naming inconsistencies.

## Planned Approach

- Generate sentence embeddings for each skill using `sentence-transformers`
- Store embeddings in Supabase `pgvector` for scalable vector similarity search
- Use cosine similarity to find semantically equivalent skills across sources
- Map skills to a canonical skill taxonomy

## Inputs

- Extracted skills from job postings
- Skills listed in training course curricula
- Candidate skill profiles

## Outputs

- Skill-to-skill similarity scores
- Canonical skill mappings
- Cross-source skill alignment matrix

## Libraries

- `sentence-transformers`
- `scikit-learn` (cosine similarity, clustering)
- `numpy`, `pandas`

## Status

🔲 **Not yet implemented** — Placeholder for future development phase.
