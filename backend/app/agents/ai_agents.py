from agents import Agent,Runner,function_tool
from clients import bluesmind,general_compute,nararouter
from prompts import EXTRACTOR_AGENT_INSTRUCTIONS, TECHNICAL_SEO_AGENT_INSTRUCTIONS, CONTENT_SEO_AGENT_INSTRUCTIONS, PERFORMANCE_AGENT_INSTRUCTIONS, STRATEGIC_AGENT_INSTRUCTIONS, REPORT_GENERATOR_AGENT_INSTRUCTIONS
from schemas import CrawlExtractionOutput, TechnicalSEOAnalysis, ContentSEOAnalysis, PerformanceAnalysis, StrategicAssessment, FinalSEOReport
import asyncio
import os
import httpx

@function_tool
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


Extractor_agent=Agent(
    name="extractor_agent",
    model=general_compute,
    instructions=EXTRACTOR_AGENT_INSTRUCTIONS,
    output_type=CrawlExtractionOutput,
    tools=[crawl_website]
)

technical_seo_agent = Agent(
    name="technical_seo_agent",
    model=bluesmind,
    instructions=TECHNICAL_SEO_AGENT_INSTRUCTIONS,
    output_type=TechnicalSEOAnalysis
)

content_seo_agent = Agent(
    name="content_seo_agent",
    model=bluesmind,
    instructions=CONTENT_SEO_AGENT_INSTRUCTIONS,
    output_type=ContentSEOAnalysis
)

performance_seo_agent = Agent(
    name="performance_seo_agent",
    model=bluesmind,
    instructions=PERFORMANCE_AGENT_INSTRUCTIONS,
    output_type=PerformanceAnalysis
)

strategic_seo_agent = Agent(
    name="strategic_seo_agent",
    model=bluesmind,
    instructions=STRATEGIC_AGENT_INSTRUCTIONS,
    output_type=StrategicAssessment
)

report_generator_agent = Agent(
    name="report_generator_agent",
    model=nararouter,
    instructions=REPORT_GENERATOR_AGENT_INSTRUCTIONS,
    output_type=FinalSEOReport
)


async def main(url:str):
    print(f"Starting SEO pipeline for {url}...")
    
    # 1. Extraction Phase
    # Note: In a complete implementation, you'd fetch the raw Crawl4AI data first. 
    # Here we prompt the extractor agent with the starting command.
    extractor_input = f"Please extract and normalize data for {url}."
    extractor_res = await Runner.run(Extractor_agent, input=extractor_input)
    structured_data = extractor_res.final_output
    try:
        print("Structured Data:", structured_data)
    except UnicodeEncodeError:
        print("Structured Data extracted successfully! (Console encoding prevented full print)")
    
    if not structured_data:
        raise ValueError("Extraction failed to return structured data.")
        
    structured_json = structured_data.model_dump_json()


    # 2. Parallel Audits (Technical, Content, Performance)
    tech_task = Runner.run(technical_seo_agent, input=structured_json)
    content_task = Runner.run(content_seo_agent, input=structured_json)
    perf_task = Runner.run(performance_seo_agent, input=structured_json)
    
    tech_res, content_res, perf_res = await asyncio.gather(tech_task, content_task, perf_task)
    
    tech_audit = tech_res.final_output
    content_audit = content_res.final_output
    perf_audit = perf_res.final_output
    
    # 3. Strategic Scoring Phase
    strategic_input = (
        f"Technical: {tech_audit.model_dump_json() if tech_audit else 'None'}\n"
        f"Content: {content_audit.model_dump_json() if content_audit else 'None'}\n"
        f"Performance: {perf_audit.model_dump_json() if perf_audit else 'None'}"
    )
    strategic_res = await Runner.run(strategic_seo_agent, input=strategic_input)
    strategic_assessment = strategic_res.final_output
    
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
    return final_report

if __name__ == "__main__":
    # Test the pipeline with a placeholder URL
    asyncio.run(main("https://notion.so"))