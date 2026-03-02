import { expect, test } from 'vitest';

import { selectAgendaView, type Appointment } from './agenda';

test('keeps showing today when appointments are still upcoming', () => {
  const appointments: Appointment[] = [
    { date: '2026-03-02', startTime: '08:00', title: 'Already done' },
    { date: '2026-03-02', startTime: '10:00', title: 'Standup' },
    { date: '2026-03-02', startTime: '11:00', title: 'Refinement' },
    { date: '2026-03-02', startTime: '12:00', title: '1:1' },
    { date: '2026-03-03', startTime: '09:00', title: 'Tomorrow event' },
  ];

  const result = selectAgendaView(appointments, new Date('2026-03-02T09:30:00'), 3);

  expect(result).toEqual({
    showTomorrow: false,
    visibleAppointments: [
      { date: '2026-03-02', startTime: '10:00', title: 'Standup' },
      { date: '2026-03-02', startTime: '11:00', title: 'Refinement' },
      { date: '2026-03-02', startTime: '12:00', title: '1:1' },
    ],
    hiddenAppointmentsCount: 0,
  });
});

test('falls back to tomorrow when no appointments are left today', () => {
  const appointments: Appointment[] = [
    { date: '2026-03-02', startTime: '08:00', title: 'Already done' },
    { date: '2026-03-02', startTime: '10:00', title: 'Already done too' },
    { date: '2026-03-03', startTime: '09:00', title: 'Breakfast sync' },
    { date: '2026-03-03', startTime: '11:00', title: 'Planning' },
    { date: '2026-03-03', startTime: '13:00', title: 'Demo' },
    { date: '2026-03-03', startTime: '15:00', title: 'Retro' },
  ];

  const result = selectAgendaView(appointments, new Date('2026-03-02T14:00:00'), 3);

  expect(result).toEqual({
    showTomorrow: true,
    visibleAppointments: [
      { date: '2026-03-03', startTime: '09:00', title: 'Breakfast sync' },
      { date: '2026-03-03', startTime: '11:00', title: 'Planning' },
      { date: '2026-03-03', startTime: '13:00', title: 'Demo' },
    ],
    hiddenAppointmentsCount: 1,
  });
});

test('shows tomorrow empty state inputs when both days have no events', () => {
  const appointments: Appointment[] = [];
  const result = selectAgendaView(appointments, new Date('2026-03-02T14:00:00'), 3);

  expect(result).toEqual({
    showTomorrow: true,
    visibleAppointments: [],
    hiddenAppointmentsCount: 0,
  });
});
