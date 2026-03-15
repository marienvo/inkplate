from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Literal

from dotenv import load_dotenv


def _parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def _parse_bool(value: str | None, *, default: bool = False) -> bool:
    if value is None:
        return default
    normalized = value.strip().lower()
    return normalized in {"1", "true", "yes", "on"}


def _parse_positive_int(value: str | None, *, default: int, field_name: str) -> int:
    if value is None or value.strip() == "":
        return default
    try:
        parsed = int(value)
    except ValueError as exc:
        raise ValueError(f"{field_name} must be an integer, got: {value!r}") from exc
    if parsed <= 0:
        raise ValueError(f"{field_name} must be > 0, got: {parsed}")
    return parsed


@dataclass(frozen=True)
class Config:
    master_name: str | None
    master_ip: str | None
    speaker_ips: list[str]
    excluded_speakers: list[str]
    poll_interval_seconds: int
    log_level: str
    dry_run: bool
    log_file: str | None
    discovery_timeout_seconds: int

    @property
    def mode(self) -> Literal["discovery", "manual"]:
        if self.master_name:
            return "discovery"
        return "manual"


def load_config(env_path: str | None = ".env") -> Config:
    if env_path:
        load_dotenv(env_path)
    else:
        load_dotenv()

    master_name = os.getenv("SONOS_MASTER_NAME")
    master_ip = os.getenv("SONOS_MASTER_IP")
    speaker_ips = _parse_csv(os.getenv("SONOS_SPEAKER_IPS"))
    excluded_speakers = _parse_csv(os.getenv("SONOS_EXCLUDED_SPEAKERS"))
    poll_interval_seconds = _parse_positive_int(
        os.getenv("POLL_INTERVAL_SECONDS"),
        default=20,
        field_name="POLL_INTERVAL_SECONDS",
    )
    log_level = (os.getenv("LOG_LEVEL") or "INFO").upper()
    dry_run = _parse_bool(os.getenv("DRY_RUN"), default=False)
    log_file = os.getenv("LOG_FILE")
    discovery_timeout_seconds = _parse_positive_int(
        os.getenv("DISCOVERY_TIMEOUT"),
        default=5,
        field_name="DISCOVERY_TIMEOUT",
    )

    master_name = master_name.strip() if master_name and master_name.strip() else None
    master_ip = master_ip.strip() if master_ip and master_ip.strip() else None
    log_file = log_file.strip() if log_file and log_file.strip() else None

    # Discovery mode has precedence when SONOS_MASTER_NAME is configured.
    if master_name:
        return Config(
            master_name=master_name,
            master_ip=master_ip,
            speaker_ips=speaker_ips,
            excluded_speakers=excluded_speakers,
            poll_interval_seconds=poll_interval_seconds,
            log_level=log_level,
            dry_run=dry_run,
            log_file=log_file,
            discovery_timeout_seconds=discovery_timeout_seconds,
        )

    if not master_ip or not speaker_ips:
        raise ValueError(
            "Invalid configuration: set SONOS_MASTER_NAME (preferred) or set both "
            "SONOS_MASTER_IP and SONOS_SPEAKER_IPS for manual fallback mode."
        )

    return Config(
        master_name=None,
        master_ip=master_ip,
        speaker_ips=speaker_ips,
        excluded_speakers=excluded_speakers,
        poll_interval_seconds=poll_interval_seconds,
        log_level=log_level,
        dry_run=dry_run,
        log_file=log_file,
        discovery_timeout_seconds=discovery_timeout_seconds,
    )
