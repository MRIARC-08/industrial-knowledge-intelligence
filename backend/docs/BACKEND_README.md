# Backend Documentation

**Industrial Knowledge Intelligence Platform - Complete Documentation for Frontend Developers**

Welcome! This documentation provides everything frontend developers need to integrate with the backend API.

---

## 📚 Documentation Structure

### Getting Started (Start Here!)

1. **[Frontend Developer Guide](FRONTEND_DEVELOPER_GUIDE.md)** ⭐ **START HERE**
   - Quick start guide
   - API client setup (Axios/Fetch)
   - Common usage examples
   - Error handling
   - Troubleshooting

2. **[API Documentation](API_DOCUMENTATION.md)** 📖 **COMPLETE API REFERENCE**
   - All endpoints with examples
   - Request/response schemas
   - Authentication guide
   - Rate limiting
   - Error codes

3. **[Backend Architecture](BACKEND_ARCHITECTURE.md)** 🏗️ **SYSTEM DESIGN**
   - System architecture overview
   - Technology stack
   - Data flow diagrams
   - Database schemas
   - Agent system explained

---

## 🚀 Quick Start

### 1. Get Your API Key
```bash
# Check your .env file or contact backend team
API_KEY=your-secret-key-here
```

### 2. Set Up Frontend Environment

**React Dashboard:**
```bash
cd dashboard
cp .env.example .env
# Edit .env:
VITE_API_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here
```

**React Native Mobile:**
```bash
cd mobile
cp .env.example .env
# Edit .env:
API_URL=http://localhost:8000
API_KEY=your-api-key-here
```

### 3. Test API Connection

```javascript
// Test health endpoint (no auth required)
const response = await fetch('http://localhost:8000/health');
const data = await response.json();
console.log(data); // { status: "healthy", services: {...} }
```

---

## 📋 API Endpoints Summary

### Core Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/health` | GET | Health check | ❌ No |
| `/api/v1/query` | POST | Query AI system | ✅ Yes |
| `/api/v1/transcribe` | POST | Audio transcription | ✅ Yes |

### Analytics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analytics/kpis` | GET | Dashboard KPIs |
| `/api/v1/analytics/query-trends` | GET | Query trends over time |
| `/api/v1/analytics/agent-performance` | GET | Agent metrics |
| `/api/v1/analytics/activity-feed` | GET | Recent activity |
| `/api/v1/analytics/roi` | GET | ROI calculator |
| `/api/v1/analytics/top-equipment` | GET | Most queried equipment |

### Equipment Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/equipment/list` | GET | All equipment |
| `/api/v1/equipment/{tag}/history` | GET | Equipment failure history |

### Compliance Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/compliance/gaps` | GET | Compliance gaps |
| `/api/v1/compliance/certificates` | GET | Certificate status |

### Documents Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/documents/list` | GET | All documents |
| `/api/v1/documents/upload` | POST | Upload PDF |

### System Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/system/health` | GET | Detailed health check |

---

## 💡 Common Use Cases

### 1. Ask a Question

```javascript
import api from './services/api';

const result = await api.post('/api/v1/query', {
  query: 'What are the first checks for P-101A vibration?',
  user_id: 'user123',
  user_role: 'engineer'
});

console.log(result.data.answer);
console.log(result.data.confidence);
console.log(result.data.sources);
```

### 2. Get Equipment List

```javascript
const response = await api.get('/api/v1/equipment/list');
const equipment = response.data.equipment;

equipment.forEach(item => {
  console.log(`${item.tag}: ${item.name} - ${item.status}`);
});
```

### 3. Upload Document

```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const result = await api.post('/api/v1/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

console.log(result.data.status); // "processing"
```

### 4. Get Analytics KPIs

```javascript
const response = await api.get('/api/v1/analytics/kpis');
const kpis = response.data;

console.log(`Annual Savings: $${kpis.annual_savings}`);
console.log(`System Accuracy: ${kpis.system_accuracy}%`);
console.log(`Active Users: ${kpis.active_users}`);
```

---

## 🔐 Authentication

All endpoints (except `/health`) require API key authentication:

```javascript
// Add X-API-Key header to all requests
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'X-API-Key': 'your-api-key-here'
  }
});
```

**Common Auth Errors:**
- `401 Unauthorized`: Missing or invalid API key
- `403 Forbidden`: API key validation failed

---

## ⚡ Performance Tips

1. **Cache Responses**: Use React Query or similar for client-side caching
2. **Debounce Search**: Wait 300-500ms after user stops typing
3. **Lazy Load**: Load data on demand, not all at once
4. **Prefetch**: Load common data on app startup
5. **Batch Requests**: Combine multiple analytics calls if possible

**Expected Response Times:**
- Cached query: ~10-20ms
- New query: ~1-3 seconds
- Document upload: ~100ms (processing happens in background)

---

## 🐛 Troubleshooting

### CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution:** Add your origin to `ALLOWED_ORIGINS` in backend `.env`:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

### 401 Unauthorized
```
{ "detail": "Missing API key" }
```
**Solution:** Check that `X-API-Key` header is set in all requests

### Network Error
```
Error: Network Error
```
**Solution:** 
- Verify backend is running: `curl http://localhost:8000/health`
- Check `API_URL` in frontend `.env`

---

## 📊 Data Models

### Query Response
```typescript
interface QueryResponse {
  answer: string;                // AI-generated answer
  confidence: number;            // 0.0 to 1.0
  sources: Array<{
    doc_id: string;
    chunk_text: string;          // First 200 chars
    score: number;
    equipment_tags: string[];
  }>;
  response_time_ms: number;      // Response time
}
```

### Equipment Item
```typescript
interface EquipmentItem {
  tag: string;                   // e.g., "P-101A"
  name: string;
  type: string;                  // e.g., "Centrifugal Pump"
  status: 'operational' | 'warning' | 'critical';
  failures: number;
  last_failure?: string;         // ISO datetime
  max_temp?: number;
  max_pressure?: number;
  max_flow?: number;
}
```

### Compliance Gap
```typescript
interface ComplianceGap {
  id: string;
  severity: 'high' | 'medium' | 'low';
  regulation: string;            // e.g., "OSHA 1910.119"
  clause: string;
  description: string;
  equipment: string;
  status: 'open' | 'resolved';
}
```

---

## 🔄 WebSocket Support (Coming Soon)

Real-time updates for:
- Live equipment metrics
- System health changes
- Document processing status
- Query notifications

```javascript
// Future WebSocket API (not yet implemented)
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

---

## 📦 Complete Documentation Index

### Must-Read Documents

1. **[Frontend Developer Guide](FRONTEND_DEVELOPER_GUIDE.md)** - Start here for integration guide
2. **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
3. **[Backend Architecture](BACKEND_ARCHITECTURE.md)** - System design and data flow

### Additional Resources

- [Product Requirements](PRODUCT_REQUIREMENTS_DOCUMENT.md) - Product specification
- [Implementation Guide](implementation.md) - Technical implementation details
- [Architecture Overview](architecture.md) - High-level architecture

---

## 🆘 Getting Help

### Common Questions

**Q: Where do I get my API key?**
A: Check your `.env` file or contact the backend team

**Q: What format should I use for dates?**
A: ISO 8601 format: `2024-07-14T10:30:00Z`

**Q: How do I handle rate limits?**
A: Implement request debouncing and caching. See rate limits in [API Documentation](API_DOCUMENTATION.md#rate-limiting)

**Q: Can I test the API without authentication?**
A: Only the `/health` endpoint works without authentication

**Q: What file formats are supported for upload?**
A: Currently only PDF files are supported

### Support Channels

- Check the documentation first
- Review example code in [Frontend Developer Guide](FRONTEND_DEVELOPER_GUIDE.md)
- Contact the backend team for API issues
- Check `app.log` for backend errors

---

## 📝 Contributing

### Updating Documentation

When adding new endpoints:
1. Update [API Documentation](API_DOCUMENTATION.md) with full details
2. Add example to [Frontend Developer Guide](FRONTEND_DEVELOPER_GUIDE.md)
3. Update this README's endpoint summary
4. Add code comments to route files

### Code Comments

All backend route files include detailed comments explaining:
- Purpose and functionality
- Request/response formats
- Error handling
- Performance considerations

---

## 🚦 Status & Health

### Check Backend Health

```bash
# Quick health check
curl http://localhost:8000/health

# Detailed system health
curl -H "X-API-Key: your-key" http://localhost:8000/api/v1/system/health
```

### Service Status

✅ **Production Ready:**
- Authentication & rate limiting
- Query endpoint with caching
- Document upload
- Analytics endpoints
- Equipment endpoints
- Compliance endpoints
- System health monitoring

🚧 **In Development:**
- WebSocket support
- Batch query API
- Streaming responses
- Advanced analytics

---

## 📈 Version History

**v0.1.0** (Current)
- Initial API implementation
- Multi-agent query system
- Document processing pipeline
- Analytics endpoints
- Complete documentation

---

## 📄 License

Industrial Knowledge Intelligence Platform  
Copyright © 2024

---

**Last Updated:** July 14, 2024

**Documentation Maintained By:** Industrial Knowledge Intelligence Team

---

## Quick Links

- 🏠 [Main README](../README.md)
- 📖 [API Docs](API_DOCUMENTATION.md)
- 👨‍💻 [Developer Guide](FRONTEND_DEVELOPER_GUIDE.md)
- 🏗️ [Architecture](BACKEND_ARCHITECTURE.md)
