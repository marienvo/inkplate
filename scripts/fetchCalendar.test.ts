import { expect, test } from 'vitest';

import { parseIcsToAppointments } from './fetchCalendar.ts';

test('parses ICS events for today and tomorrow including recurrences', () => {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Inkplate//Calendar Test//EN
BEGIN:VEVENT
UID:single-1
DTSTAMP:20260301T070000Z
DTSTART:20260301T080000Z
SUMMARY:Team standup
END:VEVENT
BEGIN:VEVENT
UID:recur-1
DTSTAMP:20260301T070000Z
DTSTART:20260301T200000Z
RRULE:FREQ=DAILY;COUNT=2
SUMMARY:Call with supplier
END:VEVENT
BEGIN:VEVENT
UID:single-2
DTSTAMP:20260301T070000Z
DTSTART:20260302T090000Z
SUMMARY:Sprint planning
END:VEVENT
BEGIN:VEVENT
UID:old-1
DTSTAMP:20260301T070000Z
DTSTART:20260228T120000Z
SUMMARY:Old event
END:VEVENT
END:VCALENDAR`;

  const result = parseIcsToAppointments(ics, new Date('2026-03-01T11:00:00+01:00'));

  expect(result).toEqual([
    { date: '2026-03-01', startTime: '09:00', title: 'Team standup' },
    { date: '2026-03-01', startTime: '21:00', title: 'Call with supplier' },
    { date: '2026-03-02', startTime: '10:00', title: 'Sprint planning' },
    { date: '2026-03-02', startTime: '21:00', title: 'Call with supplier' },
  ]);
});

test('maps all-day events to midnight', () => {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Inkplate//Calendar Test//EN
BEGIN:VEVENT
UID:allday-1
DTSTAMP:20260301T070000Z
DTSTART;VALUE=DATE:20260301
SUMMARY:Vacation day
END:VEVENT
END:VCALENDAR`;

  const result = parseIcsToAppointments(ics, new Date('2026-03-01T12:00:00+01:00'));

  expect(result).toEqual([{ date: '2026-03-01', startTime: '00:00', title: 'Vacation day' }]);
});
