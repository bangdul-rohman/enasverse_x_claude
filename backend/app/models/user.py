from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    tenant_id = Column(String, nullable=False)

    plan = Column(String, default='free', nullable=True)
    stripe_customer_id = Column(String, nullable=True)
    plan_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
