from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from app.services.auth import get_current_user
from app.services.github_indexer import index_github_repo

router = APIRouter(prefix="/indexer", tags=["indexer"])

class IndexRepoRequest(BaseModel):
    repo: str
    branch: str = "main"
    tenant_id: str

@router.post("/github/webhook")
async def github_webhook(request: Request):
    payload = await request.json()
    repo = payload.get("repository", {}).get("full_name")
    branch = payload.get("ref", "refs/heads/main").replace("refs/heads/", "")
    if repo:
        await index_github_repo(repo=repo, branch=branch, tenant_id="default")
    return {"status": "ok"}

@router.post("/index-repo")
async def index_repo(body: IndexRepoRequest, current_user=Depends(get_current_user)):
    result = await index_github_repo(
        repo=body.repo,
        branch=body.branch,
        tenant_id=body.tenant_id
    )
    return result

@router.get("/health")
async def indexer_health():
    return {"status": "ok", "service": "github-indexer"}
