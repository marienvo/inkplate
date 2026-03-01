import { expect, test, vi } from 'vitest';

import { getR2Config, runR2Deploy, type R2Config } from './deployR2.ts';

const demoConfig: R2Config = {
  accountId: 'demo-account-id',
  accessKeyId: 'demo-access-key-id',
  secretAccessKey: 'demo-secret-access-key',
  bucketName: 'demo-bucket-name',
};

test('throws when required config value is missing', () => {
  expect(() =>
    getR2Config({
      accountId: '',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      bucketName: 'bucket',
    }),
  ).toThrow('R2_ACCOUNT_ID is missing in config.js');
});

test('skips upload when hash is unchanged', async () => {
  const upload = vi.fn(async () => undefined);
  const writeHash = vi.fn(async () => undefined);
  const logger = { log: vi.fn() };

  await runR2Deploy({
    config: demoConfig,
    now: () => new Date('2026-03-01T12:00:00.000Z'),
    computeHash: async () => 'same-hash',
    readHash: async () => 'same-hash',
    upload,
    writeHash,
    logger,
  });

  expect(upload).not.toHaveBeenCalled();
  expect(writeHash).not.toHaveBeenCalled();
  expect(logger.log).toHaveBeenCalledWith('No changes in src/data; skipping R2 deploy.');
});
