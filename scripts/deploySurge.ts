import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { SURGE_DOMAIN } from '../config.js';
import { getDateKey, hashDirectoryFiles } from './dataHash.ts';

const distDir = 'dist/';
const dataDir = 'src/data';
const hashFilePath = '.tmp/data-hash';

function runSurgeDeploy(): Promise<number> {
  return new Promise((resolve, reject) => {
    const surge = spawn('surge', [distDir, SURGE_DOMAIN], {
      stdio: 'inherit',
      shell: true,
    });

    surge.on('error', reject);
    surge.on('close', (code) => {
      resolve(code ?? 1);
    });
  });
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

async function main(): Promise<void> {
  if (!SURGE_DOMAIN || typeof SURGE_DOMAIN !== 'string') {
    console.error('SURGE_DOMAIN is missing in config.js');
    process.exit(1);
  }

  const todayKey = getDateKey(new Date());
  const currentHash = await hashDirectoryFiles(dataDir, { dateKey: todayKey });
  const previousHash = await readStoredHash();

  if (previousHash === currentHash) {
    console.log('No changes in src/data; skipping Surge deploy.');
    return;
  }

  const exitCode = await runSurgeDeploy();
  if (exitCode !== 0) {
    process.exit(exitCode);
  }

  await persistHash(currentHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
