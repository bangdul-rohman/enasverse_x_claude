from sentence_transformers import SentenceTransformer
import asyncio

MODEL_NAME = "all-MiniLM-L6-v2"
_model = None

def get_model():
    global _model
    if _model is None:
        print(f"Loading embedding model: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
    return _model

CHUNK_SIZE = 512
CHUNK_OVERLAP = 50

def chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + CHUNK_SIZE, len(words))
        chunks.append(" ".join(words[start:end]))
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks

async def embed_text(text: str) -> list[float]:
    model = get_model()
    loop = asyncio.get_event_loop()
    embedding = await loop.run_in_executor(None, model.encode, text)
    return embedding.tolist()

async def embed_chunks(chunks: list[str]) -> list[list[float]]:
    model = get_model()
    loop = asyncio.get_event_loop()
    embeddings = await loop.run_in_executor(None, model.encode, chunks)
    return embeddings.tolist()
