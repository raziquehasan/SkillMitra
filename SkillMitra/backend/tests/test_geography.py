"""Public geography endpoint tests."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_districts_public():
    response = client.get("/api/v1/geography/districts")
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body, list)
    names = {row["name"] for row in body}
    assert "Pune" in names or len(body) == 0
    if body:
        assert {"id", "name"} <= set(body[0].keys())
        assert all(row.get("state_code") in (None, "MH") for row in body)


def test_districts_are_not_limited_to_five_cities():
    response = client.get("/api/v1/geography/districts")
    assert response.status_code == 200
    body = response.json()
    if not body:
        return
    names = {row["name"] for row in body}
    hardcoded_five = {"Pune", "Mumbai", "Nashik", "Nagpur", "Kolhapur"}
    assert names != hardcoded_five
    assert len(body) > 5
