import requests
import json

def test_search_details():
    """Test search functionality and examine the results in detail"""
    base_url = "https://search-compare-2.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing Search Results in Detail")
    print("=" * 50)
    
    # Test basic search
    search_data = {
        "query": "python programming",
        "safe_search": True
    }
    
    try:
        response = requests.post(f"{api_url}/search", json=search_data, timeout=60)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            results = response.json()
            print(f"Total Results: {len(results)}")
            
            # Count results by source
            yandex_count = sum(1 for r in results if r['source'] == 'yandex')
            ddg_count = sum(1 for r in results if r['source'] == 'duckduckgo')
            
            print(f"DuckDuckGo Results: {ddg_count}")
            print(f"Yandex Results: {yandex_count}")
            
            print("\n📋 Sample Results:")
            for i, result in enumerate(results[:5]):  # Show first 5 results
                print(f"\n{i+1}. [{result['source'].upper()}] {result['title']}")
                print(f"   URL: {result['url']}")
                print(f"   Snippet: {result['snippet'][:100]}...")
                
            # Check if results look real or fallback
            real_ddg_results = [r for r in results if r['source'] == 'duckduckgo' and not r['url'].startswith('https://example.com')]
            real_yandex_results = [r for r in results if r['source'] == 'yandex' and not r['url'].startswith('https://example.com')]
            
            print(f"\n🔍 Analysis:")
            print(f"Real DuckDuckGo Results: {len(real_ddg_results)}")
            print(f"Real Yandex Results: {len(real_yandex_results)}")
            
            if len(real_ddg_results) > 0:
                print("✅ DuckDuckGo scraping is working!")
            else:
                print("⚠️  DuckDuckGo may be using fallback results")
                
            if len(real_yandex_results) > 0:
                print("✅ Yandex scraping is working!")
            else:
                print("⚠️  Yandex is using fallback results (expected due to anti-bot protection)")
                
        else:
            print(f"❌ Search failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error during search test: {e}")

if __name__ == "__main__":
    test_search_details()