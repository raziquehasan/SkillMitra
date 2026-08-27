from decimal import Decimal

import pytest

from app.services.course_master_import import (
    EXPECTED_HEADERS,
    build_course_import_plan,
    compare_source_exports,
    import_course_master,
    normalize_course_row,
    normalize_lookup_key,
)


def write_export(path, rows):
    header = "\t".join(EXPECTED_HEADERS)
    body = "\n".join("\t".join(row) for row in rows)
    path.write_text(f"{header}\n{body}\n", encoding="utf-8")


def row(
    sr_no="1",
    sector="Retail",
    course_code="RSC_Q8001",
    name="Bamboo Utility Handicraft Assembler",
    qualification="Class 8",
    duration="420",
    cost_category="-",
    rate="32.34",
    nsqf="-",
    nqr="2022/HYC/RASCI/06156",
    version="3",
):
    return [
        sr_no,
        sector,
        course_code,
        name,
        qualification,
        duration,
        cost_category,
        rate,
        nsqf,
        nqr,
        version,
    ]


def test_compare_source_exports_blocks_material_contradiction(tmp_path):
    older = tmp_path / "older.xls"
    newer = tmp_path / "newer.xls"
    write_export(older, [row(duration="450", cost_category="I")])
    write_export(newer, [row(duration="420", cost_category="-")])

    plan = build_course_import_plan(compare_source_exports(older, newer))

    assert plan.blocked
    assert plan.blocked_reason == "SOURCE_CONTRADICTION"
    assert plan.accepted_records == []
    assert plan.comparison.contradictions[0]["differences"]["Course Duration"] == {
        "older": "450",
        "newer": "420",
    }


def test_compare_source_exports_requires_newer_superset(tmp_path):
    older = tmp_path / "older.xls"
    newer = tmp_path / "newer.xls"
    write_export(older, [row(course_code="RSC_Q8001"), row(course_code="RSC_Q8002")])
    write_export(newer, [row(course_code="RSC_Q8001")])

    plan = build_course_import_plan(compare_source_exports(older, newer))

    assert plan.blocked
    assert plan.blocked_reason == "SOURCE_NOT_SUPERSET"
    assert plan.comparison.only_in_older == (("RSC_Q8002", "3"),)


def test_normalize_course_row_maps_dash_and_numeric_fields():
    source_row = dict(zip(EXPECTED_HEADERS, row(), strict=True))

    normalized = normalize_course_row(
        source_row,
        source_filename="Ncvt_Courses_list_27-08-26_01_11_48.xls",
        industry_sector_lookup={normalize_lookup_key("Retail"): "sector-id"},
    )

    assert normalized.duration_hours == 420
    assert normalized.cost_category is None
    assert normalized.rate_per_hour == Decimal("32.34")
    assert normalized.nsqf_level is None
    assert normalized.industry_sector_id == "sector-id"
    assert normalized.source_record_identifier == "Ncvt_Courses_list_27-08-26_01_11_48.xls:1"


def test_build_plan_rejects_duplicate_nqr_version(tmp_path):
    older = tmp_path / "older.xls"
    newer = tmp_path / "newer.xls"
    write_export(older, [row(nqr="NQR-1")])
    write_export(
        newer,
        [
            row(course_code="RSC_Q8001", nqr="NQR-1"),
            row(sr_no="2", course_code="RSC_Q8002", nqr="NQR-1"),
        ],
    )

    plan = build_course_import_plan(compare_source_exports(older, newer))

    assert len(plan.accepted_records) == 1
    assert len(plan.rejected_records) == 1
    assert plan.rejected_records[0].reason_code == "DUPLICATE_NQR_VERSION_CONFLICT"


def test_import_course_master_refuses_blocked_plan(tmp_path):
    older = tmp_path / "older.xls"
    newer = tmp_path / "newer.xls"
    write_export(older, [row(duration="450")])
    write_export(newer, [row(duration="420")])
    plan = build_course_import_plan(compare_source_exports(older, newer))

    with pytest.raises(RuntimeError):
        import_course_master(None, plan)
