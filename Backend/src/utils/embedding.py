import asyncio
import logging
from functools import lru_cache
from huggingface_hub import AsyncInferenceClient
from ..config.settngs import settings

logger = logging.getLogger(__name__)

EMBEDDING_MODEL_NAME = settings.EMBEDDING_MODEL_NAME


@lru_cache(maxsize=1)
def get_embedding_model() -> AsyncInferenceClient:
    return AsyncInferenceClient(
        provider="hf-inference",
        api_key=settings.HF_TOKEN,
    )

async def embed_product(text: str) -> list[float]:
    try:
        client = get_embedding_model()
        embedding = await asyncio.wait_for(
            client.feature_extraction(text, model=EMBEDDING_MODEL_NAME),
            timeout=3.0,
        )
        return embedding.tolist() if hasattr(embedding, "tolist") else list(embedding)
    except Exception as e:
        logger.warning(f"Remote embedding extraction fallback ({e}). Using standard 768-dim vector.")
        return [0.0] * 768

async def embed_query(text: str) -> list[float]:
    return await embed_product(f'query:{text}')
