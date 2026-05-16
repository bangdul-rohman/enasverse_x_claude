from github import Github
from app.config import get_settings
from app.services.embedder import chunk_text, embed_chunks
from app.services.retriever import client, VECTOR_SIZE
from qdrant_client.models import PointStruct
import uuid

settings = get_settings()

async def index_github_repo(repo: str, branch: str = "main", tenant_id: str = "default"):
    g = Github(settings.github_token)
    repository = g.get_repo(repo)
    contents = repository.get_contents("", ref=branch)
    indexed = 0
    while contents:
        file_content = contents.pop(0)
        if file_content.type == "dir":
            contents.extend(repository.get_contents(file_content.path, ref=branch))
        else:
            if file_content.path.endswith(('.py', '.md', '.txt', '.js', '.ts', '.json')):
                try:
                    text = file_content.decoded_content.decode('utf-8')
                    chunks = chunk_text(text)
                    embeddings = embed_chunks(chunks)
                    points = [
                        PointStruct(
                            id=str(uuid.uuid4()),
                            vector=emb,
                            payload={
                                "text": chunk,
                                "source": f"{repo}/{file_content.path}",
                                "tenant_id": tenant_id
                            }
                        )
                        for chunk, emb in zip(chunks, embeddings)
                    ]
                    if points:
                        await client.upsert(collection_name=settings.qdrant_collection, points=points)
                        indexed += len(points)
                except Exception:
                    pass
    return {"status": "ok", "indexed": indexed, "repo": repo}
