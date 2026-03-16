import logging, traceback
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

logger = logging.getLogger(__name__)

class CertificateNotFoundException(Exception):
    def __init__(self, certificate_id: str):
        self.certificate_id = certificate_id

async def certificate_not_found_handler(request: Request, exc: CertificateNotFoundException):
    return JSONResponse(status_code=404, content={"error": "Certificate not found", "certificate_id": exc.certificate_id})

async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"error": "Validation failed", "details": exc.errors()})

async def generic_error_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception:\n%s", traceback.format_exc())
    return JSONResponse(status_code=500, content={"error": "Internal server error"})

async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"error": "Rate limit exceeded. Please try again later."})
