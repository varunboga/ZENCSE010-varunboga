"""
MongoDB document model for a Certificate.

TODO (Students):
  Define the Certificate document structure using Pydantic.
  Fields to include:
    - certificate_id: str  (UUID4 prefixed with "CERT-")
    - recipient: dict      (name, email, student_id)
    - certificate: dict    (title, description, skills list)
    - issued_at: datetime
    - expires_at: datetime | None
    - signature: dict      (algorithm, key_id, value, data_hash)
    - qr: dict             (url, generated_at)
    - status: str          ("ACTIVE" | "REVOKED" | "EXPIRED")
    - verification_count: int
    - last_verified_at: datetime | None
    - created_at: datetime

  Hint: Use Pydantic BaseModel with Field defaults.
        MongoDB _id can be handled as PyObjectId or ignored (use certificate_id as primary key).
"""

from datetime import datetime, timezone
from typing import TypedDict, List, Optional, Literal
from uuid import uuid4
from pydantic import BaseModel, Field

class RecipientDict(TypedDict):
    name: str
    email: str
    student_id: Optional[str]

class CertificateDict(TypedDict):
    title: str
    description: Optional[str]
    skills: List[str]

class SignatureDict(TypedDict):
    algorithm: str
    key_id: str
    value: str
    data_hash: str

class QRDict(TypedDict):
    url: str
    generated_at: datetime

def generate_cert_id() -> str:
    return f"CERT-{uuid4()}"

def get_current_time() -> datetime:
    return datetime.now(timezone.utc)

class Certificate(BaseModel):
    certificate_id: str = Field(default_factory=generate_cert_id)
    recipient: RecipientDict
    certificate: CertificateDict
    issued_at: datetime = Field(default_factory=get_current_time)
    expires_at: Optional[datetime] = None
    signature: SignatureDict
    qr: QRDict
    status: Literal["ACTIVE", "REVOKED", "EXPIRED"] = Field(default="ACTIVE")
    verification_count: int = Field(default=0)
    last_verified_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=get_current_time)
