from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import async_create_engine,AsyncSession 
from sqlalchemy.orm import async_sessionmaker
from collections.abc import AsyncGenerator
DATABASE_URL = "sqlite+aiosqlite:///./ auditIQ.db"


engine = async_create_engine(
    DATABASE_URL, 
    echo=True
)
AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db()->AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
