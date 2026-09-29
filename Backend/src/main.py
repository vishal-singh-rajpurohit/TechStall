import os
import dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List
from pydantic import Field, BaseModel
from .db.desp import get_db
from .db.db import engine, Base
from .routes import auth, seller, shop, cart, product, order
from .config.settngs import settings
from .utils.embedding import get_embedding_model
from . import models

app = FastAPI(title="Semantic E-Commerce API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.on_event("startup")
async def create_tables():
    get_embedding_model()
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
        stmts = [
            "ALTER TABLE products_embeddings ALTER COLUMN embedding TYPE vector(768)",
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer DEFAULT 10",
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS brand varchar(100) DEFAULT 'Generic'",
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS sku varchar(100)",
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'",
            "ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications text DEFAULT '{}'",
            """
            CREATE TABLE IF NOT EXISTS media (
                id UUID PRIMARY KEY,
                product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                media_type VARCHAR(20) NOT NULL DEFAULT 'image',
                url VARCHAR(1000) NOT NULL,
                public_id VARCHAR(300),
                thumbnail_url VARCHAR(1000),
                format VARCHAR(20),
                bytes INTEGER,
                width INTEGER,
                height INTEGER,
                is_primary BOOLEAN NOT NULL DEFAULT FALSE,
                "order" INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
            """,
            "CREATE INDEX IF NOT EXISTS ix_media_product_id ON media(product_id)",
        ]
        for s in stmts:
            await conn.execute(text(s))


v1 = settings.VERSION

app.include_router(auth.router, prefix=f'/api/{v1}/auth/user')
app.include_router(auth.router, prefix=f'/api/{v1}/auth')

app.include_router(seller.router, prefix=f'/api/{v1}/auth/seller')
app.include_router(seller.router, prefix=f'/api/{v1}/seller')
app.include_router(product.router, prefix=f'/api/{v1}/product')
app.include_router(cart.router, prefix=f'/api/{v1}/cart')
app.include_router(order.router, prefix=f'/api/{v1}/order')
app.include_router(shop.router, prefix=f'/api/{v1}')