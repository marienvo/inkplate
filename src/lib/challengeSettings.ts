export type Challenge = {
  start: string;
  end: string;
  label: string;
  value: string;
};

export type ChallengeSettings = {
  challenge: Challenge | null;
};

export function getDefaultChallengeSettings(): ChallengeSettings {
  return { challenge: null };
}

function readNonEmptyString(value: unknown, fieldName: string, objectName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`settings.${objectName}.${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

function asChallenge(value: unknown): Challenge {
  if (!value || typeof value !== 'object') {
    throw new Error('settings.challenge must be an object or null');
  }

  const record = value as Record<string, unknown>;
  return {
    start: readNonEmptyString(record.start, 'start', 'challenge'),
    end: readNonEmptyString(record.end, 'end', 'challenge'),
    label: readNonEmptyString(record.label, 'label', 'challenge'),
    value: readNonEmptyString(record.value, 'value', 'challenge'),
  };
}

export function parseChallengeSettings(value: unknown): ChallengeSettings {
  if (!value || typeof value !== 'object') {
    throw new Error('settings must be a JSON object');
  }

  const record = value as Record<string, unknown>;
  if (!('challenge' in record) || record.challenge === null) {
    return getDefaultChallengeSettings();
  }

  return {
    challenge: asChallenge(record.challenge),
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

export function isChallengeActive(settings: ChallengeSettings, now: Date = new Date()): boolean {
  if (!settings.challenge) return false;

  const startDate = parseIsoDateOnly(settings.challenge.start);
  const endDate = parseIsoDateOnly(settings.challenge.end);
  if (!startDate || !endDate) return false;

  const today = new Date(now);
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const startUtc = toUtcDayIndex(startDate);
  const endUtc = toUtcDayIndex(endDate);

  return startUtc <= todayUtc && todayUtc <= endUtc;
}

export function formatChallengeText(challenge: Challenge): string {
  return `${challenge.value} (${challenge.label})`;
}
