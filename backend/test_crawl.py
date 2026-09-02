import asyncio
import os
import httpx
try:
    import tiktoken
except ImportError:
    tiktoken = None
from dotenv import load_dotenv

load_dotenv()

async def crawl_website(url: str) -> str:
    base_url = os.getenv("CRAWL4AI_URL")
    api_token = os.getenv("CRAWL4AI_API_TOKEN")
    
    if not base_url or not api_token:
        return "Error: CRAWL4AI_URL or CRAWL4AI_API_TOKEN is not set in the environment."
        
    endpoint = f"{base_url.rstrip('/')}/crawl"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "urls": [url],
        "crawler_config": {
            "excluded_tags": [
                "nav", "footer", "aside", "svg", "iframe",
                "form", "dialog", "noscript", "script", "style",
                "header"
            ],
            "excluded_selector": ".cookie-banner, .cookie-consent, .advertisement, .ad-banner, .ads, #sidebar, .sidebar, .popup, .modal, .overlay, .social-share, .social-links, .comments, #comments",
            "exclude_external_links": True
        }
    }
    
    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            response = await client.post(endpoint, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            if data.get("results") and len(data["results"]) > 0:
                result = data["results"][0]
                md = result.get("markdown")
                if isinstance(md, dict):
                    md = md.get("raw_markdown") or md.get("fit_markdown") or ""
                elif not isinstance(md, str):
                    md = str(md) if md else ""
                
                return md or result.get("html") or response.text
            return response.text
        except Exception as e:
            return f"Error crawling {url}: {str(e)}"

async def main():
    url = "https://ngwebtechnologies.com/"
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

if __name__ == "__main__":
    asyncio.run(main())
