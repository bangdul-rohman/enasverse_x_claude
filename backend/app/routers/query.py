from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.claude import ask_with_context

router = APIRouter(prefix="/query", tags=["query"])

class QueryRequest(BaseModel):
    question: str
    tenant_id: str = "default"
    chat_history: list[dict] = []

class QueryResponse(BaseModel):
    answer: str
    question: str

@router.post("", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        answer = await ask_with_context(
            question=request.question,
            tenant_id=request.tenant_id,
            chat_history=request.chat_history,
        )
        return QueryResponse(answer=answer, question=request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
