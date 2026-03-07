export type Challenge = {
  start: string;
  end: string;
  label: string;
  value: string;
};

export type ChallengeSettings = {
  challenges: Challenge[];
};

export function getDefaultChallengeSettings(): ChallengeSettings {
  return { challenges: [] };
}

function readNonEmptyString(value: unknown, fieldName: string, objectName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`settings.${objectName}.${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

function asChallenge(value: unknown, objectName: string): Challenge {
  if (!value || typeof value !== 'object') {
    throw new Error(`settings.${objectName} must be an object`);
  }

  const record = value as Record<string, unknown>;
  return {
    start: readNonEmptyString(record.start, 'start', objectName),
    end: readNonEmptyString(record.end, 'end', objectName),
    label: readNonEmptyString(record.label, 'label', objectName),
    value: readNonEmptyString(record.value, 'value', objectName),
  };
}

export function parseChallengeSettings(value: unknown): ChallengeSettings {
  if (!value || typeof value !== 'object') {
    throw new Error('settings must be a JSON object');
  }

  const record = value as Record<string, unknown>;
  if (!('challenges' in record) || record.challenges === null) {
    return getDefaultChallengeSettings();
  }
  if (!Array.isArray(record.challenges)) {
    throw new Error('settings.challenges must be an array');
  }

  return {
    challenges: record.challenges.map((challenge, index) =>
      asChallenge(challenge, `challenges[${index}]`),
    ),
  };
}

function parseIsoDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function toUtcDayIndex(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getActiveChallenge(
  settings: ChallengeSettings,
  now: Date = new Date(),
): Challenge | null {
  const today = new Date(now);
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  for (const challenge of settings.challenges) {
    const startDate = parseIsoDateOnly(challenge.start);
    const endDate = parseIsoDateOnly(challenge.end);
    if (!startDate || !endDate) continue;

    const startUtc = toUtcDayIndex(startDate);
    const endUtc = toUtcDayIndex(endDate);
    if (startUtc <= todayUtc && todayUtc <= endUtc) {
      return challenge;
    }
  }
  return null;
}

export function formatChallengeText(challenge: Challenge): string {
  return `${challenge.value} (${challenge.label})`;
}
