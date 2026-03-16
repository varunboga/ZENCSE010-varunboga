from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class RecipientRequest(BaseModel):
    name: str
    email: EmailStr
    student_id: str

class CertificateInfoRequest(BaseModel):
    title: str
    description: Optional[str] = None
    skills: List[str]

class CertificateCreateRequest(BaseModel):
    recipient: RecipientRequest
    certificate: CertificateInfoRequest
    expires_at: Optional[datetime] = None

class RevokeRequest(BaseModel):
    reason: str
    revoked_by: str
