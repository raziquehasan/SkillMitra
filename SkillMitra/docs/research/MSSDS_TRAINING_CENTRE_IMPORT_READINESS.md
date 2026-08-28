# MSSDS Training Centre Directory — Import Readiness

Status: **READ-ONLY PREPARATION**. No import, no scraping of the paginated HTML,
no schema change, no migration. Author: SkillMitra Phase 6.3. Date: 2026-08-28.
Source-of-truth: `docs/research/PHASE_6_2_DATA_SOURCES.md` (CONDITIONAL-GO).

> **Important:** The directory is a public, paginated HTML listing. Visible HTML is **not**
> treated as an API, and automated retrieval is **not** assumed to be permitted. This
> document only prepares the mapping and blockers; it does **not** capture the directory.

---

## 1. Existing provider-related entities

| Entity | Key columns (relevant) |
|---|---|
| `training_providers` | `id`, **`user_id` (NOT NULL, UNIQUE)**, `district_id` (**NOT NULL**), `name`, `contact_person`, `phone`, `provider_type` (`government`/`private`/`ngo`/`ppp`), `registration_number` (UNIQUE, null allowed), `status`, `verification_status`, `submitted_at`, `reviewed_by_user_id`, `reviewed_at`, `review_notes` |
| `course_offerings` | `id`, `provider_id` (FK), `course_id` (FK), `district_id` (FK), `sanctioned_seats`, `active_seats`, `utilized_seats`, `status`; unique `(provider_id, course_id, district_id)` |
| `courses` | `id`, `title`, `source_course_code`, `nqr_code`, `source_version`, `nsqf_level`, `qualification`, `industry_sector_id`, `data_source_id`, ... |
| `districts` | `id`, `state_id`, `name`, `code` (state `MH`, 36 official districts) |
| `industry_sectors` | `id`, `name`, `code` (master; currently **empty**) |
| `equipment` / `trainers` | provider-scoped capacity/asset records |

---

## 2. MSSDS directory fields (visible)

`scheme`, `sector`, `district`, `city`, `VTP name`, `address`, `phone`, `email`, `courses`

---

## 3. Field-by-field mapping

| MSSDS directory field | Target | Status |
|---|---|---|
| VTP name | `training_providers.name` (String 255, NOT NULL) | **SUPPORTED** |
| District | `training_providers.district_id` (FK, NOT NULL) | **PARTIAL** — must exact-match a canonical Maharashtra district name; no fuzzy/invented mapping |
| Scheme | — | **MISSING** — no scheme/scheme-code column on `training_providers` |
| Sector | `industry_sector_id` | **BLOCKED** — `industry_sectors` master empty; no source-sector column |
| City | — | **MISSING** — no `city` column on `training_providers` |
| Address | — | **MISSING** — no `address` column on `training_providers` |
| Phone | `training_providers.phone` (String 20) | **SUPPORTED** (privacy review required) |
| Email | — | **MISSING** — no `email` column on `training_providers`; `contact_person` is a name, not email |
| Courses | `course_offerings.course_id` (FK) | **PARTIAL/BLOCKED** — depends on `courses` being populated (Course Master import) and course matching |

---

## 4. District mapping strategy

- `training_providers.district_id` is **NOT NULL**.
- Map only by **exact name match** against the canonical `districts` table (state `MH`).
- **Do not invent mapping.** A directory value that does not exactly match a canonical
  district name → `INSUFFICIENT_EVIDENCE` / reject (or leave unimported), never coerce.

---

## 5. Course mapping strategy

- `course_offerings.course_id` references `courses`.
- A directory "courses" value must map to a canonical course by `(source_course_code +
  source_version)` / `nqr_code` (in line with the Course Master contract).
- **Sequencing dependency:** Courses must be imported (Course Master) **before** provider
  course mappings; unmap‑pable course values → `INSUFFICIENT_EVIDENCE` (nullable course is
  **not** allowed on a `course_offerings` row).

---

## 6. Provider identity strategy

- `training_providers.user_id` is **NOT NULL and UNIQUE** — **hard blocker**. MSSDS VTPs are
  **not** SkillMitra `users`. Without a linked user account, a provider row cannot be
  inserted under the current schema.
- Secondary identity candidates: `name + district_id`; `registration_number` (UNIQUE but
  directory does not provide it).
- **Blocked** until the `user_id` requirement is reconsidered or an alternate provider
  identity is approved.

---

## 7. Duplicate handling

- `registration_number` unique — null allowed (multiple NULLs permitted).
- No unique on `name + district`; a natural dedupe key is `(name, district_id)` but it is
  not enforced.
- `course_offerings` unique `(provider_id, course_id, district_id)` prevents duplicate
  offerings per scope.
- Duplicate provider detection rule: same provider identity (name + district, or
  registration_number) → dedupe, do not create a second row; conflicting attributes →
  block for review.

---

## 8. Contact-field privacy concerns

- `phone` is **PII**. `contact_person` is a name (also personal data).
- Directory exposes `address` and `email`, which the `training_providers` table **cannot**
  store (no columns).
- **Privacy review is required** before storing phone/contact_person, and any direct
  import of email/address would require a schema decision + consent/legitimate-basis
  review. Raw directory HTML must not be persisted without an approved basis.

---

## 9. Provenance requirements

Record `data_source_id` (MSSDS directory), official source URL, retrieval date,
source record ID (provider/vtp identity), source file/API version (or "paginated-HTML,
not captured"), ingestion run ID, transformation version, mapping status, validation
status. `training_providers` has no `source_*` columns — provenance lives in
`data_ingestion_runs` / a raw staging record (see `DATA_SOURCE_CONTRACTS.md`). Directory
sources are not captured here.

---

## 10-11. Capacity fields

**Capacity fields actually available from the source:**
- **None.** The directory lists scheme/sector/district/city/VTP name/phone/email and
  courses. It does **not** provide seat counts, batch size, trainer, or equipment numbers.

**Capacity fields NOT available from the source:**
- `course_offerings.sanctioned_seats`, `active_seats`, `utilized_seats`.
- Per‑provider capacity (trainers, equipment) in `trainers` / `equipment`.
- Any batch/session capacity or utilization metric.

> The schema **can** represent capacity (via `course_offerings` + `equipment` + `trainers`),
> but the MSSDS directory does **not** supply those values. Such fields must remain
> **empty/unknown** rather than defaulted or inferred.

---

## 12. PS evidence support

| Evidence | Support from this source |
|---|---|
| **G — Training providers** | **Potential (blocked)** — provider rows could be created, but `user_id` NOT NULL/UNIQUE and missing scheme/city/address/email/sector columns block a faithful import. |
| **H — Training capacity** | **NOT AVAILABLE** — source has no seat/capacity data; capacity schema exists but cannot be populated from this directory. |

G is **CONDITIONAL-GO** only after resolving the `user_id` requirement and adding the
missing columns; H is **NOT SUPPORTED** by this source.

---

## 13. Validation rules (Training Centre)

- **Provider identity:** must be resolvable to a `training_providers` record; today requires
  a `user`. Otherwise reject.
- **District must map to canonical Maharashtra district:** exact name match only; no
  invention.
- **Duplicate provider detection:** dedupe on identity (name+district or registration_number);
  conflicting attributes → block for review.
- **Course mapping validation:** course value must map to a canonical `courses` row; unmap‑pable
  → `INSUFFICIENT_EVIDENCE`.
- **Contact information handling:** privacy review; store only approved fields; do not persist
  raw directory HTML/email/address without an approved basis.
- **Provenance:** every record must carry the provenance contract fields; absent required
  fields → `INSUFFICIENT_EVIDENCE`.

---

## 14. Exact reason the current source is NOT importable

1. **`training_providers.user_id` is NOT NULL and UNIQUE** — no SkillMitra `user` exists for
   MSSDS VTPs.
2. **Missing columns** — no `scheme`, `city`, `address`, `email`, or source‑sector field; the
   directory data cannot be faithfully represented.
3. **No structured export/API** — a public paginated HTML listing is not a machine-readable
   export; automated retrieval is not permitted/verified.
4. **Course mapping dependency** — requires the Course Master import to succeed first.
5. **Capacity not available** — no seat/capacity data → **H** cannot be supported.

No directory capture, no import, no schema change, no migration is performed.
