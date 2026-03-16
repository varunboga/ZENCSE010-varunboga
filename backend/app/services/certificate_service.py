import uuid
from datetime import datetime, timezone
from urllib.parse import urlencode
from typing import Optional, List, Dict

from app.database import db
from app.config import settings
from app.services import signature_service, qr_service


async def issue_certificate(request) -> Dict:
    certificate_id = f"CERT-{uuid.uuid4()}"
    issued_at = datetime.now(timezone.utc)
    issued_at_iso = issued_at.isoformat()

    data_to_sign = {
        "certificate_id": certificate_id,
        "recipient": request.recipient.model_dump(),
        "certificate": request.certificate.model_dump(),
        "issued_at": issued_at_iso,
    }

    signature_b64, data_hash = signature_service.sign_certificate(data_to_sign)
    verification_url = f"{settings.verify_base_url}/{certificate_id}"
    qr_base64 = qr_service.generate_qr_base64(verification_url)

    linkedin_params = urlencode({
        "url": verification_url,
        "title": request.certificate.title,
        "summary": request.certificate.description or ""
    })
    linkedin_share_url = f"https://www.linkedin.com/sharing/share-offsite/?{linkedin_params}"

    document = {
        "certificate_id": certificate_id,
        "recipient": request.recipient.model_dump(),
        "certificate": request.certificate.model_dump(),
        "issued_at_iso": issued_at_iso,
        "issued_at": issued_at,
        "expires_at": getattr(request, "expires_at", None),
        "signature": {
            "algorithm": "ECDSA-P256-SHA256",
            "key_id": settings.key_id,
            "value": signature_b64,
            "data_hash": data_hash,
        },
        "qr": {
            "url": verification_url,
            "generated_at": issued_at,
        },
        "status": "ACTIVE",
        "verification_count": 0,
        "last_verified_at": None,
        "created_at": issued_at,
    }

    await db.certificates.insert_one(document)

    return {
        "certificate_id": certificate_id,
        "qr_code_base64": qr_base64,
        "qr_code_url": verification_url,
        "linkedin_share_url": linkedin_share_url,
        "issued_at": issued_at_iso,
        "status": "ACTIVE",
    }


async def get_certificate(certificate_id: str) -> Optional[Dict]:
    cert = await db.certificates.find_one({"certificate_id": certificate_id})
    if cert:
        cert["_id"] = str(cert["_id"])
    return cert


async def list_certificates(skip: int = 0, limit: int = 20) -> List[Dict]:
    cursor = db.certificates.find({}).sort("created_at", -1).skip(skip).limit(limit)
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results


async def revoke_certificate(certificate_id: str, reason: str, revoked_by: str) -> bool:
    result = await db.certificates.update_one(
        {"certificate_id": certificate_id},
        {
            "$set": {
                "status": "REVOKED",
                "revocation": {
                    "revokedAt": datetime.now(timezone.utc),
                    "reason": reason,
                    "revokedBy": revoked_by,
                }
            }
        }
    )
    return result.modified_count > 0


async def get_stats() -> Dict:
    total = await db.certificates.count_documents({})
    active = await db.certificates.count_documents({"status": "ACTIVE"})
    revoked = await db.certificates.count_documents({"status": "REVOKED"})

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    verifications_today = await db.verification_logs.count_documents({
        "verified_at": {"$gte": today_start}
    })

    return {
        "total": total,
        "active": active,
        "revoked": revoked,
        "verifications_today": verifications_today,
    }
