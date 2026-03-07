import { GetObjectCommand } from '@aws-sdk/client-s3';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  getDefaultChallengeSettings,
  parseChallengeSettings,
  type ChallengeSettings,
} from '../src/lib/challengeSettings.ts';
import { createR2Client, getR2Config, type R2Config } from './r2Client.ts';

const outputPath = 'src/data/settings.json';
const objectKey = 'settings.json';

type FetchSettingsDependencies = {
  config?: R2Config;
  fetchObject?: (config: R2Config) => Promise<string>;
  writeSettings?: (settings: ChallengeSettings) => Promise<void>;
  logger?: Pick<Console, 'warn' | 'log'>;
};

type R2Body = {
  transformToString?: () => Promise<string>;
};

function isNoSuchKeyError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = (error as { name?: string }).name;
  const code = (error as { Code?: string }).Code;
  const statusCode = (error as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode;
  return name === 'NoSuchKey' || code === 'NoSuchKey' || statusCode === 404;
}

async function fetchSettingsObject(config: R2Config): Promise<string> {
  const client = createR2Client(config);
  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
    }),
  );

  const body = response.Body as R2Body | undefined;
  if (!body?.transformToString) {
    throw new Error('R2 settings object body is missing or unreadable');
  }
  return body.transformToString();
}

async function writeSettingsFile(settings: ChallengeSettings): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
}

export async function runFetchSettings(
  dependencies: FetchSettingsDependencies = {},
): Promise<void> {
  const config = dependencies.config ?? getR2Config();
  const fetchObject = dependencies.fetchObject ?? fetchSettingsObject;
  const writeSettings = dependencies.writeSettings ?? writeSettingsFile;
  const logger = dependencies.logger ?? console;

  try {
    const raw = await fetchObject(config);
    const parsed = parseChallengeSettings(JSON.parse(raw));
    await writeSettings(parsed);
    logger.log(`Settings written to ${outputPath}`);
  } catch (error) {
    if (!isNoSuchKeyError(error)) {
      throw error;
    }

    logger.warn('settings.json not found in R2; writing default settings.');
    await writeSettings(getDefaultChallengeSettings());
  }
}

async function main(): Promise<void> {
  await runFetchSettings();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
