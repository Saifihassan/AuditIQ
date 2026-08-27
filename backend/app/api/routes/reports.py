from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.core.models import User, Audit

router = APIRouter()


@router.get("/")
def get_report():
    return {"message": "This endpoint will return all the reports"}


@router.get("/{id}")
async def get_one_report(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Audit.result_data ).where(Audit.id == id, Audit.user_id == current_user.id)
    res = await db.execute(stmt)
    report = res.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Report not found"
        )
    return report
