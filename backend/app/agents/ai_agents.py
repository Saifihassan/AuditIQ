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


from crawl4ai import AsyncWebCrawler, CrawlerRunConfig
import sys
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse

def extract_seo_facts(html_content: str, target_url: str) -> dict:
    """Extracts ground-truth technical, on-page, and accessibility SEO facts from raw HTML using BeautifulSoup."""
    soup = BeautifulSoup(html_content or "", "html.parser")

    # 1. Canonical URL
    canonical_tag = soup.find("link", rel=lambda x: x and "canonical" in (x if isinstance(x, str) else " ".join(x)).lower())
    canonical_href = canonical_tag.get("href", "").strip() if canonical_tag else None

    # 2. Title Tag
    title_tag = soup.find("title")
    title_text = title_tag.get_text(strip=True) if title_tag else ""

    # 3. Meta Description
    meta_desc_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
    meta_desc_text = meta_desc_tag.get("content", "").strip() if meta_desc_tag else ""

    # 4. Heading Hierarchy
    h1_elements = soup.find_all("h1")
    h1_list = [h.get_text(" ", strip=True) for h in h1_elements]

    # 5. Image Alt Accessibility
    images = soup.find_all("img")
    missing_alts = []
    unoptimized_images = 0

    for img in images:
        src = img.get("src") or img.get("data-src") or "unknown"
        alt = img.get("alt")
        # Flag missing alt
        if alt is None:
            missing_alts.append(src[:100])
        
        # Check for lazy loading
        if img.get("loading") != "lazy":
            unoptimized_images += 1

    # 6. Structured Data (JSON-LD)
    json_ld_scripts = soup.find_all("script", type="application/ld+json")
    has_structured_data = len(json_ld_scripts) > 0

    # 7. Clean Visible Word Count
    # Decompose non-content nodes before counting
    for noise in soup(["script", "style", "svg", "noscript", "iframe", "canvas"]):
        noise.decompose()

    visible_text = soup.get_text(separator=" ", strip=True)
    words = re.findall(r"\b\w+\b", visible_text)
    word_count = len(words)

    # Meta Robots & Indexability
    robots_tag = soup.find("meta", attrs={"name": re.compile(r"^robots$", re.I)})
    robots_content = robots_tag.get("content", "").strip() if robots_tag else ""
    is_indexable = "noindex" not in robots_content.lower()

    return {
        "target_url": target_url,
        "technical": {
            "is_indexable": is_indexable,
            "robots_meta": robots_content,
            "canonical_url": canonical_href,
            "has_canonical": bool(canonical_href),
            "title": {
                "text": title_text,
                "length": len(title_text),
                "status": "optimal" if 50 <= len(title_text) <= 60 else ("too_short" if len(title_text) < 50 else "too_long")
            },
            "meta_description": {
                "text": meta_desc_text,
                "length": len(meta_desc_text),
                "status": "optimal" if 120 <= len(meta_desc_text) <= 160 else ("too_short" if len(meta_desc_text) < 120 else "too_long")
            },
            "has_structured_data": has_structured_data
        },
        "content": {
            "word_count": word_count,
            "h1_count": len(h1_list),
            "h1_tags": h1_list
        },
        "performance_and_accessibility": {
            "total_images_found": len(images),
            "images_missing_alt_count": len(missing_alts),
            "sample_images_missing_alt": missing_alts[:5],
            "images_lacking_lazy_loading": unoptimized_images
        }
    }

async def _crawl_website_async(url: str) -> str:
    """Internal async function to run Crawl4AI."""
    config = CrawlerRunConfig(
        excluded_tags=[
            # High-Token & Non-Content Elements
            "svg", "path", "g", "defs", "symbol",
            "style",
            "noscript", "iframe", "canvas",
            "video", "audio", "source", "track",
            "template", "slot", "embed", "object",
            # Forms & Interactive UI
            "form", "input", "textarea", "select", "option", "optgroup",
            "button", "label", "fieldset", "legend", "dialog",
            # Media & Miscellaneous Utilities
            "map", "area", "portal"
        ],
        excluded_selector='script:not([type="application/ld+json"]), .cookie-banner, .cookie-consent, .advertisement, .ad-banner, .ads, .popup, .modal, .overlay',
        exclude_external_links=True
    )
    
    try:
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url, config=config)
            if result.success:
                html_content = getattr(result, "html", "") or getattr(result, "cleaned_html", "") or ""
                seo_facts = extract_seo_facts(html_content, url)
                
                # Include body preview for extra context
                md = result.markdown
                if isinstance(md, dict):
                    body_text = md.get("fit_markdown") or md.get("raw_markdown") or ""
                elif hasattr(md, "raw_markdown"):
                    body_text = md.raw_markdown
                else:
                    body_text = str(md) if md else ""

                seo_facts["raw_content_preview"] = body_text[:20000]

                import json
                return json.dumps(seo_facts, indent=2)
            else:
                return f"Error crawling {url}: {result.error_message}"
    except Exception as e:
        return f"Error crawling {url}: {str(e)}"

def _sync_crawl_worker(url: str) -> str:
    """Worker function running in a background thread with WindowsProactorEventLoopPolicy."""
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    return asyncio.run(_crawl_website_async(url))

async def crawl_website(url: str) -> str:
    """Crawls a website in a dedicated thread to ensure ProactorEventLoop on Windows under Uvicorn."""
    return await asyncio.to_thread(_sync_crawl_worker, url)


technical_seo_agent = Agent(
    name="technical_seo_agent",
    model=bluesmind,
    model_settings={"temperature": 0.1, "top_p": 0.8},
    instructions=TECHNICAL_SEO_AGENT_INSTRUCTIONS,
    output_type=TechnicalSEOAnalysis
)

content_seo_agent = Agent(
    name="content_seo_agent",
    model=bluesmind,
    model_settings={"temperature": 0.1, "top_p": 0.8},
    instructions=CONTENT_SEO_AGENT_INSTRUCTIONS,
    output_type=ContentSEOAnalysis
)

performance_seo_agent = Agent(
    name="performance_seo_agent",
    model=bluesmind,
    model_settings={"temperature": 0.1, "top_p": 0.8},
    instructions=PERFORMANCE_AGENT_INSTRUCTIONS,
    output_type=PerformanceAnalysis
)

strategic_seo_agent = Agent(
    name="strategic_seo_agent",
    model=bluesmind,
    model_settings={"temperature": 0.1, "top_p": 0.8},
    instructions=STRATEGIC_AGENT_INSTRUCTIONS,
    output_type=StrategicAssessment
)

report_generator_agent = Agent(
    name="report_generator_agent",
    model=bluesmind,
    model_settings={"temperature": 0.1, "top_p": 0.8},
    instructions=REPORT_GENERATOR_AGENT_INSTRUCTIONS,
    output_type=FinalSEOReport
)


def create_agents(model):
    """Create all audit agents dynamically with the given model."""
    return {
        "technical": Agent(
            name="technical_seo_agent",
            model=model,
            model_settings={"temperature": 0.1, "top_p": 0.8},
            instructions=TECHNICAL_SEO_AGENT_INSTRUCTIONS,
            output_type=TechnicalSEOAnalysis
        ),
        "content": Agent(
            name="content_seo_agent",
            model=model,
            model_settings={"temperature": 0.1, "top_p": 0.8},
            instructions=CONTENT_SEO_AGENT_INSTRUCTIONS,
            output_type=ContentSEOAnalysis
        ),
        "performance": Agent(
            name="performance_seo_agent",
            model=model,
            model_settings={"temperature": 0.1, "top_p": 0.8},
            instructions=PERFORMANCE_AGENT_INSTRUCTIONS,
            output_type=PerformanceAnalysis
        ),
        "strategic": Agent(
            name="strategic_seo_agent",
            model=model,
            model_settings={"temperature": 0.1, "top_p": 0.8},
            instructions=STRATEGIC_AGENT_INSTRUCTIONS,
            output_type=StrategicAssessment
        ),
        "report": Agent(
            name="report_generator_agent",
            model=model,
            model_settings={"temperature": 0.1, "top_p": 0.8},
            instructions=REPORT_GENERATOR_AGENT_INSTRUCTIONS,
            output_type=FinalSEOReport
        )
    }


async def start_audit(audit_id: int, url: str, db: AsyncSession, api_key: str = None, provider: str = None, model_name: str = None):
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
        if api_key and provider and model_name:
            from app.agents.clients import create_user_model
            model = create_user_model(api_key, provider, model_name)
            agents = create_agents(model)
        else:
            agents = {
                "technical": technical_seo_agent,
                "content": content_seo_agent,
                "performance": performance_seo_agent,
                "strategic": strategic_seo_agent,
                "report": report_generator_agent
            }

        tech_res = await Runner.run(agents["technical"], input=markdown_data)
        content_res = await Runner.run(agents["content"], input=markdown_data)
        perf_res = await Runner.run(agents["performance"], input=markdown_data)
        strategic_res = await Runner.run(agents["strategic"], input=markdown_data)
        
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
        
        report_res = await Runner.run(agents["report"], input=report_input)
        final_report = report_res.final_output
        
        # --- Python Post-Processing Validation ---
        if final_report:
            # Protocol lock correction: Ensure Target URL is https://
            if final_report.target_url.startswith("http://"):
                final_report.target_url = final_report.target_url.replace("http://", "https://", 1)
            
            # Array length enforcement: top 3 priorities exactly 3 items
            if len(final_report.top_3_priorities) > 3:
                final_report.top_3_priorities = final_report.top_3_priorities[:3]
            elif len(final_report.top_3_priorities) < 3:
                final_report.top_3_priorities.extend(["N/A"] * (3 - len(final_report.top_3_priorities)))
                
            # Array length enforcement: thirty_day_action_plan exactly 4 items
            if len(final_report.thirty_day_action_plan) > 4:
                final_report.thirty_day_action_plan = final_report.thirty_day_action_plan[:4]
            elif len(final_report.thirty_day_action_plan) < 4:
                final_report.thirty_day_action_plan.extend(["Review progress and iterate"] * (4 - len(final_report.thirty_day_action_plan)))

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

async def run_audit_background(audit_id: int, url: str, api_key: str = None, provider: str = None, model_name: str = None):
    """
    Wrapper to run start_audit in the background with its own database session.
    """
    async with AsyncSessionLocal() as db:
        try:
            await start_audit(audit_id, url, db, api_key=api_key, provider=provider, model_name=model_name)
        except Exception as e:
            print(f"Background audit failed for audit_id {audit_id}: {e}")
            traceback.print_exc()
