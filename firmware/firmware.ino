/*
  Inkplate 5V2 dashboard firmware for Route 1 architecture.
  - Connect to WiFi
  - Download rendered PNG from local server
  - Draw image full screen
  - Go to deep sleep for configured hours
*/

#ifndef ARDUINO_INKPLATE5V2
#error "Select 'Soldered Inkplate5 V2' in Arduino board settings."
#endif

#include "Inkplate.h"
#include "config.h"

#define US_TO_S_FACTOR 1000000ULL

Inkplate display(INKPLATE_3BIT);

void setup() {
  Serial.begin(115200);
  delay(200);

  display.begin();
  // Zet de rotatie op 3 voor portrait mode (staand)
  display.setRotation(3);
  display.clearDisplay();

  Serial.println("Connecting to WiFi...");
  display.connectWiFi(WIFI_SSID, WIFI_PASS);
  Serial.println("WiFi connected");

  Serial.print("Downloading: ");
  Serial.println(SERVER_URL);
  bool ok = display.drawImage((char *)SERVER_URL, display.PNG, 0, 0);

  if (!ok) {
    display.setTextColor(BLACK);
    display.setTextSize(2);
    display.setCursor(24, 32);
    display.print("Download failed");
  }

  display.display();

  const uint64_t sleepSeconds = (uint64_t)SLEEP_HOURS * 3600ULL;
  Serial.printf("Sleeping for %llu hours\n", (unsigned long long)SLEEP_HOURS);
  esp_sleep_enable_timer_wakeup(sleepSeconds * US_TO_S_FACTOR);
  esp_deep_sleep_start();
}

void loop() {
  // Program never reaches loop() when deep sleep is used.
}
