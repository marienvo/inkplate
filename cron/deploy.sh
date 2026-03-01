#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Cron runs with a minimal environment. Include common Node install locations.
export PATH="/usr/local/bin:/usr/bin:/bin:${HOME}/.local/bin:${HOME}/.nvm/versions/node/current/bin"

cd "${PROJECT_ROOT}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting scheduled surge deployment"
npm run surge
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scheduled surge deployment finished"
