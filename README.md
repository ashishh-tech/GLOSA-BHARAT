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
    <a href="#-target-users">Target Users</a> •
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

## 👥 Target Users

| User | Main Need | Key Feature |
|------|-----------|-------------|
| **Daily Commuter** | Time & Fuel Savings | Speed Advisory HUD |
| **Logistics / Fleet** | Operational Efficiency | Fuel-optimized Route Corridors |
| **Traffic Authority**| Congestion Management | Digital Twin GIS Dashboard |
| **Urban Planner** | Data-driven Infrastructure | Throughput & Density Analytics |

> 💡 **Pitch Strategy**: Lead with the COMMUTER — specifically the daily worker. Nobody in their journey — not the GPS apps, not the traffic police — provides a 100% synchronized speed window to ensure they never hit a red light.

---

## 🧠 All Uses of AI within GLOSA BHARAT

1.  **Real-Time Edge Perception (YOLOv8)**: Utilizes custom-trained computer vision models to detect and classify heterogeneous Indian traffic (Bikes, Autos, Vans) with high precision in varying light conditions.
2.  **Density-to-Signal Logic Hub**: AI actively calculates the "Queue Index" of vehicles at red lights, predicting exactly how much time is needed to clear the lane based on vehicle mixture.
3.  **Predictive GLOSA Engine**: Machine learning algorithms analyze historical and real-time signal flipping patterns to generate a sub-second "Optimal Speed Window."
4.  **GIS-to-HUD Correlation (NLP/Logic)**: Processes geospatial data and correlates it with junction status to provide human-readable advisories via the driver Interface.
5.  **Dilemma Zone Analysis**: AI monitors the transition between yellow and red lights to proactively warn drivers if they are at risk of an accidental e-challan jump.

---

## 🌟 Innovation Points

- **The V2I Physical-to-Digital Bridge**: We are the first indigenous platform to systematically bridge existing legacy signals with cloud AI without requiring multi-million dollar hardware upgrades.
- **Hyper-Local Heterogeneous Intelligence**: Unlike global systems, our AI is trained specifically for the messy, high-density traffic mixtures unique to Indian urban corridors.
- **Proactive, Not Reactive**: Existing apps tell you *where* the traffic is. **GLOSA BHARAT** tells you how fast to drive to ensure you *never encounter it*.
- **Challan-Free Ecosystem**: A novel approach to urban driving that focuses on removing the "Yellow Light Anxiety," protecting citizens from accidental fines.

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

---

## 📚 Technical Foundation

### 1. Technology Stack

| Layer | Responsibility | Technologies |
|-------|----------------|--------------|
| **Frontend** | GIS Dashboard & Driver HUD | React, Vite, Leaflet, Google Maps API, Framer Motion |
| **Backend** | API Orchestration | Node.js, Express.js |
| **Database** | Telemetry Storage | MongoDB Atlas |
| **AI Intelligence** | Perception & Optimization | Python, YOLOv8, FastAPI |
| **Hardware Bridge** | Physical V2I Simulation | Arduino (C++), Serial Communications |

### 2. Database Schema (MongoDB Atlas)
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
├── ai-service/              # Python Intelligence Layer
│   ├── main.py              # FastAPI server & route definitions
│   ├── model_loader.py      # YOLOv8 weight loading orchestration
│   ├── inference_logic.py   # Traffic density calculation algorithms
│   └── requirements.txt     # Python dependency manifest
├── backend/                 # Node.js Orchestration Tier
│   ├── index.js             # Main server entry point
│   ├── models/              # Mongoose schemas (Junctions, Users)
│   ├── routes/              # API endpoints for telemetry sync
│   └── package.json         # Backend manifest
├── frontend/                # React Fiber Interface
│   ├── src/
│   │   ├── components/      # Advisory HUD & GIS Map modules
│   │   ├── pages/           # Dashboard, Landing & Auth views
│   │   ├── App.jsx          # Routing & State Management
│   │   └── index.css        # Global futuristic styling
│   ├── public/              # Static assets & GIS icons
│   └── vite.config.js       # Vite configuration
├── hardware/                # V2I Physical Prototype (Arduino)
│   ├── glosa_hardware/
│   │   └── glosa_hardware.ino # LCD/LED Signal Simulation C++ code
│   └── serial_bridge.py      # Laptop-to-Hardware serial communicator
├── scripts/                 # DevOps & Utility Scripts
│   ├── seed_junctions.js    # Initializing MongoDB traffic data
│   └── deploy_cloud.sh      # Google Cloud Run deployment automation
└── README.md                # Multi-modal Enterprise Documentation
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
- **📉 Economic Gains**: Saving city-wide logistics providers 15-20% in annual fuel costs.
- **🇮🇳 Sovereign Resilience**: 100% indigenous software stack sitting on secure Indian clouds.

---

## 👨‍💻 Developer & Visionary
**Presented at AI UTKARSH 2026 - AI SUMMIT**   
*Narula Institute of Technology (NiT) • Theme: Responsible AI*
