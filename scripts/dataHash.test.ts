import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { getDateKey, hashDirectoryFiles } from './dataHash.ts';

async function withTempDir(run: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), 'inkplate-hash-'));
  try {
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('changes hash when a file content changes', async () => {
  await withTempDir(async (dir) => {
    await writeFile(join(dir, 'calendar.json'), '{"day":"sun"}', 'utf8');
    await writeFile(join(dir, 'weather.json'), '{"temp":12}', 'utf8');

    const before = await hashDirectoryFiles(dir);

    await writeFile(join(dir, 'weather.json'), '{"temp":13}', 'utf8');

    const after = await hashDirectoryFiles(dir);

    expect(after).not.toBe(before);
  });
});

test('ignores nested directories and remains deterministic', async () => {
  await withTempDir(async (dir) => {
    await writeFile(join(dir, 'b.json'), 'b', 'utf8');
    await writeFile(join(dir, 'a.json'), 'a', 'utf8');
    await mkdir(join(dir, 'nested'));
    await writeFile(join(dir, 'nested', 'ignored.json'), 'nested', 'utf8');

    const first = await hashDirectoryFiles(dir);
    const second = await hashDirectoryFiles(dir);

    expect(first).toBe(second);
  });
});

test('changes hash when date key changes', async () => {
  await withTempDir(async (dir) => {
    await writeFile(join(dir, 'calendar.json'), '{"day":"sun"}', 'utf8');

    const first = await hashDirectoryFiles(dir, { dateKey: '2026-03-01' });
    const second = await hashDirectoryFiles(dir, { dateKey: '2026-03-02' });

    expect(first).not.toBe(second);
  });
});

test('formats date key without time', () => {
  const date = new Date('2026-03-01T23:59:59');

  expect(getDateKey(date)).toBe('2026-03-01');
});
