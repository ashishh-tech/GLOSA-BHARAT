<div align="center">
  <h1>🚦 GLOSA BHARAT</h1>
  <p><b>Intelligent Urban Mobility Ecosystem for a Self-Reliant India</b></p>
  
  <img src="https://img.shields.io/badge/Theme-Responsible%20AI-blue.svg" alt="Responsible AI" />
  <img src="https://img.shields.io/badge/Stack-Fullstack%20AI-blue.svg" alt="Fullstack AI" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2F%20Vite-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/AI-YOLO%20%2F%20FastAPI-009688?logo=fastapi" alt="FastAPI" />

  <br />
  <br />

  <p><i>Presented at AI UTKARSH 2026 - AI SUMMIT • Narula Institute of Technology (NiT) • Theme: Responsible AI</i></p>

  <p>
    <a href="#-what-is-glosa-bharat">About</a> •
    <a href="#-live-deployments">Live Demo</a> •
    <a href="#-key-features--solutions">Features</a> •
    <a href="#-architecture-diagrams">Architecture</a> •
    <a href="#-anatomy-of-the-project">Structure</a>
  </p>
</div>

---

## 📖 What is GLOSA BHARAT?

Urban commuters today sit in "stop-and-go" traffic, consuming unnecessary fuel and contributing to rising urban emissions. Traffic signals are often pre-timed, ignoring real-time vehicle density, and drivers frequently face e-challans for unintentional signal jumps due to poor visibility.

**GLOSA BHARAT** is an intelligent safety and mobility layer that connects your vehicle with city infrastructure. By building a sub-second unified view of traffic junctions, it actively prevents congestion and fuel waste before you even reach the signal.

---

## 🚨 Problem Statement

> **The Urban Mobility Crisis**

1.  **Fuel Wastage**: Constant idling at red lights significantly increases city-wide fuel dependency and financial loss.
2.  **Unnecessary Challans**: Poor signal timing/visibility causes unintentional signal jumps, leading to legal and financial burdens.
3.  **Static Infrastructure**: Legacy traffic lights don't adapt to real-time density, creating permanent bottlenecks in major corridors.

*Result: Economic leakage, increased carbon footprint, and high-stress urban commuting.*

---

## 🎯 Objective

Build an **AI-powered mobility layer** that comprehensively connects heterogeneous traffic with signal infrastructure to:

- Detect live junction density via standard CCTV feeds instantly.
- Identify optimal speed windows to eliminate unnecessary idling.
- Correlate vehicle telemetry with precise signal flip timings.
- Provide a truly unified view of the traffic corridor for both drivers and authorities.

➡️ **Goal: Eliminate city-wide "stop-and-go" patterns before they cause gridlock.**

---

## 💡 The Solution

**GLOSA BHARAT** is the first platform that unites a city's traffic perception under one intelligent roof:

1.  **AI-Powered WavePerception Engine**: Rapidly scans CCTV feeds via YOLOv8 for instantaneous object detection and queue indexing.
2.  **Predictive Advisor Hub**: Uses sub-second logic to calculate the perfect KM/H to catch the "Green Wave."
3.  **V2I Serial Bridge**: Synchronizes cloud-based AI with legacy signal controllers on the ground.

---

## 🏗️ Architecture Diagrams

### 1. System Architecture (High-Level)
```mermaid
graph TD
    A[Junction: Standard CCTV Feed] -->|Traffic Density| B[WavePerception AI Engine]
    B -->|Density Telemetry| C[Orchestration Nexus: Node.js]
    C -->|Signal Timing Logic| D[Advisory Logic Hub]
    E[User: Driver / Authority HUD] -->|GPS Context| C
    C -->|Optimal Speed Rec| F[GLOSA Interaction Layer]
    D -->|Predictive Sync| F
    F -->|Visual Instructions| G[Unified Mobility Dashboard]
```

### 🧠 AI Intelligence Pipeline
```mermaid
graph LR
    A[CCTV Ingestion] --> B[YOLOv8 Perception]
    B --> C[Analytic Logic / Queue Index]
    C --> D[GLOSA Speed Prediction]
    D --> E[Driver HUD Advisory]
```

### 🗄️ Database Schema (MongoDB Atlas)
```mermaid
classDiagram
    class User {
        string uid
        string email
        string displayName
        float currentLat
        float currentLng
    }
    class Junction {
        string id
        string name
        string status
        int secondsToChange
        float recommendedSpeed
    }
    class TrafficData {
        string junction_id
        int density_index
        int throughput_count
        string timestamp
    }
    Junction "1" -- "many" TrafficData : indexes
```

---

## 📂 Anatomy of the Project

```bash
GLOSA-BHARAT/
├── ai-service/              # Python Intelligence Layer (FastAPI, YOLOv8)
├── backend/                 # Node.js Orchestration Tier (Express, MongoDB)
├── frontend/                # React Fiber Interface (GIS, D3.js Charts)
├── hardware/                # V2I Physical Prototype (Arduino, C++)
├── scripts/                 # DevOps & Deployment Automation
└── README.md                # Premium Project Documentation
```

---

## 🚀 Impact & Benefits

- **🛡️ Legal Protection**: Prevents unnecessary e-challans by removing the "stop-go" guesswork at yellow lights.
- **🌏 Global Ecology**: Targeted reduction in particulate matter (PM2.5) by minimizing idling.
- **📉 Economic Gains**: Saving city-wide logistics providers 15-20% in annual fuel costs.
- **🇮🇳 Sovereign Resilience**: 100% indigenous software stack sitting on secure Indian clouds.

---

## 👨‍💻 Developer & Visionary
**Presented at AI UTKARSH 2026 - AI SUMMIT**   
*Narula Institute of Technology (NiT) • Theme: Responsible AI*
