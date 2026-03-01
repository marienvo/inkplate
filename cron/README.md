# CRON setup (Linux)

This folder contains `deploy.sh`, intended to run periodically via Linux CRON.

## 1) Set up CRON job

Open your personal crontab:

```bash
crontab -e
```

Then add this line to deploy every 10 minutes:

```cron
*/10 * * * * /home/pi/inkplate/cron/deploy.sh >> /home/pi/inkplate/cron/deploy.log 2>&1
```

- `*/10` = every 10 minutes
- the remaining `*` = every hour, every day, every month, every weekday

## 2) Verify it works

- View active crontab:
  - `crontab -l`
- Follow the log:
  - `tail -f /home/pi/inkplate/cron/deploy.log`
- If you see the start/end lines of `deploy.sh` in the log, the job is running correctly.
