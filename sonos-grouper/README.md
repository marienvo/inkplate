# Sonos Grouper Service

Keep your Sonos household permanently grouped under one master speaker.

This service runs on a Raspberry Pi inside your home network. It checks Sonos
group state every few seconds and re-joins any speaker that drifted out of the
master group.

## Why this exists

Sonos groups can unexpectedly split, which is annoying in daily use. This
service gives you a boring, reliable background process that continuously
enforces your preferred group setup.

## What it does

- Polls Sonos state at a configurable interval (default 20 seconds)
- Uses discovery by default (`SONOS_MASTER_NAME`)
- Re-joins non-grouped speakers to the master coordinator
- Supports dry-run mode
- Logs startup, discovered/configured speakers, grouped status, re-joins, and errors
- Continues running when one speaker is offline

## Requirements

- Raspberry Pi on the same LAN as your Sonos speakers
- Raspberry Pi OS (or similar Linux)
- Python 3.9+ recommended
- `pip` and virtualenv support

## Recommended network setup

Use DHCP reservations (static leases) for Sonos speakers and your Pi. This
keeps device addresses stable and makes troubleshooting easier.

## Configuration model

### Discovery mode (recommended default)

Set only the master speaker name:

```ini
SONOS_MASTER_NAME=TV
SONOS_EXCLUDED_SPEAKERS=
```

The service discovers all Sonos speakers via UPnP and treats all discovered
speakers (except master and exclusions) as required group members.

### Manual fallback mode

Use this only when discovery is unreliable on your network:

```ini
SONOS_MASTER_IP=192.168.1.100
SONOS_SPEAKER_IPS=192.168.1.101,192.168.1.102
```

### Precedence when both are set

If `SONOS_MASTER_NAME` is set, discovery mode wins. Manual IP settings are only
used when `SONOS_MASTER_NAME` is missing.

## Install Python and pip on Raspberry Pi OS

If Python/pip are not yet installed:

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git
python3 --version
pip3 --version
```

## Clone or update the repository

If you do not have the repository yet:

```bash
cd /home/pi
git clone <YOUR_REPO_URL> inkplate
cd /home/pi/inkplate
```

If you already cloned it:

```bash
cd /home/pi/inkplate
git pull
```

## Set up the Sonos Grouper project

```bash
cd /home/pi/inkplate/sonos-grouper
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Configure environment variables

```bash
cd /home/pi/inkplate/sonos-grouper
cp .env.example .env
```

Then edit `.env` with your values.

## How to find Sonos speaker names and IP addresses

### Names (for discovery mode)

In the Sonos app, each room/speaker has a visible name (for example `TV`,
`Kitchen`, `Living Room`). Use that exact name for `SONOS_MASTER_NAME`.

### IP addresses (for manual fallback)

Options:

- Check your router's DHCP client list
- Use your router's device details page
- Use network scan tools (if you already use them at home)

## Manual test first (always do this before background service)

From the `sonos-grouper` directory:

```bash
source .venv/bin/activate
python -m sonos_grouper
```

Watch logs for:

- startup confirmation
- discovered speakers (`name` + `ip`)
- grouped checks
- re-join events

Stop with `Ctrl+C`.

## Dry-run mode

Set this in `.env`:

```ini
DRY_RUN=true
```

Then run:

```bash
source .venv/bin/activate
python -m sonos_grouper
```

In dry-run mode, the script logs what it would do but does not call `join`.

## Normal run mode

Set:

```ini
DRY_RUN=false
```

Then run:

```bash
source .venv/bin/activate
python -m sonos_grouper
```

## Logging and log inspection

By default, logs go to stdout/journal.

Optional `.env` file logging:

```ini
LOG_FILE=/home/pi/sonos-grouper.log
```

If systemd is used:

```bash
sudo journalctl -u sonos-grouper -f
```

If file logging is enabled:

```bash
tail -f /home/pi/sonos-grouper.log
```

## systemd vs cron

Both are possible. For this use case, **systemd is strongly recommended**:

- Native process supervision (`Restart=always`)
- Better logging via `journalctl`
- Reliable auto-start on boot
- Cleaner operational model for a long-running service

Cron is included below as an alternative, but it is not the best default for
this continuous daemon process.

## systemd setup (recommended)

Use the included service file as a base:

```ini
[Unit]
Description=Sonos Grouper Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/inkplate/sonos-grouper
EnvironmentFile=/home/pi/inkplate/sonos-grouper/.env
ExecStart=/home/pi/inkplate/sonos-grouper/.venv/bin/python -m sonos_grouper
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Step-by-step:

1. Copy the unit file:

   ```bash
   sudo cp /home/pi/inkplate/sonos-grouper/sonos-grouper.service /etc/systemd/system/sonos-grouper.service
   ```

2. Reload systemd:

   ```bash
   sudo systemctl daemon-reload
   ```

3. Enable auto-start on boot:

   ```bash
   sudo systemctl enable sonos-grouper
   ```

4. Start now:

   ```bash
   sudo systemctl start sonos-grouper
   ```

5. Check status:

   ```bash
   sudo systemctl status sonos-grouper
   ```

6. Follow logs:

   ```bash
   sudo journalctl -u sonos-grouper -f
   ```

### Restart after code/config changes

```bash
cd /home/pi/inkplate
git pull
cd /home/pi/inkplate/sonos-grouper
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart sonos-grouper
sudo journalctl -u sonos-grouper -n 100 --no-pager
```

## Cron alternative (not recommended for this use case)

Cron is better suited for periodic jobs, not a permanent daemon. If you still
want it, run the script every minute and let each run do one short pass, or
wrap a long-running process carefully.

Example crontab line (full line as requested):

```cron
* * * * * cd /home/pi/inkplate/sonos-grouper && /home/pi/inkplate/sonos-grouper/.venv/bin/python -m sonos_grouper >> /home/pi/inkplate/sonos-grouper/cron.log 2>&1
```

Edit crontab:

```bash
crontab -e
```

Then paste the line above.

## One-time setup steps on the Pi after pulling this repo

1. Install Python tools (`python3`, `pip3`, `python3-venv`, `git`) if needed.
2. Create and activate virtual environment in `sonos-grouper`.
3. Install dependencies from `requirements.txt`.
4. Copy `.env.example` to `.env` and configure.
5. Run a manual dry-run test.
6. Switch to normal mode.
7. Install and enable systemd unit.

## Commands to run after dependency updates later

```bash
cd /home/pi/inkplate
git pull
cd /home/pi/inkplate/sonos-grouper
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python -m unittest discover -s tests
sudo systemctl restart sonos-grouper
```

## Unreachable speaker handling

If one speaker is unreachable:

- The service logs the error for that speaker
- Other speakers are still processed
- The process does not crash
- It retries automatically next poll cycle

If the master is unreachable:

- The cycle is skipped
- Clear error is logged
- Next cycle retries automatically

## Troubleshooting

- Discovery finds no speakers:
  - Ensure Pi and speakers are on the same LAN/VLAN
  - Check router settings for multicast/UPnP blocking
  - Try manual fallback mode with static speaker IPs
- Master not found by name:
  - Confirm exact room name in Sonos app
  - Check casing/spaces in `SONOS_MASTER_NAME`
- Frequent re-join logs:
  - Check Wi-Fi quality and speaker signal
  - Reduce network churn
  - Consider wired Ethernet where possible
- Service not starting:
  - `sudo systemctl status sonos-grouper`
  - `sudo journalctl -u sonos-grouper -n 200 --no-pager`
  - Confirm `.env` and virtualenv path in service file

## Future improvements

- Optional metrics export for uptime and regroup counts
- Optional speaker include-list in discovery mode
- Backoff strategy for repeatedly unavailable speakers
- Optional health-check command for automation
