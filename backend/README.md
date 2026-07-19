# Industrial Knowledge Intelligence Platform

**AI-Powered Operational Brain for Industrial Asset Management**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Project Overview

An AI-powered platform that transforms fragmented industrial knowledge (P&IDs, maintenance records, safety procedures, inspection reports) into a unified, queryable, and actionable intelligence system. Built for the Industrial Intelligence Hackathon 2026.

### The Problem

- **35% of working hours** wasted searching for information (McKinsey 2024)
- **18-22% of unplanned downtime** caused by knowledge gaps (BIS Research)
- **7-12 disconnected document systems** in typical industrial plants
- **25% of experienced engineers** retiring in next decade, taking knowledge with them

### Our Solution

**Hybrid GraphRAG + Multi-Agent System + Android-First Mobile UX**

- 🧠 **7 Specialized AI Agents** (Copilot, RCA, Compliance, Lessons Learned, etc.)
- 🔗 **Knowledge Graph** linking equipment, failures, documents, regulations
- 📱 **Native Android App** with voice input, offline mode, QR scanner
- 📊 **Quantified ROI:** ₹2.4 crore annual savings, 95.2% time reduction
- ⚡ **Production-Ready:** Handles 1000+ concurrent users

## 📚 Documentation

### Core Documents
- **[PRD](docs/PRODUCT_REQUIREMENTS_DOCUMENT.md)** - Comprehensive Product Requirements (Strategy, UI/UX, Specs)
- **[Architecture](docs/architecture.md)** - System design, DB schemas, and Scalability
- **[Implementation](docs/implementation.md)** - Step-by-step execution roadmap
- **[Docs Overview](docs/README.md)** - Guide on how to use these documents

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/industrial-knowledge-intelligence.git
cd industrial-knowledge-intelligence

# Start all services with Docker Compose
docker-compose up -d

# Install Python dependencies
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run backend
uvicorn main:app --reload

# Run Android app (separate terminal)
cd android-app
npm install

# For development - Expo
npx expo start

# Or build native Android APK
npm run build:android
```

## 🏗️ Architecture

```
User Layer (Android App / Web Dashboard)
         ↓
API Gateway (Load Balancer)
         ↓
FastAPI Pods (Horizontal Scaling)
         ↓
Agent Orchestration (LangGraph)
         ↓
┌────────┼────────┐
│        │        │
Neo4j  Qdrant  PostgreSQL
(Graph)(Vector)(Metadata)
```

## 🎯 Key Features

### For Field Technicians
- 🎤 Voice input (hands-free)
- 📴 Offline mode (works without connectivity)
- 📷 QR scanner (instant equipment history)
- ⚡ Sub-3-second responses

### For Engineers
- 🔍 Equipment failure history with graph traversal
- 📊 Root cause analysis (RCA) generation
- 📈 Pattern detection across [TIMEFRAME]
- 📝 Source citations with page numbers

### For Compliance Officers
- ✅ Automated gap detection (OISD, PESO, Factory Act)
- 📋 Audit evidence package generation
- ⚠️ Risk scoring by severity
- 📆 Expiry tracking (certificates, inspections)

### For Plant Managers
- 💰 ROI dashboard (time saved, cost avoided)
- 📊 Analytics (query trends, knowledge coverage)
- 🎯 Knowledge risk assessment
- 📈 Business impact metrics

## 🧪 Evaluation Results

| Metric | Target | Achieved |
|--------|--------|----------|
| Answer Accuracy | >80% | **91.7%** ✅ |
| Retrieval (RAG) | >70% | **100.0%** ✅ |
| Knowledge Graph (RCA) | >70% | **100.0%** ✅ |
| Compliance Accuracy | >70% | **100.0%** ✅ |
| Troubleshooting | >60% | **58.6%** |
| Concurrent Users | 1000+ | ✅ Tested |

## 🛠️ Tech Stack

**Backend:**
- FastAPI (Python 3.11)
- LangChain + LangGraph (Agent orchestration)
- OpenAI GPT-4-turbo (LLM)

**Databases:**
- Neo4j (Knowledge graph)
- Qdrant (Vector store)
- PostgreSQL (Metadata)
- Redis (Cache)

**Mobile (Android):**
- React Native + Expo (with Android native build)
- Voice: @react-native-voice/voice
- Camera: expo-camera / react-native-camera
- Offline: AsyncStorage + WatermelonDB
- Platform: Android 8.0+ (API level 26+)

**DevOps:**
- Docker + Docker Compose
- Kubernetes (production)
- k6 (load testing)

## 📊 Project Phases

- **Phase 1:** Foundation (infrastructure, document processing)
- **Phase 2:** Intelligence (agents, GraphRAG, benchmarks)
- **Phase 3:** Value & UX (Android app development, ROI dashboard)
- **Phase 4:** Polish & proof (Android APK, load testing, demo video)

## 👥 Team

- **Backend Lead:** Infrastructure, APIs, DevOps
- **ML/Intelligence Lead:** RAG, agents, benchmarking
- **Android/UX Lead:** Android app development, demo, design

## 🏆 Hackathon Judging Criteria

| Criterion | Weight | Our Strategy |
|-----------|--------|--------------|
| Innovation | 25% | Hybrid GraphRAG + 7 agents + proactive monitoring |
| Business Impact | 25% | ₹2.4cr savings, 95.2% time reduction (quantified) |
| Technical Excellence | 20% | 91.7% accuracy, comprehensive benchmarks |
| Scalability | 15% | 1000+ users tested, Kubernetes-ready |
| User Experience | 15% | Android-first, voice/offline/QR features |

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- McKinsey for industrial productivity research
- BIS Research for downtime statistics
- OISD, PESO for regulatory standards
- Open-source communities (LangChain, Neo4j, Qdrant)

## 📞 Contact

For questions or collaboration: [Your Contact Info]

---

**Built with ❤️ for safer, smarter industrial operations**
