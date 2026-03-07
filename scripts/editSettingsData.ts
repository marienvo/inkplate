import type { Challenge, ChallengeSettings } from '../src/lib/challengeSettings.ts';

export type ChallengeInput = Pick<Challenge, 'start' | 'end' | 'label' | 'value'>;

type ParsedIsoDate = {
  year: number;
  month: number;
  day: number;
};

export type MonthRange = {
  start: string;
  end: string;
  monthLabel: string;
  monthYearLabel: string;
};

function parseIsoDateOnly(value: string): ParsedIsoDate | null {
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

  return { year, month, day };
}

function toIsoDateOnly(value: Date): string {
  const year = value.getUTCFullYear().toString().padStart(4, '0');
  const month = (value.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = value.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toUtcDayIndexFromIsoDate(value: string): number | null {
  const parsed = parseIsoDateOnly(value);
  if (!parsed) return null;
  return Date.UTC(parsed.year, parsed.month - 1, parsed.day);
}

function toUtcDayIndexForLocalDate(value: Date): number {
  return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
}

function firstDayOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function lastDayOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function addUtcMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

export function buildMonthRange(baseDate: Date, monthOffset: number): MonthRange {
  const startMonth = addUtcMonths(baseDate, monthOffset);
  const startDate = firstDayOfMonth(startMonth);
  const endDate = lastDayOfMonth(startMonth);
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    timeZone: 'UTC',
  }).format(startDate);
  const monthYearLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(startDate);

  return {
    start: toIsoDateOnly(startDate),
    end: toIsoDateOnly(endDate),
    monthLabel,
    monthYearLabel,
  };
}

export function upsertChallengeForRange(
  settings: ChallengeSettings,
  nextChallenge: ChallengeInput,
  today: Date = new Date(),
): ChallengeSettings {
  const todayUtc = toUtcDayIndexForLocalDate(today);
  const pruned = settings.challenges.filter((challenge) => {
    const endUtc = toUtcDayIndexFromIsoDate(challenge.end);
    if (endUtc === null) return true;
    return endUtc >= todayUtc;
  });

  const existingIndex = pruned.findIndex(
    (challenge) => challenge.start === nextChallenge.start && challenge.end === nextChallenge.end,
  );
  if (existingIndex >= 0) {
    pruned[existingIndex] = { ...nextChallenge };
  } else {
    pruned.push({ ...nextChallenge });
  }

  return { challenges: pruned };
}
