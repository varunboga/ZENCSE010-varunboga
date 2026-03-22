from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app import database
from app.routers import certificates, verification, admin
from app.exceptions.handlers import (
    CertificateNotFoundException,
    certificate_not_found_handler,
    validation_error_handler,
    generic_error_handler,
)
from app.middleware.rate_limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    await database.create_indexes()
    yield
    await database.close_connection()


app = FastAPI(
    title="CertShield API",
    description="Digital Certificate Verification Microservice",
    version="1.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(CertificateNotFoundException, certificate_not_found_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

app.include_router(certificates.router, prefix="/api/v1")
app.include_router(verification.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/", tags=["health"])
async def root():
    return {
        "message": "Welcome to CertShield API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "http://127.0.0.1:8000/docs",
        "api": "http://127.0.0.1:8000/api/v1"
    }