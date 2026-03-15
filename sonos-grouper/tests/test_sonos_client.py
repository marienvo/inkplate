from __future__ import annotations

import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch

from sonos_grouper.sonos_client import (
    SpeakerUnavailableError,
    discover_speakers,
    find_master_by_name,
    is_grouped_with_master,
    join_to_master,
    speaker_ip,
)


def _fake_speaker(name: str, ip: str, coordinator_ip: str | None = None) -> object:
    if coordinator_ip is None:
        coordinator_ip = ip
    coordinator = SimpleNamespace(ip_address=coordinator_ip, player_name="Coordinator")
    group = SimpleNamespace(coordinator=coordinator)
    speaker = SimpleNamespace(player_name=name, ip_address=ip, group=group)
    speaker.join = Mock()
    return speaker


class SonosClientTests(unittest.TestCase):
    def test_discover_speakers_returns_sorted_list(self) -> None:
        a = _fake_speaker("Kitchen", "192.168.1.20")
        b = _fake_speaker("Bathroom", "192.168.1.30")
        fake_soco = SimpleNamespace(discover=Mock(return_value=[a, b]))
        with patch("sonos_grouper.sonos_client.soco", fake_soco):
            speakers = discover_speakers(timeout=5)
        self.assertEqual([s.player_name for s in speakers], ["Bathroom", "Kitchen"])

    def test_discover_speakers_handles_none(self) -> None:
        fake_soco = SimpleNamespace(discover=Mock(return_value=None))
        with patch("sonos_grouper.sonos_client.soco", fake_soco):
            speakers = discover_speakers(timeout=5)
        self.assertEqual(speakers, [])

    def test_find_master_by_name_case_insensitive(self) -> None:
        speakers = [
            _fake_speaker("TV", "192.168.1.10"),
            _fake_speaker("Kitchen", "192.168.1.20"),
        ]
        master = find_master_by_name(speakers, "tv")
        self.assertIsNotNone(master)
        self.assertEqual(speaker_ip(master), "192.168.1.10")

    def test_find_master_by_name_returns_none_when_missing(self) -> None:
        speakers = [_fake_speaker("Kitchen", "192.168.1.20")]
        master = find_master_by_name(speakers, "TV")
        self.assertIsNone(master)

    def test_is_grouped_with_master_true_and_false(self) -> None:
        grouped = _fake_speaker("Kitchen", "192.168.1.20", coordinator_ip="192.168.1.10")
        not_grouped = _fake_speaker("Kitchen", "192.168.1.20", coordinator_ip="192.168.1.99")
        self.assertTrue(is_grouped_with_master(grouped, "192.168.1.10"))
        self.assertFalse(is_grouped_with_master(not_grouped, "192.168.1.10"))

    def test_join_to_master_calls_join(self) -> None:
        master = _fake_speaker("TV", "192.168.1.10")
        member = _fake_speaker("Kitchen", "192.168.1.20")
        join_to_master(member, master)
        member.join.assert_called_once_with(master)

    def test_join_to_master_raises_custom_error(self) -> None:
        master = _fake_speaker("TV", "192.168.1.10")
        member = _fake_speaker("Kitchen", "192.168.1.20")
        member.join.side_effect = OSError("timeout")
        with self.assertRaises(SpeakerUnavailableError):
            join_to_master(member, master)


if __name__ == "__main__":
    unittest.main()
