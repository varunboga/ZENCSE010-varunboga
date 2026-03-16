"""
FastAPI application entry point.

TODO (Students):
  Wire everything together:

  1. Create FastAPI app with title, description, version
  2. Add lifespan handler:
       - On startup: call database.create_indexes()
       - On shutdown: call database.close_connection()
  3. Add CORS middleware (allow all origins for dev)
  4. Register slowapi rate limiter on the app
  5. Register exception handlers from exceptions/handlers.py
  6. Include routers:
       - certificates.router
       - verification.router
       - admin.router

  Hint:
    from contextlib import asynccontextmanager
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from app import database
    from app.routers import certificates, verification, admin

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        await database.create_indexes()
        yield
        await database.close_connection()

    app = FastAPI(title="CertShield API", version="1.0.0", lifespan=lifespan)
"""

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

app = FastAPI(title="CertShield API", description="API for CertShield", version="1.0.0", lifespan=lifespan)

# Setup slowapi rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(CertificateNotFoundException, certificate_not_found_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(Exception, generic_error_handler)

# Routers
app.include_router(certificates.router)
app.include_router(verification.router)
app.include_router(admin.router)
