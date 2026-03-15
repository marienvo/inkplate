from __future__ import annotations

import logging
import time
from typing import Callable

from .config import Config
from .sonos_client import (
    SpeakerUnavailableError,
    discover_speakers,
    find_master_by_name,
    get_speaker,
    is_grouped_with_master,
    join_to_master,
    speaker_ip,
    speaker_name,
)


LOGGER = logging.getLogger(__name__)


def _cooldown_seconds(config: Config) -> int:
    return config.poll_interval_seconds * 2


def resolve_speakers(config: Config) -> tuple[object, list[object]] | None:
    if config.mode == "discovery":
        speakers = discover_speakers(timeout=config.discovery_timeout_seconds)
        if not speakers:
            LOGGER.warning("Discovery found no Sonos speakers. Retrying next cycle.")
            return None

        LOGGER.info("Discovered %d Sonos speaker(s):", len(speakers))
        for speaker in speakers:
            LOGGER.info("- %s (%s)", speaker_name(speaker), speaker_ip(speaker))

        master = find_master_by_name(speakers, config.master_name or "")
        if master is None:
            LOGGER.error(
                "Configured master speaker name not found: %s",
                config.master_name,
            )
            return None

        excluded = {name.casefold() for name in config.excluded_speakers}
        members: list[object] = []
        for speaker in speakers:
            if speaker_ip(speaker) == speaker_ip(master):
                continue
            if speaker_name(speaker).casefold() in excluded:
                LOGGER.info(
                    "Skipping excluded speaker: %s (%s)",
                    speaker_name(speaker),
                    speaker_ip(speaker),
                )
                continue
            members.append(speaker)

        return master, members

    # Manual fallback mode.
    assert config.master_ip is not None
    try:
        master = get_speaker(config.master_ip)
    except SpeakerUnavailableError as exc:
        LOGGER.error("Master speaker unreachable (%s): %s", config.master_ip, exc)
        return None

    members: list[object] = []
    LOGGER.info("Using manual speaker list from SONOS_SPEAKER_IPS.")
    for ip in config.speaker_ips:
        if ip == config.master_ip:
            continue
        try:
            speaker = get_speaker(ip)
            members.append(speaker)
        except SpeakerUnavailableError as exc:
            LOGGER.error("Configured speaker unreachable (%s): %s", ip, exc)

    LOGGER.info("Manual master: %s (%s)", speaker_name(master), speaker_ip(master))
    for speaker in members:
        LOGGER.info("Manual member: %s (%s)", speaker_name(speaker), speaker_ip(speaker))

    return master, members


def check_and_regroup(
    *,
    master: object,
    members: list[object],
    config: Config,
    last_join_attempts: dict[str, float],
    monotonic_time: Callable[[], float] = time.monotonic,
) -> None:
    master_ip = speaker_ip(master)
    master_name = speaker_name(master)

    for speaker in members:
        member_ip = speaker_ip(speaker)
        member_name = speaker_name(speaker)

        try:
            grouped = is_grouped_with_master(speaker, master_ip)
        except SpeakerUnavailableError as exc:
            LOGGER.error("Could not check speaker %s (%s): %s", member_name, member_ip, exc)
            continue

        if grouped:
            LOGGER.info(
                "Already grouped: %s (%s) is in group with master %s (%s).",
                member_name,
                member_ip,
                master_name,
                master_ip,
            )
            continue

        now = monotonic_time()
        cooldown = _cooldown_seconds(config)
        last_attempt = last_join_attempts.get(member_ip)
        if last_attempt is not None and (now - last_attempt) < cooldown:
            LOGGER.warning(
                "Cooldown active for %s (%s). Skipping re-join attempt.",
                member_name,
                member_ip,
            )
            continue

        if config.dry_run:
            LOGGER.info(
                "[DRY-RUN] Would re-join %s (%s) to master %s (%s).",
                member_name,
                member_ip,
                master_name,
                master_ip,
            )
            continue

        try:
            join_to_master(speaker, master)
            last_join_attempts[member_ip] = now
            LOGGER.info(
                "Re-joined %s (%s) to master %s (%s).",
                member_name,
                member_ip,
                master_name,
                master_ip,
            )
        except SpeakerUnavailableError as exc:
            LOGGER.error("Failed to re-join %s (%s): %s", member_name, member_ip, exc)


def run_loop(config: Config) -> None:
    LOGGER.info("Entering poll loop with interval %ss.", config.poll_interval_seconds)
    last_join_attempts: dict[str, float] = {}

    while True:
        try:
            resolved = resolve_speakers(config)
            if resolved is not None:
                master, members = resolved
                check_and_regroup(
                    master=master,
                    members=members,
                    config=config,
                    last_join_attempts=last_join_attempts,
                )
        except Exception:
            LOGGER.exception("Unexpected error in poll cycle.")

        time.sleep(config.poll_interval_seconds)
