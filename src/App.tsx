import { useRef, type CSSProperties, type ReactNode } from 'react';
import {
  Thermometer,
  CloudRain,
  MousePointer2,
  Cloud,
  Calendar,
  UtensilsCrossed,
  CalendarDays,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  Clock5,
  Clock6,
  Clock7,
  Clock8,
  Clock9,
  Clock10,
  Clock11,
  Clock12,
  AlertTriangle,
  Smile,
  Wind,
} from 'lucide-react';
import calendarData from './data/calendar.json';
import weatherData from './data/weather.json';
import { useSmartAgendaLimit } from './hooks/useSmartAgendaLimit';
import type { OutdoorFeel } from './lib/outdoorFeel';
import { renderActivityHint } from './lib/activityHintIcon';
import { renderFoodHint } from './lib/foodHintIcon';
import { selectAgendaView, type Appointment } from './lib/agenda';

type WeatherItem = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

type WeatherData = {
  temp: number;
  feelsLike: number;
  summary: string;
  humidity: number;
  windDirection: string;
  windDirectionDegrees: number;
  windBft: number;
  rainChance: number;
  forecast: string;
  outdoorFeel?: OutdoorFeel;
  weekend?: {
    label: 'This weekend' | 'Tomorrow' | 'Next weekend';
    value: string;
  };
  food?: {
    savory: string;
    sweet: string;
  };
  // Keep backward compatibility with older generated weather.json files.
  foodHint?: string;
};

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + 'th';
  return n + (s[v % 10] ?? 'th');
}

function formatDateForTitle(d: Date): string {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
  return `${weekday}, ${month} ${ordinal(d.getDate())}`;
}

function formatRenderTime(): string {
  const d = new Date();
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(d);
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
  return `${weekday}, ${month} ${ordinal(d.getDate())}, ${year}; ${time}`;
}

function formatAppointmentTime(startTime: string): string {
  const [hoursPart, minutesPart] = startTime.split(':');
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return startTime;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

function getAppointmentClockIcon(startTime: string): ReactNode {
  const [hoursPart, minutesPart] = startTime.split(':');
  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return <Clock12 />;
  }

  const roundedHour24 = (hours + (minutes >= 30 ? 1 : 0)) % 24;
  const hourOn12 = (roundedHour24 % 12 || 12) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  const CLOCK_ICONS = {
    1: Clock1,
    2: Clock2,
    3: Clock3,
    4: Clock4,
    5: Clock5,
    6: Clock6,
    7: Clock7,
    8: Clock8,
    9: Clock9,
    10: Clock10,
    11: Clock11,
    12: Clock12,
  } as const;

  const Icon = CLOCK_ICONS[hourOn12];
  return <Icon />;
}

type SectionProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

function Section({ icon, title, children }: SectionProps) {
  return (
    <section className="section">
      <h2 className="section-header">
        <span className="emoji" aria-hidden="true">
          {icon}
        </span>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

export default function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const weather = weatherData as WeatherData;
  const outdoorFeel = weather.outdoorFeel;
  const hasOutdoorFeel = Boolean(outdoorFeel);
  const now = new Date();
  const todayTitle = formatDateForTitle(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowTitle = formatDateForTitle(tomorrowDate);
  const maxVisibleAppointments = useSmartAgendaLimit(contentRef, 3, 2);
  const { showTomorrow, visibleAppointments, hiddenAppointmentsCount } = selectAgendaView(
    calendarData as Appointment[],
    now,
    maxVisibleAppointments,
  );
  const calendarTitle = showTomorrow ? `Tomorrow — ${tomorrowTitle}` : `Today — ${todayTitle}`;
  const windDirectionStyle = {
    '--wind-rotation': `${
      weather.windDirectionDegrees +
      90 + // meteorological → CSS
      45 // icon offset
    }deg`,
  } as CSSProperties;
  const warningParts: string[] = [];
  if (outdoorFeel) {
    if (outdoorFeel.details.condensationRisk !== 'Low') {
      warningParts.push(`${outdoorFeel.details.condensationRisk} condensation risk`);
    }
    if (outdoorFeel.details.frostOrSlipHint !== 'None') {
      warningParts.push(
        outdoorFeel.details.frostOrSlipHint === 'Likely'
          ? 'Slip risk likely'
          : 'Slip risk possible',
      );
    }
  }

  const weatherItems: WeatherItem[] = [
    {
      icon: <Thermometer />,
      label: 'Temperature',
      value: `${Math.round(weather.temp)}°C (feels like ${Math.round(outdoorFeel?.feelsLikeC ?? weather.feelsLike)}°C)`,
    },
    { icon: <CloudRain />, label: 'Rain', value: `${Math.round(weather.rainChance)}% chance` },
    {
      icon: <Wind />,
      label: 'Wind',
      value: (
        <>
          <MousePointer2 className="wind-direction-icon" style={windDirectionStyle} />{' '}
          {Math.round(weather.windBft)} bft
        </>
      ),
    },
  ];

  if (hasOutdoorFeel && outdoorFeel) {
    // weatherItems.push({ icon: <Eye />, label: "Visibility", value: outdoorFeel.details.visibilityFeel });
    weatherItems.push({ icon: <Smile />, label: 'Feel', value: outdoorFeel.feelText });
  }

  if (weather.weekend) {
    weatherItems.push({
      icon: <CalendarDays />,
      label: weather.weekend.label,
      value: renderActivityHint(weather.weekend.value),
    });
  }

  if (warningParts.length > 0) {
    weatherItems.push({
      icon: <AlertTriangle />,
      label: 'Warnings',
      value: warningParts.join(' · '),
    });
  }
  const foodEntries = weather.food
    ? [weather.food.savory, weather.food.sweet]
    : weather.foodHint
      ? [weather.foodHint]
      : [];
  const foodItems = foodEntries.filter(Boolean).map((entry) => renderFoodHint(entry));

  return (
    <main className="frame">
      <div className="frame-content" ref={contentRef}>
        <Section icon={<Cloud />} title="Weather — Rotterdam">
          <ul className="list weather-list">
            {weatherItems.map((item) => (
              <li key={item.label} className="list-item">
                <span className="item-left">
                  <span className="emoji" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="item-label">{item.label}</span>
                </span>
                <span className="item-value">{item.value}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<Calendar />} title={calendarTitle}>
          {visibleAppointments.length === 0 ? (
            <p className="empty-state">{showTomorrow ? 'No events tomorrow' : 'No events today'}</p>
          ) : (
            <ul className="list today-list">
              {visibleAppointments.map((appointment) => (
                <li
                  key={`${appointment.date}-${appointment.startTime}-${appointment.title}`}
                  className="list-item"
                >
                  <span className="item-left">
                    <span className="emoji" aria-hidden="true">
                      {getAppointmentClockIcon(appointment.startTime)}
                    </span>
                    <span className="item-label">
                      {formatAppointmentTime(appointment.startTime)}
                    </span>
                  </span>
                  <span className="item-value">{appointment.title}</span>
                </li>
              ))}
            </ul>
          )}
          {hiddenAppointmentsCount > 0 && (
            <p className="more-indicator">{hiddenAppointmentsCount} more</p>
          )}
        </Section>

        <Section icon={<UtensilsCrossed />} title="Food">
          {foodItems.length > 0 ? (
            <ul className="list food-list">
              {foodItems.map((foodItem, index) => (
                <li key={`${foodItem.label}-${foodItem.value}-${index}`} className="list-item">
                  <span className="item-left">
                    <span className="emoji" aria-hidden="true">
                      {foodItem.icon}
                    </span>
                    <span className="item-label">{foodItem.label}</span>
                  </span>
                  <span className="item-value">{foodItem.value}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">No meals planned</p>
          )}
        </Section>
      </div>

      <header className="status-bar">
        <p className="status-time">
          Last update: &nbsp;<strong>{formatRenderTime()}</strong>
        </p>
        <p className="status-icons" aria-label="Info"></p>
      </header>
    </main>
  );
}
