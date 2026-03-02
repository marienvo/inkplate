export type Appointment = {
  date: string;
  startTime: string;
  title: string;
};

type AgendaView = {
  showTomorrow: boolean;
  visibleAppointments: Appointment[];
  hiddenAppointmentsCount: number;
};

function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function format24HourTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function sortByStartTime(a: Appointment, b: Appointment): number {
  return a.startTime.localeCompare(b.startTime);
}

export function selectAgendaView(
  appointments: Appointment[],
  now: Date,
  maxVisibleAppointments: number,
): AgendaView {
  const todayIsoDate = formatIsoDate(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowIsoDate = formatIsoDate(tomorrowDate);

  const todayAppointments = appointments.filter((appointment) => appointment.date === todayIsoDate);
  todayAppointments.sort(sortByStartTime);

  const currentTime = format24HourTime(now);
  const firstUpcomingIndex = todayAppointments.findIndex(
    (appointment) => appointment.startTime >= currentTime,
  );

  if (firstUpcomingIndex !== -1) {
    const startIndex = Math.max(
      0,
      Math.min(firstUpcomingIndex, todayAppointments.length - maxVisibleAppointments),
    );
    const visibleAppointments = todayAppointments.slice(
      startIndex,
      startIndex + maxVisibleAppointments,
    );

    return {
      showTomorrow: false,
      visibleAppointments,
      hiddenAppointmentsCount: Math.max(
        0,
        todayAppointments.length - (startIndex + visibleAppointments.length),
      ),
    };
  }

  const tomorrowAppointments = appointments.filter(
    (appointment) => appointment.date === tomorrowIsoDate,
  );
  tomorrowAppointments.sort(sortByStartTime);
  const visibleAppointments = tomorrowAppointments.slice(0, maxVisibleAppointments);

  return {
    showTomorrow: true,
    visibleAppointments,
    hiddenAppointmentsCount: Math.max(0, tomorrowAppointments.length - visibleAppointments.length),
  };
}
