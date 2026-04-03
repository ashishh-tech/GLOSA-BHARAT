import random
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os

app = FastAPI(title="GLOSA AI Prediction Service")

# ─── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    junction_id: str
    timestamp: float

class PredictionResponse(BaseModel):
    junction_id: str
    current_status: str  # RED, GREEN, AMBER
    seconds_to_change: float
    cycle_time: int = 60

@app.get("/")
def read_root():
    return {"status": "GLOSA AI Service Running", "version": "2.0"}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "glosa-ai", "timestamp": datetime.utcnow().isoformat()}


@app.post("/predict", response_model=PredictionResponse)
def predict_signal(request: PredictionRequest):
    # In a real scenario, this would load a pre-trained Random Forest/LSTM model
    # For the demo, we simulate a 60-second cycle (30s Green, 25s Red, 5s Amber)
    
    cycle_time = 60
    current_time = request.timestamp % cycle_time
    
    if current_time < 30:
        status = "GREEN"
        to_change = 30 - current_time
    elif current_time < 55:
        status = "RED"
        to_change = 55 - current_time
    else:
        status = "AMBER"
        to_change = 60 - current_time
        
    return {
        "junction_id": request.junction_id,
        "current_status": status,
        "seconds_to_change": round(to_change, 1),
        "cycle_time": cycle_time
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
