from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from app.middleware.api_key_auth import verify_api_key
from app.services import certificate_service
from app.models.requests import FlatCertificateCreateRequest, RevokeRequest

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.post("/", status_code=201, dependencies=[Depends(verify_api_key)])
async def issue_certificate(request: FlatCertificateCreateRequest):
    return await certificate_service.issue_certificate_flat(request)


@router.get("/", dependencies=[Depends(verify_api_key)])
async def list_certificates(skip: int = 0, limit: int = 20):
    return await certificate_service.list_certificates(skip=skip, limit=limit)


@router.get("/{certificate_id}", dependencies=[Depends(verify_api_key)])
async def get_certificate(certificate_id: str):
    cert = await certificate_service.get_certificate(certificate_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert


@router.put("/{certificate_id}/revoke", dependencies=[Depends(verify_api_key)])
async def revoke_certificate(certificate_id: str, body: RevokeRequest):
    success = await certificate_service.revoke_certificate(certificate_id, body.reason, body.revoked_by)
    if not success:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"certificate_id": certificate_id, "status": "REVOKED"}


@router.get("/{certificate_id}/qrcode", dependencies=[Depends(verify_api_key)])
async def get_qrcode(certificate_id: str):
    import base64
    from app.services.qr_service import generate_qr_base64
    cert = await certificate_service.get_certificate(certificate_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    png_bytes = base64.b64decode(generate_qr_base64(cert["qr"]["url"]))
    return Response(content=png_bytes, media_type="image/png")