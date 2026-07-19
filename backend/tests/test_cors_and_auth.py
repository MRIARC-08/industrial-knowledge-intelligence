"""
Tests for CORS configuration and API key authentication middleware
Validates Requirements 13.12, 13.13, and 1.2
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os

# Import the FastAPI app
from main import app
from config import settings


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture
def valid_api_key():
    """Return a valid API key for testing"""
    return settings.API_KEY if settings.API_KEY else "test_api_key_12345"


@pytest.fixture
def mock_settings(monkeypatch):
    """Mock settings with test values"""
    monkeypatch.setenv("API_KEY", "test_api_key_12345")
    monkeypatch.setenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
    

class TestCORSConfiguration:
    """Test CORS middleware configuration - Requirement 13.12"""
    
    def test_cors_headers_present_with_valid_origin(self, client, valid_api_key):
        """Test that CORS headers are present for allowed origins"""
        response = client.get(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
            }
        )
        
        # Check CORS headers are present
        assert "access-control-allow-origin" in response.headers
        
    def test_cors_allows_configured_origins(self, client, valid_api_key):
        """Test that CORS allows origins from ALLOWED_ORIGINS environment variable"""
        # Test with first allowed origin
        response = client.options(
            "/api/v1/analytics/kpis",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            }
        )
        
        assert response.status_code in [200, 204]
        
    def test_cors_allows_all_methods(self, client):
        """Test that CORS allows all HTTP methods"""
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            }
        )
        
        # CORS preflight should succeed
        assert response.status_code in [200, 204]
        
    def test_cors_allows_api_key_header(self, client):
        """Test that CORS allows X-API-Key header"""
        response = client.options(
            "/api/v1/analytics/kpis",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "X-API-Key",
            }
        )
        
        # CORS preflight should succeed
        assert response.status_code in [200, 204]


class TestAPIKeyAuthentication:
    """Test API key authentication middleware - Requirement 13.13"""
    
    def test_health_endpoint_no_auth_required(self, client):
        """Test that /health endpoint does not require API key"""
        response = client.get("/health")
        
        # Should succeed without API key
        assert response.status_code == 200
        assert "status" in response.json()
        
    def test_protected_endpoint_missing_api_key(self, client):
        """Test that protected endpoints return 401 when API key is missing"""
        response = client.get("/api/v1/analytics/kpis")
        
        # Should return 401 Unauthorized
        assert response.status_code == 401
        assert "detail" in response.json()
        assert "Missing API key" in response.json()["detail"]
        
    def test_protected_endpoint_invalid_api_key(self, client):
        """Test that protected endpoints return 401 with invalid API key"""
        response = client.get(
            "/api/v1/analytics/kpis",
            headers={"X-API-Key": "invalid_key_12345"}
        )
        
        # Should return 401 Unauthorized
        assert response.status_code == 401
        assert "detail" in response.json()
        assert "Invalid API key" in response.json()["detail"]
        
    def test_protected_endpoint_valid_api_key(self, client, valid_api_key):
        """Test that protected endpoints accept valid API key"""
        # Mock the settings to ensure we have a valid API key
        with patch("main.settings") as mock_settings:
            mock_settings.API_KEY = valid_api_key
            
            response = client.get(
                "/api/v1/analytics/kpis",
                headers={"X-API-Key": valid_api_key}
            )
            
            # Should not return 401 (may return other codes if endpoint logic fails)
            assert response.status_code != 401
            
    def test_all_api_endpoints_require_auth(self, client):
        """Test that all /api/v1/* endpoints require API key"""
        endpoints = [
            "/api/v1/analytics/kpis",
            "/api/v1/analytics/query-trends",
            "/api/v1/equipment/list",
            "/api/v1/compliance/gaps",
            "/api/v1/documents/list",
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 401, f"Endpoint {endpoint} should require auth"
            
    def test_root_endpoint_requires_auth(self, client):
        """Test that root endpoint requires API key (not /health)"""
        response = client.get("/")
        
        # Root endpoint should also require auth
        assert response.status_code == 401
        
    def test_api_key_case_sensitive(self, client, valid_api_key):
        """Test that API key validation is case-sensitive"""
        if not valid_api_key:
            pytest.skip("No API key configured")
            
        # Try with different case
        wrong_case_key = valid_api_key.upper() if valid_api_key.islower() else valid_api_key.lower()
        
        response = client.get(
            "/api/v1/analytics/kpis",
            headers={"X-API-Key": wrong_case_key}
        )
        
        # Should return 401 if key has mixed case
        if wrong_case_key != valid_api_key:
            assert response.status_code == 401


class TestSecurityIntegration:
    """Test integration of CORS and API key authentication - Requirement 1.2"""
    
    def test_cors_with_valid_auth(self, client, valid_api_key):
        """Test that CORS works together with API key authentication"""
        with patch("main.settings") as mock_settings:
            mock_settings.API_KEY = valid_api_key
            
            response = client.get(
                "/api/v1/analytics/kpis",
                headers={
                    "X-API-Key": valid_api_key,
                    "Origin": "http://localhost:3000",
                }
            )
            
            # Should have CORS headers even with auth
            if response.status_code != 401:
                assert "access-control-allow-origin" in response.headers or response.status_code == 200
                
    def test_preflight_request_no_auth_required(self, client):
        """Test that OPTIONS preflight requests don't require API key"""
        response = client.options(
            "/api/v1/analytics/kpis",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "X-API-Key",
            }
        )
        
        # Preflight should succeed without API key
        assert response.status_code in [200, 204]
        
    def test_error_response_format(self, client):
        """Test that authentication errors return proper JSON format"""
        response = client.get("/api/v1/analytics/kpis")
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert isinstance(data["detail"], str)
        
    def test_multiple_origins_supported(self, client):
        """Test that multiple origins from ALLOWED_ORIGINS are supported"""
        origins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
        ]
        
        for origin in origins:
            response = client.options(
                "/health",
                headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "GET",
                }
            )
            
            # Each configured origin should work
            assert response.status_code in [200, 204]


class TestErrorMessages:
    """Test error message quality - Requirement 13.13"""
    
    def test_missing_api_key_error_message(self, client):
        """Test that missing API key error is clear and actionable"""
        response = client.get("/api/v1/analytics/kpis")
        
        assert response.status_code == 401
        error_detail = response.json()["detail"]
        
        # Should mention both the problem and the solution
        assert "Missing" in error_detail or "missing" in error_detail
        assert "X-API-Key" in error_detail
        
    def test_invalid_api_key_error_message(self, client):
        """Test that invalid API key error is clear"""
        response = client.get(
            "/api/v1/analytics/kpis",
            headers={"X-API-Key": "wrong_key"}
        )
        
        assert response.status_code == 401
        error_detail = response.json()["detail"]
        
        # Should mention the key is invalid
        assert "Invalid" in error_detail or "invalid" in error_detail
        assert "X-API-Key" in error_detail


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
