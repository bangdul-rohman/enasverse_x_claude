from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
import uuid

from app.services.claude import ask_with_context
from app.services.embedder import embed_text
from app.services.retriever import client as qdrant_client
from app.models.chat import ChatSession, ChatMessage
from app.models.user import User
from app.services.auth import get_current_user
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from qdrant_client.models import PointStruct
from app.limiter import limiter
from app.config import get_settings

router = APIRouter(prefix="/query", tags=["query"])
settings = get_settings()

class QueryRequest(BaseModel):
    question: str
    tenant_id: str = "default"
    session_id: Optional[str] = None
    chat_history: list[dict] = []

class QueryResponse(BaseModel):
    answer: str
    question: str
    session_id: str

@router.post("", response_model=QueryResponse)
@limiter.limit("20/minute")
async def query(
    request: Request,
    body: QueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        answer = await ask_with_context(
            question=body.question,
            tenant_id=body.tenant_id,
            chat_history=body.chat_history,
        )

        # Ambil atau buat session
        session = None
        if body.session_id:
            result = await db.execute(
                select(ChatSession).where(
                    ChatSession.id == body.session_id,
                    ChatSession.user_id == current_user.id
                )
            )
            session = result.scalar_one_or_none()

        if not session:
            session = ChatSession(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                tenant_id=body.tenant_id,
                title=body.question[:60]
            )
            db.add(session)
            await db.flush()

        # Simpan message user & assistant
        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session.id,
            role="user",
            content=body.question
        )
        assistant_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=session.id,
            role="assistant",
            content=answer
        )
        db.add(user_msg)
        db.add(assistant_msg)
        await db.commit()

        # Index ke Qdrant (non-blocking)
        try:
            for msg in [user_msg, assistant_msg]:
                embedding = await embed_text(msg.content)
                await qdrant_client.upsert(
                    collection_name=settings.qdrant_collection,
                    points=[PointStruct(
                        id=str(uuid.uuid4()),
                        vector=embedding,
                        payload={
                            "text": msg.content,
                            "tenant_id": body.tenant_id,
                            "source": f"chat:{session.id}",
                            "role": msg.role
                        }
                    )]
                )
        except Exception:
            pass

        return QueryResponse(
            answer=answer,
            question=body.question,
            session_id=session.id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
