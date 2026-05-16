from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, Filter,
    FieldCondition, MatchValue
)
from app.config import get_settings
from app.services.embedder import embed_text, embed_chunks, chunk_text
import uuid

settings = get_settings()
client = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key or None)

VECTOR_SIZE = 384

async def init_collection():
    collections = await client.get_collections()
    names = [c.name for c in collections.collections]
    if settings.qdrant_collection not in names:
        await client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            ),
        )
        print(f"Collection '{settings.qdrant_collection}' created.")

async def index_document(
    text: str,
    metadata: dict,
    tenant_id: str,
) -> list[str]:
    chunks = chunk_text(text)
    embeddings = await embed_chunks(chunks)
    points = []
    ids = []
    for chunk, embedding in zip(chunks, embeddings):
        point_id = str(uuid.uuid4())
        ids.append(point_id)
        points.append(PointStruct(
            id=point_id,
            vector=embedding,
            payload={
                "text": chunk,
                "tenant_id": tenant_id,
                **metadata,
            }
        ))
    await client.upsert(
        collection_name=settings.qdrant_collection,
        points=points,
    )
    return ids

async def search(
    query: str,
    tenant_id: str,
    limit: int = 5,
) -> list[dict]:
    query_vector = await embed_text(query)
    results = await client.search(
        collection_name=settings.qdrant_collection,
        query_vector=query_vector,
        query_filter=Filter(
            must=[FieldCondition(
                key="tenant_id",
                match=MatchValue(value=tenant_id)
            )]
        ),
        limit=limit,
        with_payload=True,
    )
    return [
        {"text": r.payload["text"], "score": r.score, "metadata": r.payload}
        for r in results
    ]
