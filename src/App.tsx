import type { ReactNode } from "react";
import {
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Cloud,
  Calendar,
  Clock,
  Eye,
  AlertTriangle,
  Smile
} from "lucide-react";
import calendarData from "./data/calendar.json";
import weatherData from "./data/weather.json";
import type { OutdoorFeel } from "./lib/outdoor-feel";

type WeatherItem = {
  icon: ReactNode;
  label: string;
  value: string;
};

type Appointment = {
  date: string;
  startTime: string;
  title: string;
};

type WeatherData = {
  temp: number;
  feelsLike: number;
  summary: string;
  humidity: number;
  windDirection: string;
  windBft: number;
  rainChance: number;
  forecast: string;
  outdoorFeel?: OutdoorFeel;
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + "th";
  return n + (s[v % 10] ?? "th");
}

function formatDateForTitle(d: Date): string {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(d);
  return `${weekday}, ${month} ${ordinal(d.getDate())}`;
}

function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRenderTime(): string {
  const d = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(d);
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(d);
  const year = new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
  return `${weekday}, ${month} ${ordinal(d.getDate())}, ${year}; ${time}`;
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
  const weather = weatherData as WeatherData;
  const outdoorFeel = weather.outdoorFeel;
  const hasOutdoorFeel = Boolean(outdoorFeel);
  const now = new Date();
  const todayIsoDate = formatIsoDate(now);
  const todayTitle = formatDateForTitle(now);
  const todayAppointments = (calendarData as Appointment[])
    .filter((appointment) => appointment.date === todayIsoDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const visibleAppointments = todayAppointments.slice(0, 5);
  const hiddenAppointmentsCount = todayAppointments.length - visibleAppointments.length;
  const warningParts: string[] = [];
  if (outdoorFeel) {
    if (outdoorFeel.details.condensationRisk !== "Low") {
      warningParts.push(`${outdoorFeel.details.condensationRisk} condensation risk`);
    }
    if (outdoorFeel.details.frostOrSlipHint !== "None") {
      warningParts.push(
        outdoorFeel.details.frostOrSlipHint === "Likely" ? "Slip risk likely" : "Slip risk possible"
      );
    }
  }

  const weatherItems: WeatherItem[] = [
    {
      icon: <Thermometer />,
      label: "Temperature",
      value: `${Math.round(weather.temp)}°C (feels like ${Math.round(outdoorFeel?.feelsLikeC ?? weather.feelsLike)}°C)`
    },
    { icon: <Cloud />, label: "Condition", value: weather.summary },
    { icon: <CloudRain />, label: "Rain", value: `${Math.round(weather.rainChance)}% chance` },
    { icon: <Wind />, label: "Wind", value: `${Math.round(weather.windBft)} bft ${weather.windDirection}` },
  ];

  if (hasOutdoorFeel && outdoorFeel) {
    weatherItems.push({ icon: <Eye />, label: "Visibility", value: outdoorFeel.details.visibilityFeel });
    weatherItems.push({ icon: <Smile />, label: "Feel", value: outdoorFeel.feelText });
  }

  if (warningParts.length > 0) {
    weatherItems.push({
      icon: <AlertTriangle />,
      label: "Warnings",
      value: warningParts.join(" · ")
    });
  }

  return (
    <main className="frame">
      <div className="frame-content">
        <Section icon={<Cloud />} title="Weather - Rotterdam">
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

        <Section icon={<Calendar />} title={todayTitle}>
          {visibleAppointments.length === 0 ? (
            <p className="empty-state">No events today</p>
          ) : (
            <ul className="list today-list">
              {visibleAppointments.map((appointment) => (
                <li
                  key={`${appointment.date}-${appointment.startTime}-${appointment.title}`}
                  className="list-item"
                >
                  <span className="item-left">
                    <span className="emoji" aria-hidden="true">
                      <Clock />
                    </span>
                    <span className="item-label">{appointment.startTime}</span>
                  </span>
                  <span className="item-value">{appointment.title}</span>
                </li>
              ))}
            </ul>
          )}
          {hiddenAppointmentsCount > 0 && <p className="more-indicator">{hiddenAppointmentsCount} more</p>}
        </Section>
      </div>

      <header className="status-bar">
        <p className="status-time">Last update: &nbsp;<strong>{formatRenderTime()}</strong></p>
        <p className="status-icons" aria-label="Info"></p>
      </header>
    </main>
  );
}
