from sqlalchemy import Column, String, Integer, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base
import uuid

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)  # 'query', 'upload', 'agent', 'index_repo'
    tokens_used = Column(Integer, default=0)
    file_size_kb = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now(), index=True)

# Quota limits per plan
PLAN_LIMITS = {
    "free": {
        "monthly_queries": 100,
        "monthly_uploads": 5,
        "monthly_agent_runs": 10,
    },
    "pro": {
        "monthly_queries": -1,  # unlimited
        "monthly_uploads": -1,
        "monthly_agent_runs": -1,
    }
}
