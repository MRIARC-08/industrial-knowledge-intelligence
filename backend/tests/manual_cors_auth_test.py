"""
Manual integration test for CORS and API key authentication
Run this script to test the API manually with different scenarios
"""

import requests
import os
from config import settings

# Base URL - change if your API is running on a different port
BASE_URL = "http://localhost:8000"

def print_test_result(test_name: str, passed: bool, details: str = ""):
    """Print formatted test result"""
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"   {details}")
    print()


def test_health_no_auth():
    """Test 1: /health endpoint should not require authentication"""
    print("=" * 60)
    print("Test 1: Health endpoint without authentication")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        passed = response.status_code == 200
        print_test_result(
            "Health endpoint accessible without API key",
            passed,
            f"Status: {response.status_code}, Response: {response.json()}"
        )
        return passed
    except Exception as e:
        print_test_result("Health endpoint accessible", False, f"Error: {e}")
        return False


def test_protected_endpoint_no_auth():
    """Test 2: Protected endpoints should return 401 without API key"""
    print("=" * 60)
    print("Test 2: Protected endpoint without authentication")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/analytics/kpis")
        passed = response.status_code == 401
        details = f"Status: {response.status_code}"
        if response.status_code == 401:
            details += f", Error: {response.json()['detail']}"
        print_test_result(
            "Protected endpoint returns 401 without API key",
            passed,
            details
        )
        return passed
    except Exception as e:
        print_test_result("Protected endpoint blocks access", False, f"Error: {e}")
        return False


def test_protected_endpoint_invalid_key():
    """Test 3: Protected endpoints should return 401 with invalid API key"""
    print("=" * 60)
    print("Test 3: Protected endpoint with invalid API key")
    print("=" * 60)
    
    try:
        headers = {"X-API-Key": "invalid_key_12345"}
        response = requests.get(f"{BASE_URL}/api/v1/analytics/kpis", headers=headers)
        passed = response.status_code == 401
        details = f"Status: {response.status_code}"
        if response.status_code == 401:
            details += f", Error: {response.json()['detail']}"
        print_test_result(
            "Protected endpoint returns 401 with invalid API key",
            passed,
            details
        )
        return passed
    except Exception as e:
        print_test_result("Protected endpoint validates API key", False, f"Error: {e}")
        return False


def test_protected_endpoint_valid_key():
    """Test 4: Protected endpoints should accept valid API key"""
    print("=" * 60)
    print("Test 4: Protected endpoint with valid API key")
    print("=" * 60)
    
    api_key = settings.API_KEY or os.getenv("API_KEY")
    if not api_key:
        print_test_result(
            "Protected endpoint with valid API key",
            False,
            "No API_KEY configured in environment"
        )
        return False
    
    try:
        headers = {"X-API-Key": api_key}
        response = requests.get(f"{BASE_URL}/api/v1/analytics/kpis", headers=headers)
        # Should not return 401 (may return 500 or other errors if backend services aren't running)
        passed = response.status_code != 401
        details = f"Status: {response.status_code}"
        if response.status_code == 200:
            details += " - API accepts valid key and returns data"
        elif response.status_code != 401:
            details += " - API accepts valid key (backend service may be unavailable)"
        print_test_result(
            "Protected endpoint accepts valid API key",
            passed,
            details
        )
        return passed
    except Exception as e:
        print_test_result("Protected endpoint with valid key", False, f"Error: {e}")
        return False


def test_cors_headers():
    """Test 5: CORS headers should be present"""
    print("=" * 60)
    print("Test 5: CORS headers")
    print("=" * 60)
    
    try:
        headers = {"Origin": "http://localhost:3000"}
        response = requests.get(f"{BASE_URL}/health", headers=headers)
        
        # Check for CORS headers
        cors_headers_present = (
            "access-control-allow-origin" in response.headers or
            "Access-Control-Allow-Origin" in response.headers
        )
        
        details = f"Status: {response.status_code}"
        if cors_headers_present:
            origin_header = response.headers.get("access-control-allow-origin") or \
                          response.headers.get("Access-Control-Allow-Origin")
            details += f", CORS Origin: {origin_header}"
        
        print_test_result(
            "CORS headers present in response",
            cors_headers_present,
            details
        )
        return cors_headers_present
    except Exception as e:
        print_test_result("CORS headers present", False, f"Error: {e}")
        return False


def test_cors_preflight():
    """Test 6: CORS preflight requests should not require authentication"""
    print("=" * 60)
    print("Test 6: CORS preflight request")
    print("=" * 60)
    
    try:
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "X-API-Key",
        }
        response = requests.options(f"{BASE_URL}/api/v1/analytics/kpis", headers=headers)
        passed = response.status_code in [200, 204]
        
        details = f"Status: {response.status_code}"
        if passed:
            details += " - Preflight succeeds without API key"
        
        print_test_result(
            "CORS preflight does not require API key",
            passed,
            details
        )
        return passed
    except Exception as e:
        print_test_result("CORS preflight", False, f"Error: {e}")
        return False


def main():
    """Run all manual tests"""
    print("\n")
    print("╔" + "═" * 58 + "╗")
    print("║" + " " * 10 + "CORS & API Key Authentication Tests" + " " * 12 + "║")
    print("╚" + "═" * 58 + "╝")
    print()
    print(f"Testing API at: {BASE_URL}")
    print(f"API Key configured: {'Yes' if settings.API_KEY else 'No'}")
    print()
    
    results = []
    
    # Run all tests
    results.append(("Health endpoint (no auth)", test_health_no_auth()))
    results.append(("Protected endpoint (no auth)", test_protected_endpoint_no_auth()))
    results.append(("Protected endpoint (invalid key)", test_protected_endpoint_invalid_key()))
    results.append(("Protected endpoint (valid key)", test_protected_endpoint_valid_key()))
    results.append(("CORS headers", test_cors_headers()))
    results.append(("CORS preflight", test_cors_preflight()))
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓" if result else "✗"
        print(f"{status} {test_name}")
    
    print()
    print(f"Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! CORS and API key authentication working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check the details above.")
    
    print()


if __name__ == "__main__":
    print("\n⚠️  Make sure the FastAPI server is running on port 8000 before running this test!")
    print("   Start it with: uvicorn main:app --reload\n")
    
    input("Press Enter to continue with the tests...")
    
    main()
