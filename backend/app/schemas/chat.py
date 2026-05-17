from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessageOut(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    id: str
    user_id: str
    tenant_id: str
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[ChatMessageOut] = []

    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    tenant_id: str
    title: Optional[str] = "New Chat"
