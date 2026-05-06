#include <WiFi.h>
#include <HTTPClient.h>

// ==========================================
// 🚨 CHANGE THESE SETTINGS 🚨
// ==========================================
const char* ssid = "YOUR_WIFI_NAME";        // Apna Mobile Hotspot ya WiFi ka naam
const char* password = "YOUR_WIFI_PASSWORD"; // WiFi ka Password

// APNE LAPTOP KA MERA IP ADDRESS DALO (Ya remote link dalna agar Cloudflare tunnel use kar rahe)
// Example: http://192.168.1.5:3000/api/hardware/signal-state?junction=shyambazar
// Localhost kaam nahi karega kyunki ESP32 apna alag device hai!
const String serverName = "http://YOUR_LAPTOP_IP:3000/api/hardware/signal-state?junction=shyambazar"; 

// ==========================================
// PINS FOR TRAFFIC LED MODULE
// ==========================================
const int RED_PIN = 14;
const int YEL_PIN = 15;
const int GRN_PIN = 13;

void setup() {
  Serial.begin(115200);
  
  pinMode(RED_PIN, OUTPUT);
  pinMode(YEL_PIN, OUTPUT);
  pinMode(GRN_PIN, OUTPUT);

  // Turn all ON for a second for testing
  setLights(HIGH, HIGH, HIGH);
  delay(1000);
  setLights(LOW, LOW, LOW);

  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! GLOSA Hardware Online.");
}

void loop() {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverName); // GET request to Node.js backend
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String payload = http.getString();
      Serial.println(payload);
      
      // Simple JSON detection for Hackathon speed
      if (payload.indexOf("\"signal\":\"RED\"") > 0) {
        setLights(HIGH, LOW, LOW);
      } else if (payload.indexOf("\"signal\":\"YELLOW\"") > 0 || payload.indexOf("\"signal\":\"AMBER\"") > 0) {
        setLights(LOW, HIGH, LOW);
      } else if (payload.indexOf("\"signal\":\"GREEN\"") > 0) {
        setLights(LOW, LOW, HIGH);
      }
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      // Agar error aaye to sab band kardo
      setLights(LOW, LOW, LOW);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected!");
  }
  
  delay(1000); // 1 second update interval
}

void setLights(int r, int y, int g) {
  digitalWrite(RED_PIN, r);
  digitalWrite(YEL_PIN, y);
  digitalWrite(GRN_PIN, g);
}
