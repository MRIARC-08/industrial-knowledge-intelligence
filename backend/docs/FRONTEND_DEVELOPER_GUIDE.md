# Frontend Developer Guide

**Industrial Knowledge Intelligence Platform**

This guide helps frontend developers integrate with the backend API and understand the system architecture.

---

## Quick Start

### 1. Get Your API Key
Contact the backend team or check your `.env` file for the API key:
```bash
API_KEY=your-secret-key-here
```

### 2. Set Up Your Frontend Environment
```bash
# React/Dashboard
cd dashboard
cp .env.example .env
# Edit .env and set:
VITE_API_URL=http://localhost:8000
VITE_API_KEY=your-api-key-here

# React Native/Mobile
cd mobile
cp .env.example .env
# Edit .env and set:
API_URL=http://localhost:8000
API_KEY=your-api-key-here
```

### 3. Test API Connection
```javascript
const response = await fetch('http://localhost:8000/health');
const data = await response.json();
console.log(data); // Should show { status: "healthy", ... }
```

---

## API Client Setup

### Option 1: Using Axios (Recommended)

Create an API client utility:

```javascript
// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  timeout: 30000 // 30 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('[API Error]', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        // Handle unauthorized - redirect to login or show error
        console.error('Unauthorized: Invalid or missing API key');
      } else if (error.response.status === 429) {
        // Handle rate limiting
        console.error('Rate limit exceeded. Please try again later.');
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('[API No Response]', error.request);
    } else {
      // Something else happened
      console.error('[API Setup Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Option 2: Using Fetch API

```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY;

async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    throw error;
  }
}

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' })
};
```

---

## Common API Usage Examples

### 1. Query the AI System

```javascript
import api from './services/api';

async function askQuestion(question) {
  try {
    const response = await api.post('/api/v1/query', {
      query: question,
      user_id: 'current_user_id', // Get from auth context
      user_role: 'engineer', // engineer | technician | manager
      equipment_context: null // Optional equipment tag
    });
    
    return {
      answer: response.data.answer,
      confidence: response.data.confidence,
      sources: response.data.sources,
      responseTime: response.data.response_time_ms
    };
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

// Usage in React component
function QueryComponent() {
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (question) => {
    setLoading(true);
    try {
      const result = await askQuestion(question);
      setAnswer(result);
    } catch (error) {
      alert('Failed to get answer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // ... render UI
}
```

### 2. Get Equipment List

```javascript
async function getEquipmentList() {
  try {
    const response = await api.get('/api/v1/equipment/list');
    return response.data.equipment;
  } catch (error) {
    console.error('Failed to fetch equipment:', error);
    throw error;
  }
}

// Usage with React Query
import { useQuery } from '@tanstack/react-query';

function EquipmentListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['equipment'],
    queryFn: getEquipmentList,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data.map(equipment => (
        <EquipmentCard key={equipment.tag} equipment={equipment} />
      ))}
    </div>
  );
}
```

### 3. Get Equipment History

```javascript
async function getEquipmentHistory(equipmentTag) {
  try {
    const response = await api.get(`/api/v1/equipment/${equipmentTag}/history`);
    return {
      equipment: response.data.equipment,
      failures: response.data.failures,
      documents: response.data.documents
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Equipment ${equipmentTag} not found`);
    }
    throw error;
  }
}

// Usage
const history = await getEquipmentHistory('P-101A');
console.log(`${history.equipment.name} has ${history.failures.length} failures`);
```

### 4. Upload Document

```javascript
async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/api/v1/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Usage in React with file input
function DocumentUpload() {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const result = await uploadDocument(file);
      alert(`Document uploaded: ${result.message}`);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
  };
  
  return (
    <input 
      type="file" 
      accept=".pdf" 
      onChange={handleFileChange}
    />
  );
}
```

### 5. Get Analytics Data

```javascript
// Get KPIs
async function getKPIs() {
  const response = await api.get('/api/v1/analytics/kpis');
  return response.data;
}

// Get query trends
async function getQueryTrends(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate.toISOString());
  if (endDate) params.append('end_date', endDate.toISOString());
  
  const response = await api.get(`/api/v1/analytics/query-trends?${params}`);
  return response.data;
}

// Get agent performance
async function getAgentPerformance() {
  const response = await api.get('/api/v1/analytics/agent-performance');
  return response.data.agents;
}

// Calculate ROI
async function calculateROI(teamSize, avgSalary, downtimeIncidents) {
  const params = new URLSearchParams({
    team_size: teamSize,
    avg_salary: avgSalary,
    downtime_incidents: downtimeIncidents
  });
  
  const response = await api.get(`/api/v1/analytics/roi?${params}`);
  return response.data;
}
```

### 6. Get Compliance Data

```javascript
// Get compliance gaps
async function getComplianceGaps(severity = null, status = null) {
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  if (status) params.append('status', status);
  
  const response = await api.get(`/api/v1/compliance/gaps?${params}`);
  return response.data;
}

// Get certificates
async function getCertificates() {
  const response = await api.get('/api/v1/compliance/certificates');
  return response.data;
}

// Usage
const highSeverityGaps = await getComplianceGaps('high', 'open');
const expiringCerts = await getCertificates();
```

### 7. Check System Health

```javascript
async function getSystemHealth() {
  const response = await api.get('/api/v1/system/health');
  return response.data;
}

// Monitor system health with polling
function SystemHealthMonitor() {
  const { data, refetch } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: getSystemHealth,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  const overallStatus = data?.overall_status;
  const statusColor = {
    healthy: 'green',
    degraded: 'yellow',
    down: 'red'
  }[overallStatus];
  
  return (
    <div style={{ color: statusColor }}>
      System Status: {overallStatus}
    </div>
  );
}
```

### 8. Audio Transcription (Mobile)

```javascript
import { Audio } from 'expo-av';

async function transcribeAudio(audioUri) {
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    type: 'audio/m4a',
    name: 'recording.m4a'
  });
  
  try {
    const response = await api.post('/api/v1/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data.text;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
}

// Usage in React Native
async function handleVoiceQuery() {
  // 1. Record audio
  const recording = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  // ... record audio ...
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  
  // 2. Transcribe
  const transcribedText = await transcribeAudio(uri);
  
  // 3. Query system
  const answer = await askQuestion(transcribedText);
  
  return answer;
}
```

---

## Error Handling Best Practices

### 1. Handle Common Errors

```javascript
async function safeApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.response) {
      // Server error response
      switch (error.response.status) {
        case 401:
          // Unauthorized - invalid API key
          console.error('Authentication failed. Check your API key.');
          // Redirect to login or show auth error
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 422:
          // Validation error
          console.error('Invalid request:', error.response.data.detail);
          break;
        case 429:
          // Rate limit
          console.error('Rate limit exceeded. Please slow down.');
          break;
        case 500:
          // Server error
          console.error('Server error. Please try again later.');
          break;
        default:
          console.error('API Error:', error.response.status);
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error. Check your connection.');
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    throw error; // Re-throw for component to handle
  }
}
```

### 2. Create Error Boundary Component

```javascript
import React from 'react';

class APIErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('API Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## State Management

### Using React Context for API State

```javascript
// src/contexts/ApiContext.jsx
import { createContext, useContext, useState } from 'react';

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const makeRequest = async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ApiContext.Provider value={{ loading, error, makeRequest }}>
      {children}
    </ApiContext.Provider>
  );
}

export const useApi = () => useContext(ApiContext);

// Usage
function MyComponent() {
  const { loading, error, makeRequest } = useApi();
  
  const handleQuery = () => {
    makeRequest(() => askQuestion('What is P-101A?'));
  };
  
  return (
    <div>
      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}
      <button onClick={handleQuery}>Query</button>
    </div>
  );
}
```

---

## Caching Strategy

### Client-Side Caching with React Query

```javascript
// src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}

// Component using cached data
function EquipmentList() {
  const { data, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: getEquipmentList,
    staleTime: 5 * 60 * 1000 // Don't refetch for 5 minutes
  });
  
  // ...
}
```

### Manual Caching with LocalStorage

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedData(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  const age = Date.now() - timestamp;
  
  if (age > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }
  
  return data;
}

function setCachedData(key, data) {
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
}

// Usage
async function getEquipmentWithCache() {
  const cacheKey = 'equipment_list';
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  // Fetch from API
  const data = await getEquipmentList();
  setCachedData(cacheKey, data);
  
  return data;
}
```

---

## Real-Time Updates (Future)

When WebSocket support is added, you can listen for real-time updates:

```javascript
// src/services/websocket.js
const WS_URL = 'ws://localhost:8000/ws';

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = {};
  }
  
  connect() {
    this.ws = new WebSocket(WS_URL);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, payload } = data;
      
      if (this.listeners[type]) {
        this.listeners[type].forEach(callback => callback(payload));
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  subscribe(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const wsClient = new WebSocketClient();

// Usage
useEffect(() => {
  wsClient.connect();
  
  wsClient.subscribe('equipment_status_change', (data) => {
    console.log('Equipment status changed:', data);
    // Update UI
  });
  
  return () => wsClient.disconnect();
}, []);
```

---

## Performance Tips

### 1. Debounce Search Queries

```javascript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const results = await askQuestion(query);
  setResults(results);
}, 500); // Wait 500ms after user stops typing

function SearchInput() {
  const handleChange = (e) => {
    debouncedSearch(e.target.value);
  };
  
  return <input onChange={handleChange} />;
}
```

### 2. Lazy Load Large Lists

```javascript
import { useInfiniteQuery } from '@tanstack/react-query';

function InfiniteEquipmentList() {
  const {
    data,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery({
    queryKey: ['equipment'],
    queryFn: ({ pageParam = 0 }) => getEquipmentPage(pageParam),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    }
  });
  
  // Implement infinite scroll
}
```

### 3. Prefetch Common Data

```javascript
import { queryClient } from './queryClient';

// Prefetch equipment list on app load
queryClient.prefetchQuery({
  queryKey: ['equipment'],
  queryFn: getEquipmentList
});
```

---

## Testing API Integration

### Unit Test Example

```javascript
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';

const server = setupServer(
  rest.get('http://localhost:8000/api/v1/equipment/list', (req, res, ctx) => {
    return res(ctx.json({
      equipment: [
        { tag: 'P-101A', name: 'Test Pump', type: 'Pump' }
      ],
      total: 1
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays equipment', async () => {
  render(<EquipmentList />);
  
  await waitFor(() => {
    expect(screen.getByText('Test Pump')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Common Issues

**1. CORS Error**
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```
**Solution:** Add your frontend origin to `ALLOWED_ORIGINS` in backend `.env`:
```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

**2. 401 Unauthorized**
```
{ "detail": "Missing API key. Please provide X-API-Key header." }
```
**Solution:** Check that `X-API-Key` header is set in all requests.

**3. Network Error / Connection Refused**
```
Error: Network Error
```
**Solution:** 
- Check backend is running: `curl http://localhost:8000/health`
- Verify `API_URL` in frontend `.env`
- Check for firewall/proxy issues

**4. Rate Limit Exceeded**
```
{ "detail": "Rate limit exceeded: 10000 per 1 minute" }
```
**Solution:** Implement request debouncing or caching to reduce API calls.

---

## Next Steps

1. Read the full [API Documentation](API_DOCUMENTATION.md)
2. Check [Architecture Documentation](architecture.md) for system design
3. Review [Implementation Guide](implementation.md) for backend details
4. Join the developer Slack channel for support

---

**Last Updated:** July 14, 2024
