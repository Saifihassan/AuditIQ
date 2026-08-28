from typing import Optional, List
from sqlalchemy import select
from app.agents.ai_agents import start_audit
from fastapi import HTTPException
from fastapi import status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import AuditCreate, AuditResponse
from app.core.database import get_db
from app.core.models import Audit, User
from app.api.routes.auth import get_current_user
from fastapi import APIRouter

router = APIRouter()

from fastapi import BackgroundTasks
from app.agents.ai_agents import run_audit_background

@router.post("/", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(
    req: AuditCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_audit = Audit(
        user_id=current_user.id,
        url=str(req.url)
    )
    db.add(new_audit)
    await db.commit()
    await db.refresh(new_audit)
    
    # Run the audit in the background so the frontend doesn't wait
    background_tasks.add_task(run_audit_background, new_audit.id, str(req.url))
    
    return new_audit


@router.get("/{audit_id}", response_model=AuditResponse, status_code=status.HTTP_200_OK)
async def get_audit(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    res = await db.execute(stmt)
    audit = res.scalar_one_or_none()

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Audit not found"
        )

    return audit
@router.get("/", response_model=List[AuditResponse], status_code=status.HTTP_200_OK)
async def get_audits(
    audit_status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Audit).where(Audit.user_id == current_user.id)
    if audit_status:
        stmt = stmt.where(Audit.status == audit_status)
    
    stmt = stmt.order_by(Audit.created_at.desc())
    res = await db.execute(stmt)
    audits = res.scalars().all()
    return audits