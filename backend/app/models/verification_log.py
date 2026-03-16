"""
MongoDB document model for a Verification Log entry.

TODO (Students):
  Define the VerificationLog document structure.
  Fields to include:
    - certificate_id: str      (which certificate was verified)
    - result: str              ("VALID" | "REVOKED" | "TAMPERED" | "NOT_FOUND")
    - verified_at: datetime
    - client_ip: str           (IP of the person who scanned)

  One log entry is created every time someone calls GET /api/v1/verify/{certificate_id}.
"""
from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, Field

def get_current_time() -> datetime:
    return datetime.now(timezone.utc)

class VerificationLog(BaseModel):
    certificate_id: str
    result: Literal["VALID", "REVOKED", "TAMPERED", "NOT_FOUND"]
    verified_at: datetime = Field(default_factory=get_current_time)
    client_ip: str
