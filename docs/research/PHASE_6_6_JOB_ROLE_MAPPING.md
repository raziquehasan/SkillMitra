# Phase 6.6 — Job Role Mapping: Maharashtra Real Skills Dataset

Status: **REVIEW_REQUIRED**. No canonical import until reviewed.
Author: SkillMitra Phase 6.6. Date: 2026-08-28.

---

## Summary

| Category | Count |
|---|---|
| Total unique roles in dataset | 11 |
| Existing roles in DB | 78 |
| Exact matches | 4 |
| Unmatched | 7 |

---

## Matched Roles (Exact)

| Source Value | Canonical Role ID | Canonical Role Title | Notes |
|---|---|---|---|
| CNC Operator | (exists in DB) | CNC Operator | Exact match |
| Data Entry Operator | (exists in DB) | Data Entry Operator | Exact match |
| Software Developer | (exists in DB) | Software Developer | Exact match |
| Welder | (exists in DB) | Welder | Exact match |

---

## Unmatched Roles (Pending Review)

| Source Value | Occurrences | Closest Canonical Role | Gap | Decision |
|---|---|---|---|---|
| AC/Fridge Repair Tech | 5 | Home Appliance Technician | Different scope: AC/Fridge is HVAC-specific; Home Appliance is broader. | DO NOT auto-map |
| EV Mechanic | 7 | EV Service Technician | Very close; "Mechanic" vs "Service Technician" is a minor naming difference but different scope. | DO NOT auto-map |
| IT Support Executive | 4 | IT Support Technician | "Executive" implies business/management context; "Technician" implies technical. | DO NOT auto-map |
| Nursing Assistant | 6 | Healthcare Worker | "Nursing Assistant" is a specific clinical role; "Healthcare Worker" is a broad category. | DO NOT auto-map |
| Phlebotomist | 1 | — | No equivalent in DB. Specialized medical lab skill. | DO NOT create |
| Solar Installer | 3 | Solar PV Installer | "Solar Installer" vs "Solar PV Installer" — PV is a specific technology subset. | DO NOT auto-map |
| Store Sales Executive | 5 | Front Office Executive | "Store Sales" is retail-specific; "Front Office" is general business. | DO NOT auto-map |

---

## Do NOT

- Create new job role records for unmatched values.
- Auto-resolve near-matches.
- Modify existing role definitions.

---

## What Would Resolve This

1. Domain expert review of each unmatched role.
2. Decision on whether to:
   - Map to existing canonical roles (where semantically equivalent).
   - Create new canonical roles (where genuinely new).
   - Merge similar roles into broader categories.
