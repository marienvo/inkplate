import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_BUCKET_NAME,
  R2_SECRET_ACCESS_KEY,
} from '../config.js';
import { getDateKey, hashDirectoryFiles } from './dataHash.ts';

const dataDir = 'src/data';
const hashFilePath = '.tmp/data-hash-r2';
const dashboardPath = 'dist/dashboard.png';
const objectKey = 'dashboard.png';

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

type DeployR2Dependencies = {
  config?: R2Config;
  now?: () => Date;
  computeHash?: typeof hashDirectoryFiles;
  readHash?: () => Promise<string | null>;
  writeHash?: (hash: string) => Promise<void>;
  upload?: (config: R2Config) => Promise<void>;
  logger?: Pick<Console, 'log'>;
};

function getRequiredString(value: unknown, keyName: string): string {
  if (!value || typeof value !== 'string') {
    throw new Error(`${keyName} is missing in config.js`);
  }

  return value;
}

export function getR2Config(source?: {
  accountId?: unknown;
  accessKeyId?: unknown;
  secretAccessKey?: unknown;
  bucketName?: unknown;
}): R2Config {
  const values = source ?? {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucketName: R2_BUCKET_NAME,
  };

  return {
    accountId: getRequiredString(values.accountId, 'R2_ACCOUNT_ID'),
    accessKeyId: getRequiredString(values.accessKeyId, 'R2_ACCESS_KEY_ID'),
    secretAccessKey: getRequiredString(values.secretAccessKey, 'R2_SECRET_ACCESS_KEY'),
    bucketName: getRequiredString(values.bucketName, 'R2_BUCKET_NAME'),
  };
}

function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

async function uploadDashboardPng(config: R2Config): Promise<void> {
  const client = createR2Client(config);
  const pngBody = await readFile(dashboardPath);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: objectKey,
      Body: pngBody,
      ContentType: 'image/png',
      CacheControl: 'no-store, max-age=0, must-revalidate',
    }),
  );
}

async function readStoredHash(): Promise<string | null> {
  try {
    return (await readFile(hashFilePath, 'utf8')).trim();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function persistHash(hash: string): Promise<void> {
  await mkdir('.tmp', { recursive: true });
  await writeFile(hashFilePath, `${hash}\n`, 'utf8');
}

export async function runR2Deploy(dependencies: DeployR2Dependencies = {}): Promise<void> {
  const config = dependencies.config ?? getR2Config();
  const now = dependencies.now ?? (() => new Date());
  const computeHash = dependencies.computeHash ?? hashDirectoryFiles;
  const readHash = dependencies.readHash ?? readStoredHash;
  const writeHash = dependencies.writeHash ?? persistHash;
  const upload = dependencies.upload ?? uploadDashboardPng;
  const logger = dependencies.logger ?? console;

  const todayKey = getDateKey(now());
  const currentHash = await computeHash(dataDir, { dateKey: todayKey });
  const previousHash = await readHash();

  if (previousHash === currentHash) {
    logger.log('No changes in src/data; skipping R2 deploy.');
    return;
  }

  await upload(config);
  await writeHash(currentHash);
}

async function main(): Promise<void> {
  await runR2Deploy();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
