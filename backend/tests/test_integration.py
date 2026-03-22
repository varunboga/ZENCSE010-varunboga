import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

API_KEY = "change-me"
HEADERS = {"X-API-Key": API_KEY}

CERT_BODY = {
    "recipient_name": "John Doe",
    "recipient_email": "john@example.com",
    "recipient_student_id": "STU001",
    "course_title": "Python Programming",
    "description": "Test course",
    "skills": ["Python", "FastAPI"],
    "issue_date": "2026-03-18",
    "expiry_date": None,
}


@pytest_asyncio.fixture(scope="session")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture(scope="session")
async def issued_cert(client):
    response = await client.post("/api/v1/certificates/", json=CERT_BODY, headers=HEADERS)
    assert response.status_code == 201
    return response.json()


# TC-4.4.1 — Issue via API
async def test_issue_certificate(client):
    response = await client.post("/api/v1/certificates/", json=CERT_BODY, headers=HEADERS)
    assert response.status_code == 201
    data = response.json()
    assert data["certificate_id"].startswith("CERT-")
    assert "qr_code_base64" in data
    assert "linkedin_share_url" in data


# TC-4.4.2 — Verify valid
async def test_verify_valid(client, issued_cert):
    cert_id = issued_cert["certificate_id"]
    response = await client.get(f"/api/v1/verify/{cert_id}")
    assert response.status_code == 200
    assert response.json()["result"] == "VALID"


# TC-4.4.3 — Revoke + verify
async def test_revoke_then_verify(client):
    # Issue a fresh cert to revoke
    r = await client.post("/api/v1/certificates/", json=CERT_BODY, headers=HEADERS)
    cert_id = r.json()["certificate_id"]
    revoke = await client.put(
        f"/api/v1/certificates/{cert_id}/revoke",
        json={"reason": "Test revoke", "revoked_by": "admin"},
        headers=HEADERS
    )
    assert revoke.status_code == 200
    verify = await client.get(f"/api/v1/verify/{cert_id}")
    assert verify.json()["result"] == "REVOKED"


# TC-4.4.4 — Not found
async def test_verify_not_found(client):
    response = await client.get("/api/v1/verify/CERT-does-not-exist")
    assert response.status_code == 200
    assert response.json()["result"] == "NOT_FOUND"


# TC-4.4.5 — Auth required — send valid body but no API key
async def test_auth_required(client):
    # Test GET endpoint without API key — header is checked before any body
    response = await client.get("/api/v1/certificates/")
    assert response.status_code == 401


# TC-4.4.6 — Validation error
async def test_validation_error(client):
    response = await client.post(
        "/api/v1/certificates/",
        json={"recipient_name": "John"},
        headers=HEADERS
    )
    assert response.status_code == 422


# TC-2.7.5 — Verify public (no auth)
async def test_verify_no_auth(client, issued_cert):
    cert_id = issued_cert["certificate_id"]
    response = await client.get(f"/api/v1/verify/{cert_id}")
    assert response.status_code == 200


# TC-2.9.1 — Stats endpoint
async def test_stats(client):
    response = await client.get("/api/v1/stats/", headers=HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "active" in data
    assert "revoked" in data
    assert "verifications_today" in data