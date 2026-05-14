import anthropic
from app.config import get_settings
from app.services.retriever import search

settings = get_settings()
client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

async def ask_with_context(
    question: str,
    tenant_id: str,
    chat_history: list[dict] = [],
) -> str:
    results = await search(question, tenant_id, limit=5)
    
    context = "\n\n---\n\n".join([
        f"[Source: {r['metadata'].get('source', 'unknown')}]\n{r['text']}"
        for r in results
    ])

    system_prompt = f"""You are Enasverse, an AI assistant with persistent memory.
You have access to the following context retrieved from the knowledge base:

{context if context else "No relevant context found."}

Answer based on the context above. If the context doesn't contain enough information, say so honestly.
Always be specific and reference the source when possible."""

    messages = chat_history + [{"role": "user", "content": question}]

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text
