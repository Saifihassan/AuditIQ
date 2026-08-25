
from enum import Enum
from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel, HttpUrl, ConfigDict
from pydantic import ConfigDict
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"




class AuditStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    EXTRACTING = "extracting"
    ANALYZING = "analyzing"
    SCORING = "scoring"
    GENERATING_REPORT = "generating_report"
    COMPLETED = "completed"
    FAILED = "failed"



class AuditCreate(BaseModel):
    url: HttpUrl



class AuditResponse(BaseModel):
    id: int
    user_id: int
    url: str
    status: AuditStatus
    result_data: Optional[dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)