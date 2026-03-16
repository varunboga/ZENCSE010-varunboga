from fastapi import APIRouter, Depends
from app.middleware.api_key_auth import verify_api_key
from app.services import certificate_service

router = APIRouter(prefix="/stats", tags=["admin"])

@router.get("/", dependencies=[Depends(verify_api_key)])
async def get_stats():
    return await certificate_service.get_stats()
