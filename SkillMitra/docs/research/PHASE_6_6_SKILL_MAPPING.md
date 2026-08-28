# Phase 6.6 — Skill Mapping: Maharashtra Real Skills Dataset

Status: **REVIEW_REQUIRED**. No canonical import until reviewed.
Author: SkillMitra Phase 6.6. Date: 2026-08-28.

---

## Summary

| Category | Count |
|---|---|
| Total unique skills in dataset | 35 |
| Existing skills in DB | 46 |
| Exact matches | 1 |
| Ambiguous matches | 6 |
| Unmatched | 28 |

---

## Matched Skills (Exact)

| Source Value | Canonical Skill | Notes |
|---|---|---|
| Networking | Networking | Exact match |

---

## Ambiguous Skills (Partial Overlap)

| Source Value | Candidate Canonical Skill | Match Type | Reason | Decision |
|---|---|---|---|---|
| Git | Digital Tools | PARTIAL_SINGLE | Git is a specific version-control tool; "Digital Tools" is a broader category covering multiple tools. | DO NOT auto-map |
| Hardware Troubleshooting | Hardware | PARTIAL_SINGLE | Hardware Troubleshooting is a diagnostic/repair skill; "Hardware" is a general category. | DO NOT auto-map |
| MIG Welding | Welding | PARTIAL_SINGLE | MIG is a specific welding process; "Welding" covers multiple processes. | DO NOT auto-map |
| Motor Diagnostics | Diagnostics | PARTIAL_SINGLE | Motor Diagnostics is specific to motors; "Diagnostics" is general. | DO NOT auto-map |
| Python | Python Programming | PARTIAL_SINGLE | "Python" (language) vs "Python Programming" (skill name). Close but not exact. | DO NOT auto-map |
| Safety | Industrial Safety | PARTIAL_SINGLE | "Safety" is general; "Industrial Safety" is specific to industrial contexts. | DO NOT auto-map |

---

## Unmatched Skills (Pending Review)

| Source Value | Occurrences | Notes |
|---|---|---|
| Battery Mgmt Systems | 7 | EV-specific battery management |
| Basic Data Management | 6 | Data handling fundamentals |
| Basic SQL | 6 | SQL query fundamentals |
| Blood Collection | 1 | Healthcare/medical skill |
| Blueprint Reading | 1 | Technical drawing interpretation |
| CNC Programming | 6 | CNC machine programming |
| Compressor Repair | 5 | HVAC/refrigeration repair |
| Customer Service | 5 | Retail/service skill |
| Electrical Basics | 5 | Electrical fundamentals |
| First Aid | 6 | Emergency healthcare |
| Gas Charging | 5 | HVAC refrigerant handling |
| Hygiene | 6 | Healthcare/cleanliness |
| Infection Control | 1 | Healthcare safety |
| Inventory Basics | 6 | Inventory management |
| Inverter Wiring | 3 | Solar/electrical wiring |
| Java | 6 | Programming language |
| Load Calculation | 3 | Electrical/structural calculation |
| MS Office | 6 | Office software suite |
| OS Installation | 4 | Operating system setup |
| Panel Mounting | 3 | Solar panel installation |
| Patient Care | 6 | Healthcare patient management |
| Precision Machining | 6 | CNC/machining precision work |
| Safety Standards | 5 | Industrial safety compliance |
| Sample Handling | 1 | Laboratory/medical sample management |
| Tool Setting | 6 | CNC/machining tool setup |
| Typing | 6 | Data entry/typing skill |
| Vitals Monitoring | 6 | Healthcare vital signs measurement |

---

## Do NOT

- Create new skill records for unmatched values.
- Auto-resolve ambiguous matches.
- Modify existing skill definitions.

---

## What Would Resolve This

1. Domain expert review of each unmatched skill.
2. Decision on whether to:
   - Map to existing canonical skills (where semantically equivalent).
   - Create new canonical skills (where genuinely new).
   - Merge similar skills into broader categories.
