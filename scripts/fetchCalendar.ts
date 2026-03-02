import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import ICAL from 'ical.js';

import { ICS_URL } from '../config.js';

export type Appointment = {
  date: string;
  startTime: string;
  title: string;
};

type TargetDates = {
  today: string;
  tomorrow: string;
};

type ICalTime = InstanceType<typeof ICAL.Time>;
type ICalEvent = InstanceType<typeof ICAL.Event>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const CALENDAR_FILE_PATH = resolve(__dirname, '../src/data/calendar.json');
const MAX_OCCURRENCES_PER_EVENT = 5000;
const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Amsterdam',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function formatDateInAmsterdam(date: Date): string {
  const parts = DATE_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Could not format Amsterdam date');
  }

  return `${year}-${month}-${day}`;
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getTargetDates(now: Date): TargetDates {
  const today = formatDateInAmsterdam(now);
  const tomorrow = addDays(today, 1);
  return { today, tomorrow };
}

function dateFromIcalTime(startDate: ICalTime): string {
  if (startDate.isDate) {
    const month = String(startDate.month).padStart(2, '0');
    const day = String(startDate.day).padStart(2, '0');
    return `${startDate.year}-${month}-${day}`;
  }

  return formatDateInAmsterdam(startDate.toJSDate());
}

function timeFromIcalTime(startDate: ICalTime): string {
  if (startDate.isDate) {
    return '00:00';
  }

  return TIME_FORMATTER.format(startDate.toJSDate());
}

function normalizeTitle(summary: string): string {
  const trimmed = summary.trim();
  return trimmed.length > 0 ? trimmed : '(No title)';
}

function mapOccurrenceToAppointment(
  startDate: ICalTime,
  title: string,
  targetDates: TargetDates,
): Appointment | null {
  const date = dateFromIcalTime(startDate);
  if (date < targetDates.today || date > targetDates.tomorrow) {
    return null;
  }

  return {
    date,
    startTime: timeFromIcalTime(startDate),
    title: normalizeTitle(title),
  };
}

function collectRecurringAppointments(event: ICalEvent, targetDates: TargetDates): Appointment[] {
  const appointments: Appointment[] = [];
  const iterator = event.iterator();

  for (let index = 0; index < MAX_OCCURRENCES_PER_EVENT; index += 1) {
    const occurrence = iterator.next();
    if (!occurrence) {
      break;
    }

    const details = event.getOccurrenceDetails(occurrence);
    const occurrenceDate = dateFromIcalTime(details.startDate);
    if (occurrenceDate > targetDates.tomorrow) {
      break;
    }

    const appointment = mapOccurrenceToAppointment(details.startDate, event.summary, targetDates);
    if (appointment) {
      appointments.push(appointment);
    }
  }

  return appointments;
}

export function parseIcsToAppointments(icsText: string, now: Date = new Date()): Appointment[] {
  const targetDates = getTargetDates(now);
  const parsed = ICAL.parse(icsText);
  const calendar = new ICAL.Component(parsed);
  const events = calendar.getAllSubcomponents('vevent');
  const appointments: Appointment[] = [];

  for (const component of events) {
    const event = new ICAL.Event(component);

    if (event.isRecurrenceException()) {
      continue;
    }

    if (event.isRecurring()) {
      appointments.push(...collectRecurringAppointments(event, targetDates));
      continue;
    }

    const appointment = mapOccurrenceToAppointment(event.startDate, event.summary, targetDates);
    if (appointment) {
      appointments.push(appointment);
    }
  }

  return appointments.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    if (a.startTime !== b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return a.title.localeCompare(b.title);
  });
}

async function fetchCalendarIcs(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ICS request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function main(): Promise<void> {
  if (!ICS_URL || ICS_URL.trim().length === 0) {
    throw new Error('ICS_URL is missing in config.js');
  }

  const icsText = await fetchCalendarIcs(ICS_URL);
  const appointments = parseIcsToAppointments(icsText);
  await mkdir(dirname(CALENDAR_FILE_PATH), { recursive: true });
  await writeFile(CALENDAR_FILE_PATH, `${JSON.stringify(appointments, null, 2)}\n`, 'utf8');
  console.log(`Calendar data written to ${CALENDAR_FILE_PATH}`);
}

const isMainModule =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to fetch calendar: ${message}`);
    process.exit(1);
  });
}
