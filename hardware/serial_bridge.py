"""
GLOSA-BHARAT Serial Bridge v1.0
================================
Fetches real-time signal state from the GLOSA backend and sends it
to the Arduino over USB Serial so that the physical LED + LCD updates.

Usage:
    pip install pyserial requests
    python serial_bridge.py

Requirements:
    - Arduino must be connected via USB
    - GLOSA backend must be running (or uses offline fallback)
    - Correct COM port set below (check Device Manager on Windows)
"""

import serial
import requests
import time
import sys

# ── CONFIG — Change these as needed ─────────────────────────
BACKEND_URL   = "http://localhost:3000"   # or Cloud Run URL
SERIAL_PORT   = "COM3"                    # Windows: COM3/COM4/COM5
                                          # Linux/Mac: /dev/ttyACM0 or /dev/cu.usb...
BAUD_RATE     = 9600
POLL_INTERVAL = 1   # seconds between updates
JUNCTION_ID   = "shyambazar"             # Which Kolkata junction to track
# ────────────────────────────────────────────────────────────

# Kolkata BT Road junctions to rotate during demo
DEMO_JUNCTIONS = [
    ("shyambazar",  "Shyambazar 5-Point"),
    ("sinthi",      "Sinthi More"),
    ("dunlop",      "Dunlop Crossing"),
    ("belgharia",   "Belgharia Junction"),
    ("agarpara",    "Agarpara Medical"),
]


def get_signal_from_backend(junction_id: str) -> dict:
    """Fetch current signal state from GLOSA backend API."""
    try:
        resp = requests.get(
            f"{BACKEND_URL}/api/hardware/signal-state",
            params={"junction": junction_id},
            timeout=2
        )
        if resp.status_code == 200:
            return resp.json()
    except requests.exceptions.RequestException:
        pass  # Fall through to offline simulation
    return simulate_offline()


def simulate_offline() -> dict:
    """Fallback simulation when backend is not reachable."""
    pos = int(time.time()) % 60
    if pos < 30:
        return {"signal": "RED",    "advisorySpeed": 0,  "timeRemaining": 30 - pos}
    elif pos < 35:
        return {"signal": "YELLOW", "advisorySpeed": 0,  "timeRemaining": 35 - pos}
    else:
        return {"signal": "GREEN",  "advisorySpeed": 40, "timeRemaining": 60 - pos}


def send_to_arduino(ser: serial.Serial, data: dict) -> None:
    """Send formatted signal string to Arduino via USB Serial."""
    msg = f"{data['signal']},{data['advisorySpeed']},{data['timeRemaining']}\n"
    ser.write(msg.encode('utf-8'))


def main():
    print("=" * 55)
    print("   🚦 GLOSA-BHARAT Serial Bridge")
    print(f"   Port: {SERIAL_PORT}   Baud: {BAUD_RATE}")
    print(f"   Backend: {BACKEND_URL}")
    print("=" * 55)

    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)  # Wait for Arduino to finish reset
        print(f"✅ Connected to Arduino on {SERIAL_PORT}\n")
    except serial.SerialException as e:
        print(f"\n❌ Cannot open {SERIAL_PORT}\n   {e}")
        print("\n💡 Fix:")
        print("   Windows → Device Manager → Ports (COM & LPT) → find 'Arduino Uno (COMx)'")
        print("   Then change SERIAL_PORT = 'COMx' in this script\n")
        sys.exit(1)

    emojis = {"RED": "🔴", "YELLOW": "🟡", "GREEN": "🟢"}
    junction_idx = 0

    print("🔄 Polling started (Ctrl+C to stop)\n")

    while True:
        try:
            # Cycle through junctions every 10 seconds for demo
            cycle_count = int(time.time()) // 10
            jid, jname = DEMO_JUNCTIONS[cycle_count % len(DEMO_JUNCTIONS)]

            data = get_signal_from_backend(jid)
            sig  = data.get("signal",        "RED")
            spd  = data.get("advisorySpeed", 0)
            t    = data.get("timeRemaining", 0)

            # Terminal display
            src = "BACKEND" if "source" in data else "OFFLINE"
            print(f"[{src}] {emojis.get(sig,'⚪')} {jname:<24} "
                  f"Signal: {sig:<6} | Speed: {spd:>2} km/h | Time: {t:>2}s")

            # Send to Arduino
            send_to_arduino(ser, data)

            # Read Arduino acknowledgement
            if ser.in_waiting:
                ack = ser.readline().decode('utf-8', errors='ignore').strip()
                if ack and ack != "GLOSA_READY":
                    print(f"   └─ Arduino: {ack}")

            time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            print("\n\n✅ Bridge stopped.")
            ser.close()
            sys.exit(0)

        except Exception as e:
            print(f"⚠️  Error: {e} — retrying in 2s...")
            time.sleep(2)


if __name__ == "__main__":
    main()
