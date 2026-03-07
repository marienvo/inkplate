import { cancel, confirm, intro, isCancel, outro, select, text } from '@clack/prompts';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import {
  getDefaultChallengeSettings,
  parseChallengeSettings,
  type ChallengeSettings,
} from '../src/lib/challengeSettings.ts';
import { runDeploySettings } from './deploySettings.ts';
import { buildMonthRange, upsertChallengeForRange } from './editSettingsData.ts';

const localSettingsPath = 'settings.json';
const monthOffsets = [0, 1, 2, 3, 4, 5, 6];

type MonthOption = {
  id: string;
  hint?: string;
  range: {
    start: string;
    end: string;
    monthLabel: string;
    monthYearLabel: string;
  };
};

type EditSettingsDependencies = {
  now?: () => Date;
  readLocalSettings?: () => Promise<string>;
  writeLocalSettings?: (body: string) => Promise<void>;
  deploySettings?: () => Promise<void>;
};

function normalizePromptValue(value: string | undefined): string {
  return value?.trim() ?? '';
}

function monthOptionsForDate(now: Date): MonthOption[] {
  return monthOffsets.map((offset) => {
    const range = buildMonthRange(now, offset);
    return {
      id: `offset-${offset}`,
      hint: offset === 1 ? 'default' : offset === 0 ? 'current month' : undefined,
      range,
    };
  });
}

async function readExistingSettings(
  readLocalSettings: () => Promise<string>,
): Promise<ChallengeSettings> {
  try {
    const raw = await readLocalSettings();
    return parseChallengeSettings(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return getDefaultChallengeSettings();
    }
    throw error;
  }
}

export async function runEditSettings(dependencies: EditSettingsDependencies = {}): Promise<void> {
  const now = dependencies.now ?? (() => new Date());
  const readLocalSettings =
    dependencies.readLocalSettings ?? (() => readFile(localSettingsPath, 'utf8'));
  const writeLocalSettings =
    dependencies.writeLocalSettings ??
    ((body: string) => writeFile(localSettingsPath, body, 'utf8'));
  const deploySettings = dependencies.deploySettings ?? (() => runDeploySettings());

  intro('Update challenge settings');

  const monthOptions = monthOptionsForDate(now());
  const selectedMonthId = await select({
    message: 'Which month should this challenge apply to?',
    initialValue: 'offset-1',
    options: monthOptions.map((option) => ({
      value: option.id,
      label: option.range.monthYearLabel,
      hint: option.hint,
    })),
  });
  if (isCancel(selectedMonthId)) {
    cancel('Cancelled.');
    return;
  }
  const selectedMonth = monthOptions.find((option) => option.id === selectedMonthId);
  if (!selectedMonth) {
    throw new Error('Received an invalid month selection.');
  }

  const labelInput = await text({
    message: 'Label',
    placeholder: 'For example: March',
    initialValue: selectedMonth.range.monthLabel,
    validate(value) {
      return normalizePromptValue(value).length === 0 ? 'Label is required.' : undefined;
    },
  });
  if (isCancel(labelInput)) {
    cancel('Cancelled.');
    return;
  }
  const label = normalizePromptValue(labelInput);

  const valueInput = await text({
    message: 'Value',
    placeholder: 'For example: No Sweets',
    validate(value) {
      return normalizePromptValue(value).length === 0 ? 'Value is required.' : undefined;
    },
  });
  if (isCancel(valueInput)) {
    cancel('Cancelled.');
    return;
  }
  const value = normalizePromptValue(valueInput);

  const shouldContinue = await confirm({
    message: `Save for ${selectedMonth.range.monthYearLabel}: "${label}" -> "${value}" and then upload?`,
    initialValue: true,
  });
  if (isCancel(shouldContinue) || !shouldContinue) {
    cancel('Cancelled.');
    return;
  }

  const currentSettings = await readExistingSettings(readLocalSettings);
  const updated = upsertChallengeForRange(currentSettings, {
    start: selectedMonth.range.start,
    end: selectedMonth.range.end,
    label,
    value,
  });

  await writeLocalSettings(`${JSON.stringify(updated, null, 2)}\n`);
  await deploySettings();

  outro('settings.json updated and uploaded.');
}

async function main(): Promise<void> {
  await runEditSettings();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
