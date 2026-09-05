import asyncio
import os
import httpx
try:
    import tiktoken
except ImportError:
    tiktoken = None
from dotenv import load_dotenv

load_dotenv()

from crawl4ai import AsyncWebCrawler, CrawlerRunConfig

async def crawl_website(url: str) -> str:
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
                md = result.markdown
                if isinstance(md, dict):
                    return md.get("fit_markdown") or md.get("raw_markdown") or ""
                elif hasattr(md, "raw_markdown"):
                    return md.raw_markdown
                else:
                    return str(md) if md else ""
            else:
                return f"Error crawling {url}: {result.error_message}"
    except Exception as e:
        return f"Error crawling {url}: {str(e)}"

async def main():
    url = "https://www.roiminds.com/"
    print(f"Crawling {url}...")
    content = await crawl_website(url)
    
    if content.startswith("Error"):
        print(content)
        return
        
    print(f"Content length: {len(content)} characters")
    
    if tiktoken:
        enc = tiktoken.get_encoding("cl100k_base")
        tokens = len(enc.encode(content))
        print(f"Token count (cl100k_base): {tokens}")
    else:
        print(f"Approximate token count: {len(content) // 4}")
    
    print("\nFirst 300 characters preview:")
    print(content[:300].encode('ascii', errors='ignore').decode('ascii'))

if __name__ == "__main__":
    asyncio.run(main())
