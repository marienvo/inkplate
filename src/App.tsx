import type { ReactNode } from "react";

type WeatherItem = {
  icon: string;
  label: string;
  value: string;
};

type Appointment = {
  time: string;
  title: string;
};

const weatherItems: WeatherItem[] = [
  { icon: "🌡️", label: "Temperature", value: "57°F" },
  { icon: "☀️", label: "Sun", value: "Partly cloudy" },
  { icon: "🌧️", label: "Rain", value: "20% chance" },
  { icon: "💨", label: "Wind", value: "15 km/h WSW" },
  { icon: "💧", label: "Humidity", value: "78%" }
];

const todayAppointments: Appointment[] = [
  { time: "09:00 AM", title: "Team standup" },
  { time: "12:30 PM", title: "Lunch with Alex" },
  { time: "03:00 PM", title: "Dentist appointment" }
];

function formatRenderTime(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

type SectionProps = {
  icon: string;
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
        <Section icon="☁️" title="Weather - Rotterdam">
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

        <Section icon="📅" title="Today">
          <ul className="list today-list">
          {todayAppointments.map((appointment) => (
            <li key={appointment.time} className="list-item">
              <span className="item-left">
                <span className="emoji" aria-hidden="true">
                  🕒
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
        <p className="status-time">Last updated: {formatRenderTime()}</p>
        <p className="status-icons" aria-label="Info"></p>
      </header>
    </main>
  );
}
