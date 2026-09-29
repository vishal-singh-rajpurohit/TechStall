from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from .db import Async_Session_Local


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with Async_Session_Local() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()