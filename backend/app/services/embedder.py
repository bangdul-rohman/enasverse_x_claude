from openai import AsyncOpenAI
from app.config import get_settings
import tiktoken

settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)

EMBEDDING_MODEL = "text-embedding-3-small"
CHUNK_SIZE = 512
CHUNK_OVERLAP = 50

def chunk_text(text: str) -> list[str]:
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + CHUNK_SIZE, len(tokens))
        chunk_tokens = tokens[start:end]
        chunks.append(enc.decode(chunk_tokens))
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks

async def embed_text(text: str) -> list[float]:
    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding

async def embed_chunks(chunks: list[str]) -> list[list[float]]:
    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=chunks,
    )
    return [item.embedding for item in response.data]
