from typing import Optional, List
from fpdf import FPDF
from fastapi.responses import Response
from sqlalchemy import select
from app.agents.ai_agents import start_audit
from fastapi import HTTPException
from fastapi import status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import AuditCreate, AuditResponse
from app.core.database import get_db
from app.core.models import Audit, User, UserApiKey
from app.api.routes.auth import get_current_user
from app.core.encryption import decrypt_key
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
        url=str(req.url),
        provider=req.provider,
        model_name=req.model_name
    )
    db.add(new_audit)
    await db.commit()
    await db.refresh(new_audit)
    
    api_key = None
    if req.provider:
        key_result = await db.execute(
            select(UserApiKey)
            .where(UserApiKey.user_id == current_user.id)
            .where(UserApiKey.provider == req.provider)
        )
        saved_key = key_result.scalar_one_or_none()
        if not saved_key:
            raise HTTPException(status_code=400, detail=f"No API key saved for provider '{req.provider}'")
        api_key = decrypt_key(saved_key.encrypted_key)
    
    # Run the audit in the background so the frontend doesn't wait
    background_tasks.add_task(run_audit_background, new_audit.id, str(req.url), api_key, req.provider, req.model_name)
    
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

@router.get("/{audit_id}/pdf", status_code=status.HTTP_200_OK)
async def download_audit_pdf(
    audit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    res = await db.execute(stmt)
    audit = res.scalar_one_or_none()

    if not audit or not audit.result_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Audit not found or not completed"
        )
    
    report = audit.result_data
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)
    
    content = "SEO Audit Report\n"
    content += "="*40 + "\n\n"
    content += f"Target URL: {report.get('target_url', 'N/A')}\n"
    content += f"Overall Score: {report.get('overall_score', 'N/A')}/100\n"
    content += f"Overall Grade: {report.get('overall_grade', 'N/A')}\n\n"
    
    content += "EXECUTIVE SUMMARY\n"
    content += "-"*20 + "\n"
    content += f"{report.get('executive_summary', 'N/A')}\n\n"
    
    content += "TOP 3 PRIORITIES\n"
    content += "-"*20 + "\n"
    for idx, item in enumerate(report.get('top_3_priorities', []), 1):
        content += f"{idx}. {item}\n"
    content += "\n"
    
    for section_key, section_name in [("technical_audit", "TECHNICAL AUDIT"), 
                                      ("content_audit", "CONTENT AUDIT"), 
                                      ("performance_audit", "PERFORMANCE AUDIT")]:
        section = report.get(section_key, {})
        if section:
            content += f"{section_name}\n"
            content += "-"*20 + "\n"
            content += f"Status: {section.get('status', 'N/A')}\n"
            
            findings = section.get('key_findings', [])
            if findings:
                content += "Key Findings:\n"
                for finding in findings:
                    content += f"  * {finding}\n"
            
            remediations = section.get('remediation_steps', [])
            if remediations:
                content += "Remediation Steps:\n"
                for step in remediations:
                    content += f"  * {step}\n"
            content += "\n"

    content += "30-DAY ACTION PLAN\n"
    content += "-"*20 + "\n"
    plan = report.get('thirty_day_action_plan', [])
    for idx, item in enumerate(plan, 1):
        content += f"Week {idx}: {item}\n"
        
    safe_content = content.encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 6, text=safe_content)
    
    pdf_content = pdf.output()
    
    return Response(
        content=bytes(pdf_content), 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=audit_{audit_id}.pdf"}
    )