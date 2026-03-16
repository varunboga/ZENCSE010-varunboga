from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


class CertificateCreateRequest(BaseModel):
    recipient_name: str
    recipient_email: EmailStr
    recipient_student_id: Optional[str] = None
    course_title: str
    description: Optional[str] = None
    skills: List[str]
    issue_date: date
    expiry_date: Optional[date] = None


class CertificateResponse(BaseModel):
    certificate_id: str
    qr_code_base64: str
    qr_code_url: str
    linkedin_share_url: str
    issued_at: datetime
    status: str


class CertificateListItem(BaseModel):
    certificate_id: str
    recipient_name: str
    course_title: str
    issued_at: datetime
    status: str
