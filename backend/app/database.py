from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

_client: AsyncIOMotorClient | None = None

def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongodb_url)
    return _client

def get_database() -> AsyncIOMotorDatabase:
    return get_client()[settings.mongodb_db_name]

def get_certificates_collection():
    return get_database()["certificates"]

def get_verification_logs_collection():
    return get_database()["verification_logs"]

class _DB:
    @property
    def certificates(self):
        return get_certificates_collection()
    @property
    def verification_logs(self):
        return get_verification_logs_collection()

db = _DB()

async def create_indexes() -> None:
    certs = get_certificates_collection()
    await certs.create_index("certificate_id", unique=True, name="idx_certificate_id")
    await certs.create_index("recipient.email", name="idx_recipient_email")
    await certs.create_index([("status", 1), ("expires_at", 1)], name="idx_status_expiry")
    await certs.create_index("signature.data_hash", unique=True, name="idx_data_hash")
    logs = get_verification_logs_collection()
    await logs.create_index("certificate_id", name="idx_log_cert_id")
    await logs.create_index("verified_at", name="idx_log_verified_at")

async def close_connection() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
