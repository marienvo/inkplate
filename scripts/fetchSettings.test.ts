import { expect, test, vi } from 'vitest';

import { getDefaultChallengeSettings } from '../src/lib/challengeSettings.ts';
import { runFetchSettings } from './fetchSettings.ts';
import type { R2Config } from './r2Client.ts';

const demoConfig: R2Config = {
  accountId: 'demo-account-id',
  accessKeyId: 'demo-access-key-id',
  secretAccessKey: 'demo-secret-access-key',
  bucketName: 'demo-bucket-name',
};

test('writes fetched settings after validation', async () => {
  const writeSettings = vi.fn(async () => undefined);
  const logger = { log: vi.fn(), warn: vi.fn() };

  await runFetchSettings({
    config: demoConfig,
    fetchObject: async () =>
      JSON.stringify({
        challenge: {
          start: '2026-03-01',
          end: '2026-03-31',
          label: 'March',
          value: 'No Sweets',
        },
      }),
    writeSettings,
    logger,
  });

  expect(writeSettings).toHaveBeenCalledWith({
    challenge: {
      start: '2026-03-01',
      end: '2026-03-31',
      label: 'March',
      value: 'No Sweets',
    },
  });
  expect(logger.log).toHaveBeenCalledWith('Settings written to src/data/settings.json');
  expect(logger.warn).not.toHaveBeenCalled();
});

test('writes default settings when object is missing in R2', async () => {
  const writeSettings = vi.fn(async () => undefined);
  const logger = { log: vi.fn(), warn: vi.fn() };

  await runFetchSettings({
    config: demoConfig,
    fetchObject: async () => {
      throw { name: 'NoSuchKey' };
    },
    writeSettings,
    logger,
  });

  expect(writeSettings).toHaveBeenCalledWith(getDefaultChallengeSettings());
  expect(logger.warn).toHaveBeenCalledWith(
    'settings.json not found in R2; writing default settings.',
  );
});
