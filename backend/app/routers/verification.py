from fastapi import APIRouter, Request
from slowapi.util import get_remote_address
from app.middleware.rate_limiter import limiter
from app.services import verification_service

router = APIRouter(prefix="/verify", tags=["verification"])

@router.get("/{certificate_id}")
@limiter.limit("60/minute")
async def verify(request: Request, certificate_id: str):
    client_ip = get_remote_address(request)
    return await verification_service.verify_certificate(certificate_id, client_ip)
