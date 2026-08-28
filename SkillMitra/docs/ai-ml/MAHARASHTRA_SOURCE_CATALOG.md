# Maharashtra Source Catalog

## Approved and Reviewed Sources

| Source | Organization | Intended use | Current status |
|---|---|---|---|
| [36 Districts](https://plan.maharashtra.gov.in/en/36-districts/) | Government of Maharashtra, Planning Department | State and district master | Approved for controlled geography seed |
| [MSSDS Training Centres](https://www.kaushalya.mahaswayam.gov.in/users/find_center) | Maharashtra State Skill Development Society | Training-centre/provider/course evidence | Public directory reviewed; stable export/API not verified |
| [MSSDS Course Master](https://www.kaushalya.mahaswayam.gov.in/users/coursemasters) | Maharashtra State Skill Development Society | Course and sector reference | Public page exposes an Excel export control; downloadable export not captured |
| [NSDC](https://www.nsdcindia.org/) | National Skill Development Corporation | National skills, QP/NOS and training reference | Reference only; not Maharashtra demand |
| [NSDC State-wise Reports](https://stag-api.nsdcindia.org/state-wise-reports) | National Skill Development Corporation | State skill-stock context | Report index reviewed; source file must be verified before import |
| [NSDC Maharashtra Skill Stock detail](https://stag-api.nsdcindia.org/estimating-skill-stock-maharashtra) | National Skill Development Corporation | Maharashtra skill-stock context | **NOT_IMPORTED**: page currently links to a Madhya Pradesh PDF, so provenance/file mismatch requires clarification |

## Import Decisions

The 36-district Planning Department page is suitable for the existing `states` and `districts` master. The controlled seed preserves the official names, uses state code `MH`, leaves district codes NULL because the page does not publish official codes, and records the source URL in `data_sources`.

No MSSDS, NSDC, dashboard, PDF, or screenshot aggregate has been imported into demand, supply, placement, or employer evidence tables. A public HTML directory is not treated as a stable API, and the NSDC file mismatch prevents unsafe import.

## Required Provenance for Next Imports

Every dataset must provide organization, source URL/reference, retrieval date, source record ID, file/API version, and a permitted structured transformation. It must be loaded through an ingestion run or an idempotent master-data importer and must not overwrite canonical records blindly.
