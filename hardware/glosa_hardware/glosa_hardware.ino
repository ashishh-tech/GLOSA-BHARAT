// ============================================================
// GLOSA-BHARAT Hardware Prototype v1.0
// Arduino Uno — LED Traffic Light + LCD Speed Advisory
// Author: Ashish Chaurasia | NIT Narula, Agarpara, Kolkata
//
// WIRING:
//   Pin 13 → 220Ω → RED LED(+) → GND
//   Pin 12 → 220Ω → YELLOW LED(+) → GND
//   Pin 11 → 220Ω → GREEN LED(+) → GND
//   5V → LCD VCC | GND → LCD GND
//   A4 → LCD SDA | A5 → LCD SCL
//   USB → Laptop (runs serial_bridge.py)
// ============================================================

#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ── LCD Setup ──────────────────────────────────────────────
// If screen is blank, change 0x27 to 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ── LED Pin Definitions ────────────────────────────────────
const int RED_PIN    = 13;
const int YELLOW_PIN = 12;
const int GREEN_PIN  = 11;

// ── Signal State ───────────────────────────────────────────
String currentSignal = "RED";
int    advisorySpeed = 0;
int    timeRemaining = 30;

// ─────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(9600);   // USB Serial to laptop

  pinMode(RED_PIN,    OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(GREEN_PIN,  OUTPUT);

  // LCD init
  lcd.init();
  lcd.backlight();

  // Startup screen
  lcd.setCursor(0, 0);
  lcd.print(" GLOSA-BHARAT 2 ");
  lcd.setCursor(0, 1);
  lcd.print("  Kolkata BT Rd ");

  blinkAll(3);  // All 3 LEDs blink on startup (demo effect)

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System Online!");
  lcd.setCursor(0, 1);
  lcd.print("Waiting data...");
  delay(2000);

  Serial.println("GLOSA_READY");
}

// ─────────────────────────────────────────────────────────────
void loop() {

  // Check for data from laptop via USB Serial
  if (Serial.available() > 0) {
    String incoming = Serial.readStringUntil('\n');
    incoming.trim();
    parseData(incoming);
  }

  updateLEDs();
  updateLCD();
  delay(500);
}

// ─────────────────────────────────────────────────────────────
// Parse incoming data format: "GREEN,40,18"
// Format: SIGNAL,ADVISORY_SPEED,TIME_REMAINING
// ─────────────────────────────────────────────────────────────
void parseData(String data) {
  int c1 = data.indexOf(',');
  int c2 = data.lastIndexOf(',');

  if (c1 < 0 || c2 < 0 || c1 == c2) return;  // Invalid format

  currentSignal = data.substring(0, c1);
  advisorySpeed = data.substring(c1 + 1, c2).toInt();
  timeRemaining = data.substring(c2 + 1).toInt();

  // Confirm receipt to laptop
  Serial.print("ACK:");
  Serial.println(currentSignal);
}

// ─────────────────────────────────────────────────────────────
void updateLEDs() {
  digitalWrite(RED_PIN,    LOW);
  digitalWrite(YELLOW_PIN, LOW);
  digitalWrite(GREEN_PIN,  LOW);

  if      (currentSignal == "RED")                        digitalWrite(RED_PIN,    HIGH);
  else if (currentSignal == "YELLOW" ||
           currentSignal == "AMBER")                      digitalWrite(YELLOW_PIN, HIGH);
  else if (currentSignal == "GREEN")                      digitalWrite(GREEN_PIN,  HIGH);
}

// ─────────────────────────────────────────────────────────────
void updateLCD() {
  lcd.clear();

  // Row 0: Signal state + countdown timer
  lcd.setCursor(0, 0);
  if      (currentSignal == "RED")    lcd.print("STOP  RED   ");
  else if (currentSignal == "YELLOW") lcd.print("SLOW  YLW   ");
  else                                lcd.print("GO!   GRN   ");
  lcd.print(timeRemaining);
  lcd.print("s");

  // Row 1: Speed advisory
  lcd.setCursor(0, 1);
  if (advisorySpeed > 0 && currentSignal == "GREEN") {
    lcd.print("Drive ");
    lcd.print(advisorySpeed);
    lcd.print(" km/h   ");
  } else if (currentSignal == "RED") {
    lcd.print("Wait ");
    lcd.print(timeRemaining);
    lcd.print("s...    ");
  } else {
    lcd.print("Slow down now!  ");
  }
}

// ─────────────────────────────────────────────────────────────
void blinkAll(int n) {
  for (int i = 0; i < n; i++) {
    digitalWrite(RED_PIN, HIGH);
    digitalWrite(YELLOW_PIN, HIGH);
    digitalWrite(GREEN_PIN, HIGH);
    delay(250);
    digitalWrite(RED_PIN, LOW);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(GREEN_PIN, LOW);
    delay(250);
  }
}
