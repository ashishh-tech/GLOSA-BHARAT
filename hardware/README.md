# 🚦 GLOSA-BHARAT Hardware Prototype

Ye folder hackathon ke hardware demo ke liye hai.

## Files
- `glosa_hardware/glosa_hardware.ino` — Arduino code (LED + LCD)
- `serial_bridge.py` — Laptop se Arduino communicator

## Saaman (Shopping List)

| Item | Price |
|------|-------|
| Arduino Uno R3 (clone OK) | ₹350–500 |
| 16x2 LCD with I2C module | ₹150–200 |
| Red, Yellow, Green LED (x1 each) | ₹15 total |
| 220Ω Resistors (x3) | ₹10 |
| Breadboard (half size) | ₹60–80 |
| Jumper wires (male-male) | ₹50–70 |
| USB A-B cable (Arduino) | Included with Arduino |
| **Total** | **~₹650–875** |

## Quick Start

### 1. Install Python dependencies
```bash
pip install pyserial requests
```

### 2. Upload Arduino code
- Open `glosa_hardware/glosa_hardware.ino` in Arduino IDE
- Tools → Board → Arduino Uno
- Tools → Port → COM3 (check Device Manager)
- Click Upload (→)

### 3. Start GLOSA Backend
```bash
cd backend && npm start
```

### 4. Start Serial Bridge
```bash
python hardware/serial_bridge.py
```

### 5. Start Dashboard
```bash
cd frontend && npm run dev
```

## Wiring Quick Reference
```
Pin 13 → 220Ω → RED LED(+)    → GND
Pin 12 → 220Ω → YELLOW LED(+) → GND
Pin 11 → 220Ω → GREEN LED(+)  → GND
5V → LCD VCC | GND → LCD GND
A4 → LCD SDA | A5 → LCD SCL
```

> LCD blank? Change `0x27` to `0x3F` in the `.ino` file.
