import secrets
from typing import Optional
from fastapi import Header, HTTPException
from app.config import settings


async def verify_api_key(x_api_key: Optional[str] = Header(default=None)) -> None:
    if not x_api_key or not secrets.compare_digest(x_api_key, settings.api_key):
        raise HTTPException(status_code=401, detail="Invalid API Key")