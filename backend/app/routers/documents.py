from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from typing import Optional
import io, os

from app.services.retriever import index_document
from app.services.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["documents"])

# ── helpers ──────────────────────────────────────────────────────────────────

def extract_text_from_pdf(content: bytes) -> str:
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(content))
        return "\n".join(p.extract_text() or "" for p in reader.pages)
    except ImportError:
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(content))
            return "\n".join(p.extract_text() or "" for p in reader.pages)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Gagal parse PDF: {e}")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Gagal parse PDF: {e}")

def extract_text_from_docx(content: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Gagal parse DOCX: {e}")

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

# ── models ───────────────────────────────────────────────────────────────────

class IndexTextRequest(BaseModel):
    text: str
    source: str = "manual"
    tenant_id: str = "default"
    metadata: dict = {}

# ── endpoints ────────────────────────────────────────────────────────────────

@router.post("/index")
async def index_text(request: IndexTextRequest):
    try:
        ids = await index_document(
            text=request.text,
            metadata={"source": request.source, **request.metadata},
            tenant_id=request.tenant_id,
        )
        return {"indexed": len(ids), "chunk_ids": ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    tenant_id: str = Form(default="default"),
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    content = await file.read()

    # Validasi ukuran max 10MB
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File terlalu besar. Maksimal 10MB.")

    # Extract text
    if ext == ".pdf":
        text = extract_text_from_pdf(content)
    elif ext in (".docx", ".doc"):
        text = extract_text_from_docx(content)
    elif ext in (".txt", ".md", ".rst", ".csv"):
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1")
    else:
        raise HTTPException(
            status_code=415,
            detail=f"Format '{ext}' tidak didukung. Gunakan PDF, DOCX, atau TXT."
        )

    if not text.strip():
        raise HTTPException(status_code=422, detail="File kosong atau tidak bisa dibaca.")

    chunks = chunk_text(text)
    all_ids = []
    for i, chunk in enumerate(chunks):
        ids = await index_document(
            text=chunk,
            metadata={
                "source": filename,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "file_type": ext,
                "user_id": user_id,
            },
            tenant_id=user_id,
        )
        all_ids.extend(ids)

    return {
        "filename": filename,
        "file_type": ext,
        "file_size_kb": round(len(content) / 1024, 1),
        "total_chunks": len(chunks),
        "indexed": len(chunks),
        "message": f"Berhasil mengindeks {len(chunks)} bagian dari '{filename}'"
    }
