import type { ReactNode } from "react";
import { Thermometer, Sun, CloudRain, Wind, Droplets, Cloud, Calendar, Clock } from "lucide-react";

type WeatherItem = {
  icon: ReactNode;
  label: string;
  value: string;
};

type Appointment = {
  time: string;
  title: string;
};

const weatherItems: WeatherItem[] = [
  { icon: <Thermometer />, label: "Temperature", value: "57°F" },
  { icon: <Sun />, label: "Sun", value: "Partly cloudy" },
  { icon: <CloudRain />, label: "Rain", value: "20% chance" },
  { icon: <Wind />, label: "Wind", value: "15 km/h WSW" },
  { icon: <Droplets />, label: "Humidity", value: "78%" }
];

const todayAppointments: Appointment[] = [
  { time: "09:00 AM", title: "Team standup" },
  { time: "12:30 PM", title: "Lunch with Alex" },
  { time: "03:00 PM", title: "Dentist appointment" }
];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + "th";
  return n + (s[v % 10] ?? "th");
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

        <Section icon={<Calendar />} title="Sunday, March 1st">
          <ul className="list today-list">
          {todayAppointments.map((appointment) => (
            <li key={appointment.time} className="list-item">
              <span className="item-left">
                <span className="emoji" aria-hidden="true">
                  <Clock />
                </span>
                <span className="item-label">{appointment.time}</span>
              </span>
              <span className="item-value">{appointment.title}</span>
            </li>
          ))}
          </ul>
        </Section>
      </div>

      <header className="status-bar">
        <p className="status-time">Last update: &nbsp;<strong>{formatRenderTime()}</strong></p>
        <p className="status-icons" aria-label="Info"></p>
      </header>
    </main>
  );
}
