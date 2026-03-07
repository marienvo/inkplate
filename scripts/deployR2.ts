import { PutObjectCommand } from '@aws-sdk/client-s3';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { getDateKey, hashDirectoryFiles } from './dataHash.ts';
import { createR2Client, getR2Config } from './r2Client.ts';
import type { R2Config } from './r2Client.ts';

const dataDir = 'src/data';
const hashFilePath = '.tmp/data-hash-r2';
const dashboardPath = 'dist/dashboard.png';
const objectKey = 'dashboard.png';

type DeployR2Dependencies = {
  config?: R2Config;
  now?: () => Date;
  computeHash?: typeof hashDirectoryFiles;
  readHash?: () => Promise<string | null>;
  writeHash?: (hash: string) => Promise<void>;
  upload?: (config: R2Config) => Promise<void>;
  logger?: Pick<Console, 'log'>;
};

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

export { getR2Config };
export type { R2Config } from './r2Client.ts';
