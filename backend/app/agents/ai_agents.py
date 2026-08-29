# pyrefly: ignore [missing-import]
from app.agents.clients import bluesmind_client
from sqlalchemy.ext.asyncio import AsyncSession
from .clients import bluesmind,general_compute,nararouter,gemini,groq,literouter
from .prompts import TECHNICAL_SEO_AGENT_INSTRUCTIONS, CONTENT_SEO_AGENT_INSTRUCTIONS, PERFORMANCE_AGENT_INSTRUCTIONS, STRATEGIC_AGENT_INSTRUCTIONS, REPORT_GENERATOR_AGENT_INSTRUCTIONS
from .schemas import TechnicalSEOAnalysis, ContentSEOAnalysis, PerformanceAnalysis, StrategicAssessment, FinalSEOReport
from agents import Agent, Runner
import asyncio
import os
import httpx
from app.core.database import get_db
from fastapi import Depends
from app.core.models import Audit, AuditStatus


async def crawl_website(url: str) -> str:
    """Crawls a website and returns the extracted content (HTML, Markdown, metadata) using the hosted Crawl4AI instance."""
    base_url = os.getenv("CRAWL4AI_URL")
    api_token = os.getenv("CRAWL4AI_API_TOKEN")
    
    if not base_url or not api_token:
        return "Error: CRAWL4AI_URL or CRAWL4AI_API_TOKEN is not set in the environment."
        
    endpoint = f"{base_url.rstrip('/')}/crawl"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    payload = {"urls": [url]}
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()
            return response.text
        except Exception as e:
            return f"Error crawling {url}: {str(e)}"



technical_seo_agent = Agent(
    name="technical_seo_agent",
    model=nararouter,
    instructions=TECHNICAL_SEO_AGENT_INSTRUCTIONS,
    output_type=TechnicalSEOAnalysis
)

content_seo_agent = Agent(
    name="content_seo_agent",
    model=nararouter,
    instructions=CONTENT_SEO_AGENT_INSTRUCTIONS,
    output_type=ContentSEOAnalysis
)

performance_seo_agent = Agent(
    name="performance_seo_agent",
    model=general_compute,
    instructions=PERFORMANCE_AGENT_INSTRUCTIONS,
    output_type=PerformanceAnalysis
)

strategic_seo_agent = Agent(
    name="strategic_seo_agent",
    model=general_compute,
    instructions=STRATEGIC_AGENT_INSTRUCTIONS,
    output_type=StrategicAssessment
)

report_generator_agent = Agent(
    name="report_generator_agent",
    model=gemini,
    instructions=REPORT_GENERATOR_AGENT_INSTRUCTIONS,
    output_type=FinalSEOReport
)


async def start_audit(audit_id: int, url: str, db: AsyncSession):
    print(f"Starting SEO pipeline for {url}...")
    try:
        audit = await db.get(Audit, audit_id)
        if audit:
            audit.status = AuditStatus.EXTRACTING
            await db.commit()
    
        # 1. Extraction Phase
        markdown_data = await crawl_website(url)
        
        if not markdown_data or markdown_data.startswith("Error"):
            raise ValueError(f"Extraction failed: {markdown_data}")

        audit = await db.get(Audit, audit_id)
        if audit:
            audit.status = AuditStatus.ANALYZING
            await db.commit()

        # 2. Parallel Audits (Technical, Content, Performance, Strategic)
        tech_task = Runner.run(technical_seo_agent, input=markdown_data)
        content_task = Runner.run(content_seo_agent, input=markdown_data)
        perf_task = Runner.run(performance_seo_agent, input=markdown_data)
        strategic_task = Runner.run(strategic_seo_agent, input=markdown_data)
        
        tech_res, content_res, perf_res, strategic_res = await asyncio.gather(tech_task, content_task, perf_task, strategic_task)
        
        tech_audit = tech_res.final_output
        content_audit = content_res.final_output
        perf_audit = perf_res.final_output
        strategic_assessment = strategic_res.final_output
        
        audit = await db.get(Audit, audit_id)
        if audit:
            audit.status = AuditStatus.GENERATING_REPORT
            await db.commit()

        # 4. Report Generation Phase
        report_input = (
            f"Target URL: {url}\n"
            f"Technical Audit: {tech_audit.model_dump_json() if tech_audit else 'None'}\n"
            f"Content Audit: {content_audit.model_dump_json() if content_audit else 'None'}\n"
            f"Performance Audit: {perf_audit.model_dump_json() if perf_audit else 'None'}\n"
            f"Strategic Assessment: {strategic_assessment.model_dump_json() if strategic_assessment else 'None'}"
        )
        
        report_res = await Runner.run(report_generator_agent, input=report_input)
        final_report = report_res.final_output
        
        print(f"SEO Pipeline completed for {url}!")
        
        audit = await db.get(Audit, audit_id)
        if audit:
            audit.status = AuditStatus.COMPLETED
            audit.result_data = final_report.model_dump() if final_report else None
            await db.commit()
            
        return final_report
    except Exception as e:
        audit = await db.get(Audit, audit_id)
        if audit:
            audit.status = AuditStatus.FAILED
            audit.error_message = str(e)
            await db.commit()
        raise e

from app.core.database import AsyncSessionLocal
import traceback

async def run_audit_background(audit_id: int, url: str):
    """
    Wrapper to run start_audit in the background with its own database session.
    """
    async with AsyncSessionLocal() as db:
        try:
            await start_audit(audit_id, url, db)
        except Exception as e:
            print(f"Background audit failed for audit_id {audit_id}: {e}")
            traceback.print_exc()
