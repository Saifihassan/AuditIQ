import asyncio
from sqlalchemy import delete
from app.core.database import AsyncSessionLocal
from app.core.models import Audit, AuditStatus

async def clean_failed_audits():
    async with AsyncSessionLocal() as session:
        try:
            # Delete all audits with status 'failed'
            stmt = delete(Audit).where(Audit.status == AuditStatus.FAILED)
            result = await session.execute(stmt)
            await session.commit()
            print(f"Successfully deleted {result.rowcount} failed audit(s) from the database.")
        except Exception as e:
            print(f"An error occurred while cleaning the database: {e}")

if __name__ == "__main__":
    print("Running database cleanup script...")
    asyncio.run(clean_failed_audits())
