# Inkplate Dashboard (Route 1)

This project renders a React dashboard to a PNG and serves it to an Inkplate 5V2.

## Requirements

- Node.js 20+
- Arduino CLI (optional, only for `npm run upload`)
- Inkplate Arduino board support installed (`Inkplate_Boards:esp32`)

## 1) Install

```bash
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
mkdir -p ~/.local/bin
mv ./bin/arduino-cli ~/.local/bin/
arduino-cli config add board_manager.additional_urls https://github.com/SolderedElectronics/Inkplate-Board-Definitions-for-Arduino-IDE/raw/master/package_inkplate_index.json
arduino-cli core update-index
arduino-cli core install Inkplate_Boards:esp32
npm install
```

## 2) Run dashboard preview (web)

```bash
npm run dev
```

Open `http://localhost:5173`.

## 3) Render and serve image for Inkplate

```bash
npm run serve
```

This builds the React app, captures `dist/dashboard.png`, and serves it on:

- `http://localhost:3000/dashboard.png`

If Chrome is missing locally, `npm run serve` now auto-installs it for Puppeteer.
You can also install it manually:

```bash
npm run browser:install
```

## 4) Configure firmware

1. Copy `firmware/config.example.h` to `firmware/config.h`.
2. Fill in your WiFi and server URL in `firmware/config.h`.

Set `SERVER_URL` to your computer's LAN IP, for example:

```cpp
#define SERVER_URL "http://192.168.1.100:3000/dashboard.png"
```

## 5) Upload firmware

Set the serial port environment variable:

```bash
export INKPLATE_PORT=/dev/ttyUSB0
```

Then run:

```bash
npm run upload
```

If you prefer, you can open `firmware/firmware.ino` in Arduino IDE and upload from there.

## Notes

- Existing `Inkplate5V2_Hello_World/Inkplate5V2_Hello_World.ino` is left untouched.
- Dashboard target resolution is `1280x720`.
- Firmware uses deep sleep and wakes every `SLEEP_HOURS`.
