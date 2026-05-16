import anthropic
from app.config import get_settings
from app.services.retriever import search_similar

settings = get_settings()
client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

tools = [
    {"name": "read_file", "description": "Read a file from the project", "input_schema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}},
    {"name": "write_file", "description": "Write content to a file", "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]}},
    {"name": "run_command", "description": "Run a shell command", "input_schema": {"type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]}},
    {"name": "search_codebase", "description": "Search the codebase for relevant context", "input_schema": {"type": "object", "properties": {"query": {"type": "string"}, "tenant_id": {"type": "string"}}, "required": ["query"]}},
    {"name": "request_human_approval", "description": "Request human approval before making changes", "input_schema": {"type": "object", "properties": {"action": {"type": "string"}, "reason": {"type": "string"}}, "required": ["action", "reason"]}},
]

async def handle_tool(name, inputs, tenant_id):
    if name == "read_file":
        try:
            return open(inputs["path"]).read()
        except Exception as e:
            return str(e)
    elif name == "write_file":
        try:
            open(inputs["path"], "w").write(inputs["content"])
            return "File written successfully"
        except Exception as e:
            return str(e)
    elif name == "run_command":
        import subprocess
        result = subprocess.run(inputs["command"], shell=True, capture_output=True, text=True)
        return result.stdout + result.stderr
    elif name == "search_codebase":
        results = await search_similar(inputs["query"], tenant_id=tenant_id)
        return "\n\n".join([r["text"] for r in results])
    elif name == "request_human_approval":
        return f"APPROVAL_REQUIRED: {inputs['action']} — Reason: {inputs['reason']}"
    return "Unknown tool"

async def run_agent(task: str, tenant_id: str = "default"):
    messages = [{"role": "user", "content": task}]
    steps = []
    for _ in range(10):
        response = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )
        if response.stop_reason == "end_turn":
            final = next((b.text for b in response.content if hasattr(b, "text")), "Done")
            return {"status": "completed", "result": final, "steps": steps}
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = await handle_tool(block.name, block.input, tenant_id)
                steps.append({"tool": block.name, "result": result})
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})
    return {"status": "max_iterations", "steps": steps}
