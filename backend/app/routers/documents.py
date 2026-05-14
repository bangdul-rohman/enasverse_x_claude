from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.services.retriever import index_document

router = APIRouter(prefix="/documents", tags=["documents"])

class IndexTextRequest(BaseModel):
    text: str
    source: str = "manual"
    tenant_id: str = "default"

@router.post("/index")
async def index_text(request: IndexTextRequest):
    try:
        ids = await index_document(
            text=request.text,
            metadata={"source": request.source},
            tenant_id=request.tenant_id,
        )
        return {"indexed": len(ids), "chunk_ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    tenant_id: str = "default",
):
    try:
        content = await file.read()
        text = content.decode("utf-8")
        ids = await index_document(
            text=text,
            metadata={"source": file.filename},
            tenant_id=tenant_id,
        )
        return {"filename": file.filename, "indexed": len(ids), "chunk_ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
