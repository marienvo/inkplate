from __future__ import annotations

import unittest
from types import SimpleNamespace
from unittest.mock import patch

from sonos_grouper.config import Config
from sonos_grouper.grouper import check_and_regroup, resolve_speakers
from sonos_grouper.sonos_client import SpeakerUnavailableError


def _config_discovery(*, dry_run: bool = False) -> Config:
    return Config(
        master_name="TV",
        master_ip=None,
        speaker_ips=[],
        excluded_speakers=["Garage"],
        poll_interval_seconds=20,
        log_level="INFO",
        dry_run=dry_run,
        log_file=None,
        discovery_timeout_seconds=5,
    )


def _config_manual() -> Config:
    return Config(
        master_name=None,
        master_ip="192.168.1.10",
        speaker_ips=["192.168.1.20", "192.168.1.30"],
        excluded_speakers=[],
        poll_interval_seconds=20,
        log_level="INFO",
        dry_run=False,
        log_file=None,
        discovery_timeout_seconds=5,
    )


def _speaker(name: str, ip: str) -> object:
    return SimpleNamespace(player_name=name, ip_address=ip)


class GrouperTests(unittest.TestCase):
    def test_check_and_regroup_no_join_when_already_grouped(self) -> None:
        config = _config_discovery()
        master = _speaker("TV", "192.168.1.10")
        member = _speaker("Kitchen", "192.168.1.20")

        with patch("sonos_grouper.grouper.is_grouped_with_master", return_value=True), patch(
            "sonos_grouper.grouper.join_to_master"
        ) as join_mock:
            check_and_regroup(
                master=master,
                members=[member],
                config=config,
                last_join_attempts={},
            )
        join_mock.assert_not_called()

    def test_check_and_regroup_joins_when_not_grouped(self) -> None:
        config = _config_discovery()
        master = _speaker("TV", "192.168.1.10")
        member = _speaker("Kitchen", "192.168.1.20")

        with patch("sonos_grouper.grouper.is_grouped_with_master", return_value=False), patch(
            "sonos_grouper.grouper.join_to_master"
        ) as join_mock:
            check_and_regroup(
                master=master,
                members=[member],
                config=config,
                last_join_attempts={},
                monotonic_time=lambda: 100.0,
            )
        join_mock.assert_called_once_with(member, master)

    def test_check_and_regroup_dry_run_does_not_join(self) -> None:
        config = _config_discovery(dry_run=True)
        master = _speaker("TV", "192.168.1.10")
        member = _speaker("Kitchen", "192.168.1.20")

        with patch("sonos_grouper.grouper.is_grouped_with_master", return_value=False), patch(
            "sonos_grouper.grouper.join_to_master"
        ) as join_mock:
            check_and_regroup(
                master=master,
                members=[member],
                config=config,
                last_join_attempts={},
            )
        join_mock.assert_not_called()

    def test_check_and_regroup_continues_on_unavailable_speaker(self) -> None:
        config = _config_discovery()
        master = _speaker("TV", "192.168.1.10")
        a = _speaker("Kitchen", "192.168.1.20")
        b = _speaker("Living", "192.168.1.30")

        def grouped_side_effect(speaker: object, _: str) -> bool:
            if getattr(speaker, "ip_address", "") == "192.168.1.20":
                raise SpeakerUnavailableError("offline")
            return False

        with patch("sonos_grouper.grouper.is_grouped_with_master", side_effect=grouped_side_effect), patch(
            "sonos_grouper.grouper.join_to_master"
        ) as join_mock:
            check_and_regroup(
                master=master,
                members=[a, b],
                config=config,
                last_join_attempts={},
                monotonic_time=lambda: 500.0,
            )
        join_mock.assert_called_once_with(b, master)

    def test_check_and_regroup_respects_cooldown(self) -> None:
        config = _config_discovery()
        master = _speaker("TV", "192.168.1.10")
        member = _speaker("Kitchen", "192.168.1.20")
        attempts = {"192.168.1.20": 90.0}

        with patch("sonos_grouper.grouper.is_grouped_with_master", return_value=False), patch(
            "sonos_grouper.grouper.join_to_master"
        ) as join_mock:
            check_and_regroup(
                master=master,
                members=[member],
                config=config,
                last_join_attempts=attempts,
                monotonic_time=lambda: 100.0,  # cooldown is 40s, so still active
            )
        join_mock.assert_not_called()

    def test_resolve_speakers_discovery_no_speakers(self) -> None:
        config = _config_discovery()
        with patch("sonos_grouper.grouper.discover_speakers", return_value=[]):
            resolved = resolve_speakers(config)
        self.assertIsNone(resolved)

    def test_resolve_speakers_discovery_master_not_found(self) -> None:
        config = _config_discovery()
        speakers = [_speaker("Kitchen", "192.168.1.20")]
        with patch("sonos_grouper.grouper.discover_speakers", return_value=speakers):
            resolved = resolve_speakers(config)
        self.assertIsNone(resolved)

    def test_resolve_speakers_discovery_excludes_configured_names(self) -> None:
        config = _config_discovery()
        tv = _speaker("TV", "192.168.1.10")
        kitchen = _speaker("Kitchen", "192.168.1.20")
        garage = _speaker("Garage", "192.168.1.30")

        with patch("sonos_grouper.grouper.discover_speakers", return_value=[tv, kitchen, garage]):
            resolved = resolve_speakers(config)
        self.assertIsNotNone(resolved)
        master, members = resolved or (None, [])
        self.assertEqual(getattr(master, "ip_address", ""), "192.168.1.10")
        self.assertEqual([getattr(m, "ip_address", "") for m in members], ["192.168.1.20"])

    def test_resolve_speakers_manual_skips_unreachable_member(self) -> None:
        config = _config_manual()
        tv = _speaker("TV", "192.168.1.10")
        kitchen = _speaker("Kitchen", "192.168.1.20")

        def get_speaker_side_effect(ip: str) -> object:
            if ip == "192.168.1.10":
                return tv
            if ip == "192.168.1.20":
                return kitchen
            raise SpeakerUnavailableError("offline")

        with patch("sonos_grouper.grouper.get_speaker", side_effect=get_speaker_side_effect):
            resolved = resolve_speakers(config)
        self.assertIsNotNone(resolved)
        master, members = resolved or (None, [])
        self.assertEqual(getattr(master, "ip_address", ""), "192.168.1.10")
        self.assertEqual([getattr(m, "ip_address", "") for m in members], ["192.168.1.20"])


if __name__ == "__main__":
    unittest.main()
