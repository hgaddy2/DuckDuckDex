import requests
import sys
import json
from datetime import datetime

class DualSearchAPITester:
    def __init__(self, base_url="https://search-compare-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    result["error"] = error_data
                    print(f"   Error: {error_data}")
                except:
                    result["error"] = response.text
                    print(f"   Error: {response.text}")

            self.test_results.append(result)
            return success, result["response_data"] if success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_search_basic(self):
        """Test basic search functionality"""
        search_data = {
            "query": "python programming",
            "safe_search": True
        }
        return self.run_test(
            "Basic Search",
            "POST",
            "search",
            200,
            data=search_data,
            timeout=60  # Search might take longer
        )

    def test_search_with_filters(self):
        """Test search with all filters"""
        search_data = {
            "query": "machine learning",
            "date_filter": "month",
            "region": "us-en",
            "safe_search": True
        }
        return self.run_test(
            "Search with Filters",
            "POST",
            "search",
            200,
            data=search_data,
            timeout=60
        )

    def test_search_empty_query(self):
        """Test search with empty query"""
        search_data = {
            "query": "",
            "safe_search": True
        }
        return self.run_test(
            "Search Empty Query",
            "POST",
            "search",
            200,  # Should still return 200 but with empty results
            data=search_data
        )

    def test_create_bookmark(self):
        """Test creating a bookmark"""
        bookmark_data = {
            "title": "Test Bookmark",
            "url": "https://example.com",
            "snippet": "This is a test bookmark snippet",
            "source": "duckduckgo"
        }
        success, response = self.run_test(
            "Create Bookmark",
            "POST",
            "bookmarks",
            200,
            data=bookmark_data
        )
        return success, response.get('id') if success else None

    def test_get_bookmarks(self):
        """Test getting all bookmarks"""
        return self.run_test(
            "Get All Bookmarks",
            "GET",
            "bookmarks",
            200
        )

    def test_delete_bookmark(self, bookmark_id):
        """Test deleting a bookmark"""
        if not bookmark_id:
            print("⚠️  Skipping delete test - no bookmark ID available")
            return False, {}
        
        return self.run_test(
            "Delete Bookmark",
            "DELETE",
            f"bookmarks/{bookmark_id}",
            200
        )

    def test_delete_nonexistent_bookmark(self):
        """Test deleting a non-existent bookmark"""
        fake_id = "non-existent-id-12345"
        return self.run_test(
            "Delete Non-existent Bookmark",
            "DELETE",
            f"bookmarks/{fake_id}",
            404
        )

    def validate_search_response(self, response_data):
        """Validate search response structure"""
        if not isinstance(response_data, list):
            print("❌ Search response should be a list")
            return False
        
        for i, result in enumerate(response_data):
            required_fields = ['title', 'url', 'snippet', 'source']
            for field in required_fields:
                if field not in result:
                    print(f"❌ Result {i} missing required field: {field}")
                    return False
            
            if result['source'] not in ['yandex', 'duckduckgo']:
                print(f"❌ Result {i} has invalid source: {result['source']}")
                return False
        
        print(f"✅ Search response validation passed - {len(response_data)} results")
        return True

    def validate_bookmark_response(self, response_data):
        """Validate bookmark response structure"""
        required_fields = ['id', 'title', 'url', 'snippet', 'source', 'created_at']
        for field in required_fields:
            if field not in response_data:
                print(f"❌ Bookmark response missing required field: {field}")
                return False
        
        print("✅ Bookmark response validation passed")
        return True

def main():
    print("🚀 Starting Dual Search Engine API Tests")
    print("=" * 50)
    
    tester = DualSearchAPITester()
    bookmark_id = None

    # Test 1: Root endpoint
    tester.test_root_endpoint()

    # Test 2: Basic search
    success, search_response = tester.test_search_basic()
    if success and search_response:
        tester.validate_search_response(search_response)

    # Test 3: Search with filters
    success, filtered_response = tester.test_search_with_filters()
    if success and filtered_response:
        tester.validate_search_response(filtered_response)

    # Test 4: Empty query search
    tester.test_search_empty_query()

    # Test 5: Create bookmark
    success, bookmark_id = tester.test_create_bookmark()
    if success and bookmark_id:
        print(f"   Created bookmark with ID: {bookmark_id}")

    # Test 6: Get bookmarks
    success, bookmarks_response = tester.test_get_bookmarks()
    if success and bookmarks_response:
        print(f"   Found {len(bookmarks_response)} bookmarks")
        if len(bookmarks_response) > 0:
            tester.validate_bookmark_response(bookmarks_response[0])

    # Test 7: Delete bookmark
    if bookmark_id:
        tester.test_delete_bookmark(bookmark_id)

    # Test 8: Delete non-existent bookmark
    tester.test_delete_nonexistent_bookmark()

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the details above.")
        
        # Print failed tests summary
        failed_tests = [test for test in tester.test_results if not test['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test_name']}: {test.get('error', 'Status code mismatch')}")
        
        return 1

if __name__ == "__main__":
    sys.exit(main())