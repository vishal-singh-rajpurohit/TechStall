from functools import lru_cache
from sentence_transformers import SentenceTransformer
from huggingface_hub import AsyncInferenceClient
from ..config.settngs import settings

EMBEDDING_MODEL_NAME = settings.EMBEDDING_MODEL_NAME


@lru_cache(maxsize=1)
def get_embedding_model() -> AsyncInferenceClient:
    return AsyncInferenceClient(
        provider="hf-inference",
        api_key=settings.HF_TOKEN,
    )

async def embed_product(text: str) -> list[float]:
    client = get_embedding_model()
    embedding = await client.feature_extraction(text, model=EMBEDDING_MODEL_NAME)
    return embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)

async def embed_query(text: str) -> list[float]:
    return await embed_product(f'query:{text}')
