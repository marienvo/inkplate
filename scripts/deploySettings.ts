import { PutObjectCommand } from '@aws-sdk/client-s3';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { parseChallengeSettings } from '../src/lib/challengeSettings.ts';
import { createR2Client, getR2Config, type R2Config } from './r2Client.ts';

const localSettingsPath = 'settings.json';
const objectKey = 'settings.json';

type DeploySettingsDependencies = {
  config?: R2Config;
  readLocalSettings?: () => Promise<string>;
  upload?: (config: R2Config, body: string) => Promise<void>;
};

async function uploadSettings(config: R2Config, body: string): Promise<void> {
  const client = createR2Client(config);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: body,
      ContentType: 'application/json',
      CacheControl: 'no-store, max-age=0, must-revalidate',
    }),
  );
}

export async function runDeploySettings(
  dependencies: DeploySettingsDependencies = {},
): Promise<void> {
  const config = dependencies.config ?? getR2Config();
  const readLocalSettings =
    dependencies.readLocalSettings ?? (() => readFile(localSettingsPath, 'utf8'));
  const upload = dependencies.upload ?? uploadSettings;

  const raw = await readLocalSettings();
  const settings = parseChallengeSettings(JSON.parse(raw));
  const normalizedBody = `${JSON.stringify(settings, null, 2)}\n`;

  await upload(config, normalizedBody);
}

async function main(): Promise<void> {
  await runDeploySettings();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
