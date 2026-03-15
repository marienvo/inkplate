from __future__ import annotations

import logging
import sys
from logging.handlers import RotatingFileHandler

from .config import load_config
from .grouper import run_loop


def setup_logging(*, level: str, log_file: str | None) -> None:
    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(formatter)
    root_logger.addHandler(stdout_handler)

    if log_file:
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=1_000_000,
            backupCount=3,
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)


def main() -> int:
    try:
        config = load_config()
    except ValueError as exc:
        print(f"Configuration error: {exc}", file=sys.stderr)
        return 1

    setup_logging(level=config.log_level, log_file=config.log_file)
    logger = logging.getLogger(__name__)

    logger.info("Starting Sonos Grouper Service.")
    logger.info("Mode: %s", config.mode)
    logger.info("Poll interval: %ss", config.poll_interval_seconds)
    logger.info("Dry-run mode: %s", config.dry_run)
    if config.mode == "discovery":
        logger.info("Master name: %s", config.master_name)
        logger.info(
            "Excluded speakers: %s",
            ", ".join(config.excluded_speakers) if config.excluded_speakers else "(none)",
        )
    else:
        logger.info("Master IP: %s", config.master_ip)
        logger.info(
            "Manual speakers: %s",
            ", ".join(config.speaker_ips) if config.speaker_ips else "(none)",
        )

    try:
        run_loop(config)
    except KeyboardInterrupt:
        logger.info("Shutting down Sonos Grouper Service.")
        return 0
    except Exception:
        logger.exception("Fatal error. Exiting.")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
