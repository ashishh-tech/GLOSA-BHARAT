<div align="center">
  <h1>🚦 GLOSA BHARAT</h1>
  <p><b>Intelligent Urban Mobility Ecosystem for a Self-Reliant India</b></p>
  
  <img src="https://img.shields.io/badge/Initiative-Atmanirbhar%20Bharat-orange.svg" alt="Atmanirbhar Bharat" />
  <img src="https://img.shields.io/badge/Stack-Fullstack%20AI-blue.svg" alt="Fullstack AI" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2F%20Vite-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/AI-YOLO%20%2F%20FastAPI-009688?logo=fastapi" alt="FastAPI" />

  <br />
  <br />

  <p><i>Presented at AI UTKARSH 2026 - AI SUMMIT • Narula Institute of Technology (NiT) • Theme: Responsible AI</i></p>

  <p>
    <a href="#-live-deployments">Live Demo</a> •
    <a href="#-architecture-diagrams">Architecture</a> •
    <a href="#-ai-intelligence-pipeline">AI Pipeline</a> •
    <a href="#-database-schema">Database Schema</a> •
    <a href="#-project-structure">Structure</a>
  </p>
</div>

---

## 🚩 Problem Statement

Urban centers in India face a silent economic and environmental crisis driven by traffic friction:
- **Economic Loss**: Idling at red lights costs billions in lost productivity and fuel imports.
- **Environmental Impact**: Vehicular "stop-and-go" patterns are a primary source of urban CO2 and PM2.5 hotspots.
- **Unnecessary Challans**: Drivers often face automated fines (e-challans) for technical signal jumps caused by poor signal visibility or unexpected timing flips.
- **Inflexible Infrastructure**: Current traffic signal systems are "pre-timed" and cannot adapt to real-time traffic density.
- **Energy Insecurity**: High national fuel consumption is exacerbated by inefficient driving habits in congested corridors.

---

## 🌟 Key Features & Solutions

- **🚀 Real-time Speed Advisory**: Calculates and displays the optimal speed to catch the next green light flawlessly, **eliminating unintentional signal jumps**.
- **🧠 Indigenous AI Core**: Custom-trained models optimized for heterogeneous Indian traffic (Bikes, Autos, Vans).
- **🛡️ Challan Mitigation**: Precise V2I synchronization ensures drivers are never caught in "dilemma zones," reducing unnecessary fines.
- **📊 Digital Twin Dashboard**: A futuristic Leaflet-based GIS dashboard for traffic authorities to monitor congestion and signal health.
- **🌱 Fuel & Emission Reduction**: Targeted 15-20% reduction in city-wide fuel consumption and PM2.5 emissions.
- **🛰️ Hardware-Agnostic**: Works with existing government CCTV infrastructure—no expensive LIDAR needed.

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

---

## 🧠 AI Intelligence Pipeline

The **ClearWave AI Pipeline** executes a structured four-stage inference workflow:

```mermaid
graph LR
    A[CCTV Ingestion] -->|Frame Extraction| B[YOLOv8 Perception]
    B -->|Object Localization| C[Analytic Logic / Queue Index]
    C -->|Density Analysis| D[GLOSA Speed Prediction]
    D -->|Optimization| E[Driver HUD Advisory]
    
    style A fill:#f96,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
```

---

## 🗄️ Database Schema

Sovereign telemetry tracking through three core collections in MongoDB Atlas:

```mermaid
erDiagram
    junctions ||--o{ traffic_data : indexes
    users {
        string uid
        string email
        string displayName
        float currentLat
        float currentLng
    }
    junctions {
        string id PK
        string name
        string status
        int secondsToChange
        float recommendedSpeed
    }
    traffic_data {
        string junction_id FK
        int density_index
        int throughput_count
        timestamp timestamp
    }
```

---

## 📂 Project Structure

```bash
GLOSA-BHARAT/
├── frontend/          # React + Vite (GIS, D3.js Charts, Advisory HUD)
├── backend/           # Node.js + Express (Orchestration & Data Sync)
├── ai-service/        # Python + FastAPI (YOLOv8 Inference Engine)
├── hardware/          # Arduino + Serial Bridge (V2I Signal Integration)
├── scripts/           # Data seeding, migration, and diagnostic tools
├── models/            # Weights and configurations for YOLOv8
└── README.md          # Enterprise Documentation
```

---

## 🗺️ Kolkata Case Study: Girish Park to NIT Narula

> **Developer's Route**: Ashish Chaurasia | **Distance**: 8.7 km | **Junctions**: 7  
> **Route Corridor**: Girish Park → Shyambazar 5-Point → Sinthi More → Dunlop → Agarpara

| # | Junction | Vehicle Density | Red Duration | Annual Fuel Waste |
|---|----------|-----------------|--------------|-------------------|
| 1 | Girish Park Metro | High | 120s | 1.78L Litres |
| 2 | Shyambazar 5-Point | Very High | 160s | 3.12L Litres |
| 3 | Sinthi More Junction | High | 130s | 1.98L Litres |
| 4 | Dunlop Crossing | Very High | 140s | 2.67L Litres |
| 5 | Belgharia Junction | Medium | 110s | 1.43L Litres |
| 6 | Agarpara Medical | Medium | 115s | 1.12L Litres |
| 7 | NIT Narula Turn | Low | 80s | 0.54L Litres |

---

## 🚀 Impact & Benefits

- **🛡️ Legal Protection**: Prevents unnecessary e-challans by removing the "stop-go" guesswork at yellow lights.
- **🌏 Global Ecology**: Targeted reduction in particulate matter (PM2.5) by minimizing idling.
- **📈 Economic Gains**: Saving city-wide logistics providers 15-20% in annual fuel costs.
- **🇮🇳 Sovereign Resilience**: 100% indigenous software stack sitting on secure Indian clouds.

---

## 👨‍💻 Developer & Visionary
**Presented at AI UTKARSH 2026 - AI SUMMIT**   
*Narula Institute of Technology (NiT) • Theme: Responsible AI*
