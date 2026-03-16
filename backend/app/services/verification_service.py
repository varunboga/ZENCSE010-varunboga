from datetime import datetime, timezone
from app.database import db
from app.services import signature_service

async def verify_certificate(certificate_id: str, client_ip: str) -> dict:
    cert = await db.certificates.find_one({"certificate_id": certificate_id})
    if not cert:
        return {"result": "NOT_FOUND", "certificate_id": certificate_id}
    if cert.get("status") == "REVOKED":
        return {"result": "REVOKED", "certificate_id": certificate_id}

    # Use the exact ISO string that was signed
    issued_at_iso = cert.get("issued_at_iso")
    if not issued_at_iso:
        # fallback for old records
        issued_at = cert["issued_at"]
        issued_at_iso = issued_at.isoformat() if isinstance(issued_at, datetime) else issued_at

    recipient = cert["recipient"]
    certificate = cert["certificate"]

    data_to_verify = {
        "certificate_id": cert["certificate_id"],
        "recipient": {
            "name": recipient["name"],
            "email": recipient["email"],
            "student_id": recipient["student_id"],
        },
        "certificate": {
            "title": certificate["title"],
            "description": certificate.get("description"),
            "skills": certificate["skills"],
        },
        "issued_at": issued_at_iso,
    }

    is_valid = signature_service.verify_certificate(data_to_verify, cert["signature"]["value"])
    if not is_valid:
        return {"result": "TAMPERED", "certificate_id": certificate_id}

    now = datetime.now(timezone.utc)
    await db.certificates.update_one(
        {"certificate_id": certificate_id},
        {"$inc": {"verification_count": 1}, "$set": {"last_verified_at": now}},
    )
    await db.verification_logs.insert_one({
        "certificate_id": certificate_id,
        "verified_at": now,
        "client_ip": client_ip,
        "result": "VALID",
    })
    return {
        "result": "VALID",
        "certificate_id": certificate_id,
        "recipient": cert["recipient"],
        "certificate": cert["certificate"],
        "issued_at": cert["issued_at"],
        "expires_at": cert.get("expires_at"),
        "status": cert["status"],
    }
