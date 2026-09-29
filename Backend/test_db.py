import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:password@localhost:5433/semantic_ecommerce')
    rows = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products'")
    for r in rows:
        print(f"  {r['column_name']} ({r['data_type']})")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
