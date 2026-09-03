
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from sqlalchemy import Integer,String,DateTime
from sqlalchemy.orm import Mapped,mapped_column
from app.core.database import Base
from datetime import datetime,timezone



class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer,primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(255),unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255),unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime]= mapped_column(
        DateTime(timezone=True),
        default=lambda:datetime.now(timezone.utc),
    )

    audits = relationship("Audit", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("UserApiKey", back_populates="user", cascade="all, delete-orphan")




class UserApiKey(Base):
    __tablename__ = "user_api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)
    encrypted_key = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="api_keys")


class AuditStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    EXTRACTING = "extracting"
    ANALYZING = "analyzing"
    SCORING = "scoring"
    GENERATING_REPORT = "generating_report"
    COMPLETED = "completed"
    FAILED = "failed"


class Audit(Base):
    __tablename__ = "audits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String(2048), nullable=False)
    provider = Column(String(50), nullable=True)
    model_name = Column(String(100), nullable=True)
    status = Column(SQLEnum(AuditStatus), default=AuditStatus.PENDING, nullable=False)
    result_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc), nullable=True)

    # Optional relationship back to the User model
    user = relationship("User", back_populates="audits")