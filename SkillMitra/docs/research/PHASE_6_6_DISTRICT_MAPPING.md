# Phase 6.6 — District Mapping: Maharashtra Real Skills Dataset

Status: **REVIEW_REQUIRED**. No canonical import until reviewed.
Author: SkillMitra Phase 6.6. Date: 2026-08-28.

---

## Mapping Table

| Source Value | Canonical District | Status | Reason | Evidence Required |
|---|---|---|---|---|
| Amravati | Amravati | EXACT MATCH | Exact name match in `public.districts` | None |
| Aurangabad | Chhatrapati Sambhajinagar | REVIEW_REQUIRED | Government of Maharashtra renamed Aurangabad district to Chhatrapadi Sambhajinagar. Exact match does not exist. | Official government order/notification confirming rename |
| Kolhapur | Kolhapur | EXACT MATCH | Exact name match in `public.districts` | None |
| Mumbai | — | INSUFFICIENT_EVIDENCE | Ambiguous: `Mumbai City` and `Mumbai Suburban` both exist in canonical table. Source does not specify which. | Clarification from data provider |
| Nagpur | Nagpur | EXACT MATCH | Exact name match in `public.districts` | None |
| Nashik | Nashik | EXACT MATCH | Exact name match in `public.districts` | None |
| Navi Mumbai | — | INSUFFICIENT_EVIDENCE | Not present in canonical districts table. Navi Mumbai is a planned city spanning multiple districts. | Official district definition or canonical mapping |
| Pune | Pune | EXACT MATCH | Exact name match in `public.districts` | None |
| Solapur | Solapur | EXACT MATCH | Exact name match in `public.districts` | None |
| Thane | Thane | EXACT MATCH | Exact name match in `public.districts` | None |

---

## Special Cases

### Aurangabad → Chhatrapati Sambhajinagar
- The Government of Maharashtra officially renamed Aurangabad district to Chhatrapati Sambhajinagar.
- The canonical `districts` table contains `Chhatrapati Sambhajinagar` (not `Aurangabad`).
- **This mapping is prepared as a REVIEW_REQUIRED proposal.**
- It must NOT be applied automatically.
- Requires documented approval based on official government notification.

### Mumbai → Mumbai City / Mumbai Suburban
- The source value `Mumbai` does not map to exactly one canonical district.
- `Mumbai City` and `Mumbai Suburban` are distinct districts in the canonical table.
- **No mapping can be made without disambiguation.**
- Rows with `Mumbai` must remain blocked until the data provider clarifies which district each entry refers to.

### Navi Mumbai → No canonical district
- `Navi Mumbai` is a planned city/township, not a standalone district.
- It spans parts of Thane, Raigad, and Mumbai Suburban districts.
- The canonical `districts` table does not contain `Navi Mumbai`.
- **No mapping can be made.**
- Rows with `Navi Mumbai` must remain blocked until:
  - The data provider clarifies which canonical district each entry belongs to, OR
  - The canonical districts table is officially expanded (requires approval).

---

## Dataset Coverage

- **Total unique districts in dataset:** 10
- **Exact matches:** 7 (Amravati, Kolhapur, Nagpur, Nashik, Pune, Solapur, Thane)
- **Review required:** 1 (Aurangabad → Chhatrapati Sambhajinagar)
- **Insufficient evidence:** 2 (Mumbai, Navi Mumbai)

---

## Do NOT

- Auto-apply the Aurangabad → Chhatrapati Sambhajinagar mapping.
- Map Mumbai to either Mumbai City or Mumbai Suburban without clarification.
- Create a new Navi Mumbai district record.
- Invent district mappings for any other unmatched values.
