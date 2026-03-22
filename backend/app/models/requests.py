from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, date


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


class FlatCertificateCreateRequest(BaseModel):
    recipient_name: str
    recipient_email: EmailStr
    recipient_student_id: Optional[str] = None
    course_title: str
    description: Optional[str] = None
    skills: List[str]
    issue_date: date
    expiry_date: Optional[date] = None


class RevokeRequest(BaseModel):
    reason: str
    revoked_by: str