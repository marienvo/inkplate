import { expect, test, vi } from 'vitest';

import { runDeploySettings } from './deploySettings.ts';
import type { R2Config } from './r2Client.ts';

const demoConfig: R2Config = {
  accountId: 'demo-account-id',
  accessKeyId: 'demo-access-key-id',
  secretAccessKey: 'demo-secret-access-key',
  bucketName: 'demo-bucket-name',
};

test('uploads normalized settings JSON', async () => {
  const upload = vi.fn(async () => undefined);

  await runDeploySettings({
    config: demoConfig,
    readLocalSettings: async () =>
      JSON.stringify({
        challenge: {
          start: '2026-03-01',
          end: '2026-03-31',
          label: 'March',
          value: 'No Sweets',
        },
      }),
    upload,
  });

  expect(upload).toHaveBeenCalledWith(
    demoConfig,
    '{\n  "challenge": {\n    "start": "2026-03-01",\n    "end": "2026-03-31",\n    "label": "March",\n    "value": "No Sweets"\n  }\n}\n',
  );
});

test('throws when settings have an invalid challenge schema', async () => {
  await expect(
    runDeploySettings({
      config: demoConfig,
      readLocalSettings: async () => JSON.stringify({ challenge: { label: 'March' } }),
      upload: async () => undefined,
    }),
  ).rejects.toThrow('settings.challenge.start must be a non-empty string');
});
