from __future__ import annotations

import os
import unittest
from unittest.mock import patch

from sonos_grouper.config import load_config


class ConfigTests(unittest.TestCase):
    def test_discovery_mode_by_master_name(self) -> None:
        env = {
            "SONOS_MASTER_NAME": "TV",
            "POLL_INTERVAL_SECONDS": "20",
            "LOG_LEVEL": "INFO",
            "DRY_RUN": "false",
        }
        with patch.dict(os.environ, env, clear=True):
            config = load_config(env_path=None)
        self.assertEqual(config.mode, "discovery")
        self.assertEqual(config.master_name, "TV")
        self.assertEqual(config.poll_interval_seconds, 20)

    def test_manual_mode_when_name_missing(self) -> None:
        env = {
            "SONOS_MASTER_IP": "192.168.1.100",
            "SONOS_SPEAKER_IPS": "192.168.1.101,192.168.1.102",
        }
        with patch.dict(os.environ, env, clear=True):
            config = load_config(env_path=None)
        self.assertEqual(config.mode, "manual")
        self.assertEqual(config.master_ip, "192.168.1.100")
        self.assertEqual(config.speaker_ips, ["192.168.1.101", "192.168.1.102"])

    def test_name_takes_precedence_over_manual_ips(self) -> None:
        env = {
            "SONOS_MASTER_NAME": "TV",
            "SONOS_MASTER_IP": "192.168.1.100",
            "SONOS_SPEAKER_IPS": "192.168.1.101",
        }
        with patch.dict(os.environ, env, clear=True):
            config = load_config(env_path=None)
        self.assertEqual(config.mode, "discovery")
        self.assertEqual(config.master_name, "TV")

    def test_raises_when_neither_mode_is_configured(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(ValueError):
                load_config(env_path=None)

    def test_excluded_speakers_parsing(self) -> None:
        env = {
            "SONOS_MASTER_NAME": "TV",
            "SONOS_EXCLUDED_SPEAKERS": "Bathroom, Garage , , Kitchen",
        }
        with patch.dict(os.environ, env, clear=True):
            config = load_config(env_path=None)
        self.assertEqual(config.excluded_speakers, ["Bathroom", "Garage", "Kitchen"])

    def test_defaults_and_bool_parsing(self) -> None:
        env = {"SONOS_MASTER_NAME": "TV", "DRY_RUN": "yes"}
        with patch.dict(os.environ, env, clear=True):
            config = load_config(env_path=None)
        self.assertEqual(config.poll_interval_seconds, 20)
        self.assertEqual(config.log_level, "INFO")
        self.assertTrue(config.dry_run)
        self.assertEqual(config.discovery_timeout_seconds, 5)

    def test_invalid_poll_interval_raises(self) -> None:
        env = {"SONOS_MASTER_NAME": "TV", "POLL_INTERVAL_SECONDS": "0"}
        with patch.dict(os.environ, env, clear=True):
            with self.assertRaises(ValueError):
                load_config(env_path=None)


if __name__ == "__main__":
    unittest.main()
