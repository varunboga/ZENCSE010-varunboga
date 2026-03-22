from datetime import datetime, timezone
from app.database import db
from app.services import signature_service
from app.config import settings


async def verify_certificate(certificate_id: str, client_ip: str) -> dict:
    cert = await db.certificates.find_one({"certificate_id": certificate_id})

    now = datetime.now(timezone.utc)

    if not cert:
        return {
            "result": "NOT_FOUND",
            "certificate_id": certificate_id,
            "recipient_name": None,
            "course_title": None,
            "issued_at": None,
            "expires_at": None,
            "institution_name": None,
            "verified_at": now,
            "message": "Certificate not found.",
        }

    if cert.get("status") == "REVOKED":
        return {
            "result": "REVOKED",
            "certificate_id": certificate_id,
            "recipient_name": cert["recipient"].get("name"),
            "course_title": cert["certificate"].get("title"),
            "issued_at": cert.get("issued_at"),
            "expires_at": cert.get("expires_at"),
            "institution_name": settings.institution_name,
            "verified_at": now,
            "message": "This certificate has been revoked.",
        }

    issued_at_iso = cert.get("issued_at_iso")
    if not issued_at_iso:
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
        return {
            "result": "TAMPERED",
            "certificate_id": certificate_id,
            "recipient_name": None,
            "course_title": None,
            "issued_at": None,
            "expires_at": None,
            "institution_name": None,
            "verified_at": now,
            "message": "Certificate data has been tampered.",
        }

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
        "recipient_name": recipient.get("name"),
        "course_title": certificate.get("title"),
        "issued_at": cert.get("issued_at"),
        "expires_at": cert.get("expires_at"),
        "institution_name": settings.institution_name,
        "verified_at": now,
        "message": "Certificate is authentic and valid.",
    }