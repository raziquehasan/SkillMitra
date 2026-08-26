# Recommendation Module

## Purpose

Generate actionable recommendations for:

1. **Curriculum updates** — flag outdated content and suggest additions
2. **Course obsolescence** — identify oversupplied or low-demand courses
3. **Career guidance** — suggest demand-aligned career paths for candidates
4. **Training planning** — district-level trainer and equipment recommendations

## Planned Approach

- Rule-based + ML hybrid recommendation engine
- Skill gap → course mapping using semantic matching
- Candidate profile → career path matching using demand signals
- Curriculum gap score per course/qualification

## Inputs

- Skill gap analysis output (demand vs. supply delta)
- Skill demand forecasts
- Course/qualification database
- Candidate skill profiles (future)

## Outputs

- Curriculum update recommendations per course
- Obsolescence risk flags per course
- Career path recommendations per candidate profile
- District training plan inputs

## Libraries

- `scikit-learn`
- `sentence-transformers`
- `pandas`, `numpy`

## Status

🔲 **Not yet implemented** — Placeholder for future development phase.
