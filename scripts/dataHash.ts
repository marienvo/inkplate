import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function hashDirectoryFiles(
  directoryPath: string,
  options?: { dateKey?: string },
): Promise<string> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const fileNames = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();

  const hash = createHash('sha256');
  if (options?.dateKey) {
    hash.update('dateKey');
    hash.update('\0');
    hash.update(options.dateKey);
    hash.update('\0');
  }

  for (const fileName of fileNames) {
    hash.update(fileName);
    hash.update('\0');
    hash.update(await readFile(join(directoryPath, fileName)));
    hash.update('\0');
  }

  return hash.digest('hex');
}
