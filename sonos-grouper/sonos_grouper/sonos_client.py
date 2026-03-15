from __future__ import annotations

import logging
from typing import Any

try:
    import soco
    from soco import SoCo
    from soco.exceptions import SoCoException
except ImportError:  # pragma: no cover - exercised only when dependency missing
    soco = None
    SoCo = Any  # type: ignore[misc,assignment]

    class SoCoException(Exception):
        pass


LOGGER = logging.getLogger(__name__)


class SpeakerUnavailableError(Exception):
    pass


def _require_soco() -> Any:
    if soco is None:
        raise RuntimeError(
            "The 'soco' package is not installed. Install dependencies from requirements.txt."
        )
    return soco


def speaker_ip(speaker: SoCo) -> str:
    return str(getattr(speaker, "ip_address", "unknown"))


def speaker_name(speaker: SoCo) -> str:
    name = getattr(speaker, "player_name", None)
    if isinstance(name, str) and name.strip():
        return name.strip()
    return speaker_ip(speaker)


def discover_speakers(timeout: int) -> list[SoCo]:
    soco_module = _require_soco()
    try:
        discovered = soco_module.discover(timeout=timeout)
    except Exception as exc:
        LOGGER.warning("Speaker discovery failed: %s", exc)
        return []

    if not discovered:
        return []

    speakers = list(discovered)
    speakers.sort(key=lambda s: (speaker_name(s).lower(), speaker_ip(s)))
    return speakers


def find_master_by_name(speakers: list[SoCo], name: str) -> SoCo | None:
    target = name.strip().casefold()
    for speaker in speakers:
        if speaker_name(speaker).casefold() == target:
            return speaker
    return None


def find_master_by_ip(speakers: list[SoCo], ip: str) -> SoCo | None:
    target = ip.strip()
    for speaker in speakers:
        if speaker_ip(speaker) == target:
            return speaker
    return None


def get_speaker(ip: str) -> SoCo:
    soco_module = _require_soco()
    try:
        speaker = soco_module.SoCo(ip)
        # Touch player_name so unreachable speakers fail fast here.
        _ = speaker.player_name
        return speaker
    except (SoCoException, OSError, TimeoutError, ValueError) as exc:
        raise SpeakerUnavailableError(f"Speaker {ip} unavailable: {exc}") from exc


def is_grouped_with_master(speaker: SoCo, master_ip: str) -> bool:
    try:
        coordinator = speaker.group.coordinator
        coordinator_ip = speaker_ip(coordinator)
        return coordinator_ip == master_ip
    except (SoCoException, OSError, TimeoutError, AttributeError) as exc:
        raise SpeakerUnavailableError(
            f"Could not inspect group state for {speaker_name(speaker)} ({speaker_ip(speaker)}): {exc}"
        ) from exc


def join_to_master(speaker: SoCo, master: SoCo) -> None:
    try:
        speaker.join(master)
    except (SoCoException, OSError, TimeoutError, ValueError) as exc:
        raise SpeakerUnavailableError(
            f"Join failed for {speaker_name(speaker)} ({speaker_ip(speaker)}): {exc}"
        ) from exc
