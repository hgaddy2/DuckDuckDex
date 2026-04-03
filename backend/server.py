from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup
import urllib.parse
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class SearchResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    title: str
    url: str
    snippet: str
    source: str  # 'yandex' or 'duckduckgo'

class SearchRequest(BaseModel):
    query: str
    date_filter: Optional[str] = None
    region: Optional[str] = None
    safe_search: bool = True

class Bookmark(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    url: str
    snippet: str
    source: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookmarkCreate(BaseModel):
    title: str
    url: str
    snippet: str
    source: str

# Scraping Functions
def scrape_duckduckgo(query: str, region: Optional[str] = None, safe_search: bool = True) -> List[SearchResult]:
    """
    Scrape DuckDuckGo search results
    """
    results = []
    try:
        params = {
            'q': query,
            'kl': region if region else 'us-en',
        }
        
        if not safe_search:
            params['kp'] = '-2'
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        response = requests.get('https://html.duckduckgo.com/html/', params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'lxml')
        result_divs = soup.find_all('div', class_='result')
        
        for div in result_divs[:10]:  # Limit to 10 results
            try:
                title_elem = div.find('a', class_='result__a')
                snippet_elem = div.find('a', class_='result__snippet')
                
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    url = title_elem.get('href', '')
                    
                    # DuckDuckGo uses redirect URLs, extract actual URL
                    if url.startswith('//duckduckgo.com/l/'):
                        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(url).query)
                        url = parsed.get('uddg', [''])[0]
                    
                    snippet = snippet_elem.get_text(strip=True) if snippet_elem else ''
                    
                    if title and url:
                        results.append(SearchResult(
                            title=title,
                            url=url,
                            snippet=snippet,
                            source='duckduckgo'
                        ))
            except Exception as e:
                logging.error(f"Error parsing DuckDuckGo result: {e}")
                continue
                
    except Exception as e:
        logging.error(f"Error scraping DuckDuckGo: {e}")
    
    return results

def scrape_yandex(query: str, region: Optional[str] = None, safe_search: bool = True) -> List[SearchResult]:
    """
    Scrape Yandex search results
    """
    results = []
    try:
        params = {
            'text': query,
            'lr': '84' if region == 'us-en' else '84',  # Default to US
        }
        
        if not safe_search:
            params['fyandex'] = '0'
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        response = requests.get('https://yandex.com/search/', params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Yandex uses different selectors - try multiple approaches
        result_items = soup.find_all('li', class_='serp-item')
        
        for item in result_items[:10]:  # Limit to 10 results
            try:
                title_elem = item.find('h2')
                if not title_elem:
                    title_elem = item.find('a')
                
                snippet_elem = item.find('div', class_='text-container')
                if not snippet_elem:
                    snippet_elem = item.find('div', class_='OrganicText')
                
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    link_elem = title_elem.find('a') if title_elem.name != 'a' else title_elem
                    url = link_elem.get('href', '') if link_elem else ''
                    
                    # Make absolute URL
                    if url and not url.startswith('http'):
                        url = 'https://yandex.com' + url
                    
                    snippet = snippet_elem.get_text(strip=True) if snippet_elem else ''
                    
                    if title and url and 'yandex.com' not in url:
                        results.append(SearchResult(
                            title=title,
                            url=url,
                            snippet=snippet,
                            source='yandex'
                        ))
            except Exception as e:
                logging.error(f"Error parsing Yandex result: {e}")
                continue
                
    except Exception as e:
        logging.error(f"Error scraping Yandex: {e}")
    
    return results

def interleave_results(ddg_results: List[SearchResult], yandex_results: List[SearchResult]) -> List[SearchResult]:
    """
    Interleave results from both search engines
    """
    merged = []
    max_len = max(len(ddg_results), len(yandex_results))
    
    for i in range(max_len):
        if i < len(ddg_results):
            merged.append(ddg_results[i])
        if i < len(yandex_results):
            merged.append(yandex_results[i])
    
    return merged

# Routes
@api_router.get("/")
async def root():
    return {"message": "Dual Search Engine API"}

@api_router.post("/search", response_model=List[SearchResult])
async def search(request: SearchRequest):
    """
    Search both DuckDuckGo and Yandex, return interleaved results
    """
    try:
        # Scrape both engines in parallel (in production, use asyncio)
        ddg_results = scrape_duckduckgo(request.query, request.region, request.safe_search)
        yandex_results = scrape_yandex(request.query, request.region, request.safe_search)
        
        # Interleave results
        merged_results = interleave_results(ddg_results, yandex_results)
        
        return merged_results
    except Exception as e:
        logging.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")

@api_router.post("/bookmarks", response_model=Bookmark)
async def create_bookmark(bookmark_data: BookmarkCreate):
    """
    Create a new bookmark
    """
    bookmark = Bookmark(**bookmark_data.model_dump())
    
    # Convert to dict and serialize datetime for MongoDB
    doc = bookmark.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.bookmarks.insert_one(doc)
    return bookmark

@api_router.get("/bookmarks", response_model=List[Bookmark])
async def get_bookmarks():
    """
    Get all bookmarks
    """
    bookmarks = await db.bookmarks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for bookmark in bookmarks:
        if isinstance(bookmark['created_at'], str):
            bookmark['created_at'] = datetime.fromisoformat(bookmark['created_at'])
    
    return bookmarks

@api_router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(bookmark_id: str):
    """
    Delete a bookmark
    """
    result = await db.bookmarks.delete_one({"id": bookmark_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    return {"message": "Bookmark deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()