from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.routes.auth import get_current_user
from app.core.database import get_db
from app.core.models import User, Audit, AuditStatus

router = APIRouter()


@router.get("/")
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return all completed audits for the current user."""
    stmt = (
        select(Audit)
        .where(Audit.user_id == current_user.id, Audit.status == AuditStatus.COMPLETED)
        .order_by(Audit.created_at.desc())
    )
    res = await db.execute(stmt)
    audits = res.scalars().all()

    reports = []
    for audit in audits:
        result = audit.result_data or {}
        reports.append({
            "id": audit.id,
            "url": audit.url,
            "overall_score": result.get("overall_score"),
            "overall_grade": result.get("overall_grade"),
            "executive_summary": result.get("executive_summary", ""),
            "created_at": audit.created_at.isoformat() if audit.created_at else None,
            "updated_at": audit.updated_at.isoformat() if audit.updated_at else None,
        })
    return reports


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
