# Industrial Knowledge Intelligence Web Dashboard - Design Specification

**Date:** [DATE]  
**Version:** 1.0  
**Target:** Hackathon Winning Submission  
**Timeline:** [TIMEFRAME] development

---

## Executive Summary

This specification defines a production-ready React web dashboard for the Industrial Knowledge Intelligence Platform, designed to maximize hackathon judging scores by showcasing business impact (₹2.4cr savings), innovation (automated compliance), and technical excellence (91.7% accuracy) to plant managers and compliance officers.

### Strategic Purpose
- **Primary Goal:** Maximize Business Impact (25%) and Innovation (25%) judging scores
- **Target Users:** Plant Managers (ROI tracking) and Compliance Officers (audit preparation)
- **Key Differentiator:** Industrial control room aesthetic with precision animations, not generic admin template

---

## Design Philosophy: Control Room at Night

The dashboard draws from industrial control room environments where critical information glows with purpose in dark settings. Every design choice roots in the industrial world: monospace fonts for equipment tags, pulse animations for live data, layered elevation mimicking physical control panels.

**Visual Risk:** Pulse indicator system - every live metric has a subtle heartbeat animation that quickens when critical, matching how plant operators use peripheral vision to detect anomalies.

---

## Tech Stack

### Core Framework
- **React:** 18.x with hooks
- **Build Tool:** Create React App
- **Routing:** React Router v6
- **UI Library:** Material-UI v5
- **State Management:** React Context + React Query
- **HTTP Client:** Axios

### Visualization
- **Primary Charts:** Plotly.js (interactive)
- **Backup Charts:** Recharts (lightweight)
- **Graphs:** vis-network (knowledge graph)

### Animation
- **Framework:** Framer Motion
- **Performance:** 60fps, GPU-accelerated transforms

### Template Base
**Material Dashboard React** by Creative Tim
- Repo: https://github.com/creativetimofficial/material-dashboard-react
- License: MIT
- Rationale: Professional production quality judges will recognize

---

## Design System

### Color Palette: Control Room at Night

```javascript
const theme = {
  background: {
    deepSpace: '#0A0E1A',      // Main background
    console: '#141B2E',         // Card backgrounds
    raised: '#1E293B',          // Elevated cards
  },
  status: {
    operational: '#2563EB',     // Primary blue (desaturated from #3B82F6)
    safe: '#10B981',            // Success green
    caution: '#F59E0B',         // Warning amber
    critical: '#EF4444',        // Error red
    analysis: '#8B5CF6',        // AI purple
  },
  text: {
    primary: '#F3F4F6',
    secondary: '#9CA3AF',
    muted: '#64748B',
  }
};
```

### Typography

**Display & Body:** Inter (700/600/500/400)  
**Monospace Data:** JetBrains Mono (500)

```css
/* Type Scale */
--text-hero: 64px/700;        /* ₹2.4 Crore */
--text-display: 48px/700;     /* Page titles */
--text-h1: 24px/700;          /* Section headers */
--text-h2: 18px/600;          /* Card titles */
--text-body: 14px/400;        /* Body text */
--text-caption: 12px/400;     /* Labels */
--text-mono: 12px/500;        /* Equipment tags */

/* Spacing */
letter-spacing: -0.02em;      /* Headers only */
line-height: 1.5;             /* Body text */
```

### Elevation System

Three levels mimicking industrial control panel depth:

```css
/* L1: Base Cards */
box-shadow: 0 1px 3px rgba(0,0,0,0.3);

/* L2: Elevated (KPIs, Metrics) */
box-shadow: 0 4px 12px rgba(0,0,0,0.4);
filter: drop-shadow(0 0 8px rgba(37,99,235,0.1));

/* L3: Floating (Modals, Alerts) */
box-shadow: 0 20px 40px rgba(0,0,0,0.6);
backdrop-filter: blur(16px);
```

### Animation Principles

**Mechanical Precision:** Movements are purposeful, not bouncy.

```javascript
// Easing
const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
};

// Durations
const duration = {
  shortest: 150,
  short: 200,
  standard: 300,
  long: 500,
  chart: 600,
};

// Signature: Pulse Animation
@keyframes pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Normal: [TIME] cycle */
/* Warning: [TIME] cycle */
/* Critical: [TIME] cycle */
```

---

## Page Architecture

### 1. Executive Dashboard (`/dashboard`)

**Purpose:** Maximize Business Impact score - show ₹2.4cr savings prominently

**Hero Section:**
- Single large number: **₹2.4 CRORE** (64px, animated count-up)
- Subtitle: "Prevented downtime cost over [TIMEFRAME]"
- Particle system background (drifting dots)

**KPI Cards (4):**
```
[95.2% Time Saved] [91.7% Accuracy] [850 hrs Saved] [142 Active Users]
```
- Animated count-up on load
- Staggered fade-in (100ms delay each)
- L2 elevation with subtle glow

**ROI Calculator:**
- Glass morphism card
- Input sliders: Team Size, Avg Salary, Downtime Cost
- Real-time calculation output: "You Save: ₹X.XX Crore/Year"
- Smooth number transitions

**Query Trends Chart:**
- Gradient area chart (last [TIMEFRAME])
- Data from: evaluation_results.json
- Animated draw (left to right, 600ms)

**Agent Performance:**
- Horizontal bar chart
- Categories: RAG (100%), RCA (100%), Compliance (100%), Troubleshooting (58.6%)
- Single blue color, opacity variations

**Live Activity Feed:**
- Last 5 queries/events
- New items slide in from bottom
- Timestamp in mono font

---

### 2. Compliance Module (`/compliance`)

**Purpose:** Show Innovation - automated gap detection

**Compliance Status Cards (4):**
```
[⭕ 85% OISD, 15 gaps] [⭕ 92% PESO, 4 gaps]
[⭕ 78% BIS, 12 gaps]  [⭕ 95% Factory Act, 2 gaps]
```
- Circular progress indicators
- Animated fill (0% → actual %, [TIME])
- Color: Green (>90%), Amber (70-90%), Red (<70%)

**Critical Gaps Table:**
- Top 10 gaps only (no pagination needed)
- Columns: Severity Badge | Regulation | Description | Equipment
- Zebra striping for readability
- Sortable by severity
- Row fade-in (50ms stagger)

**Certificate Expiry Tracker:**
- Timeline format with countdown badges
- Color-coded: Green (>[TIMEFRAME]), Yellow (30-90), Red (<30)
- Pulse animation on items <[TIMEFRAME]
- Examples: "TK-50 Pressure Test - [TIMEFRAME]", "V-200 Inspection - [TIMEFRAME]"

**Risk Score Gauge:**
- Semicircle gauge (0-100)
- Current risk: 68/100 (Medium Risk)
- Animated needle sweep

**Export Button:**
- "Generate Audit Report" (downloads PDF)
- Hover: scale(1.05) + shadow increase

---

### 3. Analytics Dashboard (`/analytics`)

**Purpose:** Technical Excellence - deep metrics

**Time Range Toggle:**
- [7d] [30d] [90d]
- Slide indicator animation

**Query Distribution (Donut Chart):**
- RAG: 30%, RCA: 30%, Compliance: 20%, Troubleshooting: 20%
- Single blue with opacity gradient
- Animated rotating segments

**Top Equipment (Horizontal Bars):**
- P-101A: 450 queries
- V-200: 320 queries
- TK-50: 210 queries
- HX-301: 180 queries
- C-400: 95 queries
- Bar growth animation (800ms ease-out)

**Response Time Trend:**
- Line chart with gradient fill
- Last [TIMEFRAME] showing improvement
- Trailing fade (recent data bright, old data 20% opacity)

**Agent Accuracy Bars:**
- Data from evaluation_results.json
- Flat fills, no gradients
- Percentage labels at bar end

---

### 4. Equipment Explorer (`/equipment`)

**Purpose:** Show GraphRAG capability

**Search Bar:**
- "Search equipment by tag, type, or location"
- Live filter with debounce (300ms)

**Equipment Cards (Grid: 3 columns):**
```
┌──────────┐
│ P-101A   │  ← Tag in monospace, rotated -2deg
│ ████████ │  ← Equipment icon
│ Pump     │
│ ● Active │  ← Status with pulse
│ 2 Failures│
└──────────┘
```
- Hover: translateY(-4px) + shadow
- Click: Opens detail modal

**Equipment Detail Modal:**
- Slide up from bottom + backdrop blur
- Tabs: Overview | Failure History | Documents | Graph

**Tab 1: Overview**
- Specs table (max temp, pressure, flow)
- Current status badge
- Responsible person

**Tab 2: Failure History**
- Vertical timeline (last 10 events)
- Data from: `/api/v1/equipment/{tag}/history`
- Animated sequence (points appear sequentially)

**Tab 3: Connected Documents**
- List of 5-10 documents
- Click to preview

**Tab 4: Knowledge Graph**
- vis-network graph
- Nodes: Equipment, Documents, Failure Events
- Interactive: Click to navigate

---

### 5. System Health (`/system`)

**Purpose:** Show Scalability - handles 1000+ users

**Service Status Cards (5):**
```
[● FastAPI Healthy, 28ms] [● Neo4j Healthy, 15ms]
[● Qdrant Healthy, 12ms]  [● PostgreSQL Healthy, 8ms]
[● Redis Healthy, 3ms]
```
- Status dots with pulse animation
- Different pulse rates per service (visual variety)
- Green dots only (system is healthy)

**Live Metrics:**
- Queries/min: 142 (odometer rolling numbers)
- Avg Response: [TIME]
- Cache Hit: 85%
- Error Rate: 0.02%

**Response Time Chart:**
- Line chart (last 100 queries)
- Updates every [TIME]
- Trailing fade effect

**Database Stats:**
- Simple number cards
- Documents: 450
- Graph Nodes: 1,243
- Vector Embeddings: 8,920

---

### 6. Document Management (`/documents`)

**Purpose:** Functional upload interface

**Upload Zone:**
- Drag & drop area
- "Drop documents here or click to browse"
- Supports: PDF, DOCX, XLSX
- Border pulse on drag-over

**Processing Queue:**
- List of recent uploads (last 10)
- Progress bars for processing
- Status: Processing (spinner) | Complete (checkmark)
- Smooth progress bar animation

**Recent Documents Table:**
- Filename | Type | Upload Date | Status | Actions
- Max 10 items
- Expandable to show more if needed

---

## Shared Components

### Navigation

**Sidebar (Fixed Left):**
- Logo + "Industrial Brain" title
- Navigation items:
  - Dashboard (Home icon)
  - Compliance (Shield icon)
  - Analytics (Chart icon)
  - Equipment (Cog icon)
  - System Health (Activity icon)
  - Documents (File icon)
- Active state: Blue accent bar + background
- Hover: Background opacity 10%

**Top Bar:**
- Global search (equipment/documents)
- Notifications icon (bell with badge)
- User profile dropdown (hardcoded "Manager" role)

### Loading States

**Skeleton Screens:**
- Shimmer effect (gradient moving left to right)
- Match layout of actual content
- No "Loading..." text

**Spinners:**
- Custom gear icon rotation (industrial theme)
- Not default Material-UI spinner

### Notifications

**Toast System:**
- Position: top-right
- Slide in from right (200ms)
- Auto-dismiss: [TIME]
- Types: Success (green), Warning (amber), Error (red), Info (blue)

---

## Data Integration

### Existing Backend APIs

1. `GET /health` → System Health page
2. `POST /api/v1/query` → Quick query widget (optional)
3. `GET /api/v1/equipment/{tag}/history` → Equipment detail modal
4. `POST /api/v1/documents/upload` → Document upload

### Mock Data Strategy

For hackathon, create mock data generators for:
- Analytics metrics (query trends, agent performance)
- Compliance gaps (from sample regulations)
- Certificate expiry dates
- Live system metrics

**Data Source:** `data/evaluation_results.json` for accuracy metrics

### API Service Layer

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_KEY = process.env.REACT_APP_API_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// Endpoints
export const healthCheck = () => apiClient.get('/health');
export const query = (data) => apiClient.post('/api/v1/query', data);
export const getEquipmentHistory = (tag) => apiClient.get(`/api/v1/equipment/${tag}/history`);
export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/api/v1/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Mock data generators
export const getMockAnalytics = () => { /* ... */ };
export const getMockCompliance = () => { /* ... */ };
```

---

## Responsive Design

**Desktop-First (1920x1080 primary target):**
- Optimized for demo presentation
- Works down to 1366x768 (minimum)

**Breakpoints:**
- Desktop: 1280px+
- Tablet: 768px - 1279px (optional, low priority)
- Mobile: <768px (not needed for hackathon)

---

## Performance Targets

- **Initial Load:** <[TIME]
- **Page Transitions:** <300ms
- **Chart Render:** <600ms
- **Animation Frame Rate:** 60fps
- **Bundle Size:** <800KB (gzipped)

---

## Development Phases

### Phase 1: Setup (2 hours)
1. Clone Material Dashboard React template
2. Clean unnecessary pages/components
3. Configure routing for 6 pages
4. Set up custom Material-UI theme (dark mode, colors)
5. Install dependencies (Framer Motion, Plotly, vis-network)
6. Create API service layer

### Phase 2: Core Pages (4 hours)
1. Executive Dashboard (1.5h)
   - Hero section with particle background
   - KPI cards with animations
   - ROI calculator
   - Charts
2. Compliance Module (1.5h)
   - Status cards with circular progress
   - Gaps table
   - Certificate tracker
3. Analytics Dashboard (1h)
   - Time range toggle
   - Charts with real data

### Phase 3: Secondary Pages (2 hours)
1. Equipment Explorer (1h)
   - Card grid
   - Detail modal
   - Search/filter
2. System Health (0.5h)
   - Service cards
   - Live metrics
3. Documents (0.5h)
   - Upload zone
   - Processing queue

### Phase 4: Polish (1.5 hours)
1. Navigation setup
2. Responsive fixes
3. Loading states
4. Error handling
5. Animation fine-tuning

### Phase 5: Integration & Demo ([TIME])
1. Connect real APIs
2. Populate with mock data
3. Demo script walkthrough
4. Performance check

**Total: [TIMEFRAME]**

---

## Success Criteria

### Functional Requirements
- [ ] All 6 pages navigable with smooth transitions
- [ ] Charts display evaluation_results.json data
- [ ] ROI calculator is interactive and updates in real-time
- [ ] Compliance gaps table is sortable
- [ ] Equipment history displays from API
- [ ] System health connects to /health endpoint
- [ ] Document upload works (at minimum, shows UI)

### Visual Requirements
- [ ] Professional, polished UI matching industrial control room theme
- [ ] Consistent dark theme (#0A0E1A background)
- [ ] Smooth animations at 60fps
- [ ] No broken layouts on 1920x1080
- [ ] Pulse animations on live metrics
- [ ] Glass morphism effects on elevated cards

### Demo Requirements
- [ ] Loads in <[TIME] on demo machine
- [ ] No console errors
- [ ] ₹2.4 crore savings story is clear and prominent
- [ ] Judges can interact with ROI calculator
- [ ] Live metrics show realistic data
- [ ] Professional enough that judges believe it's production-ready

---

## Risk Mitigation

### Technical Risks
1. **Plotly too heavy:** Fallback to Recharts
2. **Animation performance:** Reduce particle count, simplify pulses
3. **API not ready:** Use comprehensive mock data generators
4. **Time constraint:** Cut Documents page if needed (5 pages sufficient)

### Visual Risks
1. **Too dark:** Add subtle texture overlay (1% noise) for depth
2. **Pulse too distracting:** Reduce opacity range (0.8-0.95 instead of 0.5-1)
3. **Charts look generic:** Custom color palettes, remove default borders

---

## Deployment

**For Hackathon:**
- Build: `npm run build`
- Serve: `npx serve -s build`
- Demo URL: `http://localhost:3000`

**Production Considerations (Post-Hackathon):**
- Deploy to Vercel/Netlify
- Environment variables for API_URL and API_KEY
- CDN for static assets
- Enable HTTPS

---

## Appendix A: File Structure

```
web-dashboard/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── Cards/
│   │   │   ├── KPICard.jsx
│   │   │   ├── StatusCard.jsx
│   │   │   └── MetricCard.jsx
│   │   ├── Charts/
│   │   │   ├── LineChart.jsx
│   │   │   ├── BarChart.jsx
│   │   │   ├── DonutChart.jsx
│   │   │   └── GaugeChart.jsx
│   │   ├── Tables/
│   │   │   └── DataTable.jsx
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   └── Footer.jsx
│   │   └── Common/
│   │       ├── LoadingSpinner.jsx
│   │       ├── SkeletonLoader.jsx
│   │       └── Toast.jsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   ├── index.jsx
│   │   │   ├── ROICalculator.jsx
│   │   │   └── ActivityFeed.jsx
│   │   ├── Compliance/
│   │   │   ├── index.jsx
│   │   │   ├── GapsTable.jsx
│   │   │   └── CertificateTracker.jsx
│   │   ├── Analytics/
│   │   │   └── index.jsx
│   │   ├── Equipment/
│   │   │   ├── index.jsx
│   │   │   ├── EquipmentCard.jsx
│   │   │   └── EquipmentModal.jsx
│   │   ├── SystemHealth/
│   │   │   └── index.jsx
│   │   └── Documents/
│   │       └── index.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── mockData.js
│   │   └── endpoints.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── animations.js
│   │   └── constants.js
│   ├── theme/
│   │   ├── theme.js
│   │   └── globalStyles.js
│   ├── App.jsx
│   └── index.jsx
├── package.json
└── README.md
```

---

## Appendix B: Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^10.12.0",
    "plotly.js": "^2.24.0",
    "react-plotly.js": "^2.6.0",
    "recharts": "^2.7.0",
    "vis-network": "^9.1.6",
    "axios": "^1.4.0",
    "react-query": "^3.39.0",
    "date-fns": "^2.30.0",
    "react-toastify": "^9.1.0"
  }
}
```

---

## Appendix C: Color Reference

```css
/* Background Layers */
--bg-deep-space: #0A0E1A;
--bg-console: #141B2E;
--bg-raised: #1E293B;

/* Status Colors */
--status-operational: #2563EB;
--status-safe: #10B981;
--status-caution: #F59E0B;
--status-critical: #EF4444;
--status-analysis: #8B5CF6;

/* Text */
--text-primary: #F3F4F6;
--text-secondary: #9CA3AF;
--text-muted: #64748B;

/* Utility */
--border: rgba(255, 255, 255, 0.1);
--overlay: rgba(0, 0, 0, 0.5);
```

---

**END OF SPECIFICATION**
