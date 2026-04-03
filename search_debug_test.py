import requests
import json
from datetime import datetime

def test_search_detailed():
    """Test search with detailed debugging"""
    print("🔍 Testing search with detailed debugging...")
    
    # Test with a simple query
    search_data = {
        "query": "test",
        "safe_search": True
    }
    
    try:
        response = requests.post(
            'https://search-compare-2.preview.emergentagent.com/api/search',
            json=search_data,
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            results = response.json()
            print(f"Results type: {type(results)}")
            print(f"Number of results: {len(results)}")
            
            if len(results) > 0:
                print("\nFirst result structure:")
                print(json.dumps(results[0], indent=2))
                
                # Check source distribution
                sources = {}
                for result in results:
                    source = result.get('source', 'unknown')
                    sources[source] = sources.get(source, 0) + 1
                
                print(f"\nSource distribution: {sources}")
            else:
                print("❌ No results returned - this indicates scraping issues")
                
        else:
            print(f"❌ Error response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {str(e)}")

def test_different_queries():
    """Test with different query types"""
    queries = [
        "python",
        "javascript",
        "machine learning",
        "web development",
        "artificial intelligence"
    ]
    
    print("\n🔍 Testing different queries...")
    
    for query in queries:
        print(f"\nTesting query: '{query}'")
        try:
            response = requests.post(
                'https://search-compare-2.preview.emergentagent.com/api/search',
                json={"query": query, "safe_search": True},
                timeout=30
            )
            
            if response.status_code == 200:
                results = response.json()
                print(f"  Results: {len(results)}")
                if len(results) > 0:
                    sources = [r.get('source') for r in results]
                    yandex_count = sources.count('yandex')
                    ddg_count = sources.count('duckduckgo')
                    print(f"  Yandex: {yandex_count}, DuckDuckGo: {ddg_count}")
                    break  # Found working query
            else:
                print(f"  Error: {response.status_code}")
                
        except Exception as e:
            print(f"  Exception: {str(e)}")

if __name__ == "__main__":
    test_search_detailed()
    test_different_queries()