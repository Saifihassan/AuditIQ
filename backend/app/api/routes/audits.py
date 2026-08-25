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

@router.post("/", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(
    req: AuditCreate,
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
    await start_audit(audit_id=new_audit.id, url=str(req.url), db=db)
    
    return new_audit


@router.get("/{audit_id}", response_model=AuditResponse, status_code=status.HTTP_200_OK)
async def get_audit(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensures a user can only query their own audit job
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    res = await db.execute(stmt)
    audit = res.scalar_one_or_none()

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Audit not found"
        )

    return audit