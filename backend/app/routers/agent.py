from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.auth import get_current_user
from app.services.agent import run_agent

router = APIRouter(prefix="/agent", tags=["agent"])

class AgentRequest(BaseModel):
    task: str

@router.post("/run")
async def agent_run(body: AgentRequest, current_user=Depends(get_current_user)):
    result = await run_agent(task=body.task, tenant_id=current_user.tenant_id)
    return result

@router.get("/health")
async def agent_health():
    return {"status": "ok", "tools": ["read_file", "write_file", "run_command", "search_codebase", "request_human_approval"]}
