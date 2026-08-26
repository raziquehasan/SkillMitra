# Skill Extraction Module

## Purpose

Extract structured skills from unstructured text sources such as:

- Job posting descriptions
- Employer survey responses
- Industry consultation reports

## Planned Approach

- NLP-based Named Entity Recognition (NER) for skill entities
- Pattern matching against a skill taxonomy (NSQF / ESCO / O*NET)
- Sentence-level classification to identify skill mentions
- Normalization and deduplication of extracted skills

## Inputs

- Raw job posting text
- Employer survey free-text responses

## Outputs

- Structured list of skills with proficiency levels (where detectable)
- Skill confidence scores

## Libraries

- `sentence-transformers`
- NLP libraries (to be finalized)
- `pandas`, `numpy`

## Status

🔲 **Not yet implemented** — Placeholder for future development phase.
