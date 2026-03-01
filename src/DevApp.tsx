import type { ReactNode } from 'react';
import { CalendarDays, Shapes, UtensilsCrossed } from 'lucide-react';
import { HINT_ICONS } from './lib/activityHintIcon';
import { FOOD_HINT_ICONS } from './lib/foodHintIcon';

const WEEKEND_LABELS = ['This weekend', 'Tomorrow', 'Next weekend'] as const;

const activityEntries = Object.entries(HINT_ICONS).sort(([a], [b]) => a.localeCompare(b));
const foodEntries = Object.entries(FOOD_HINT_ICONS).sort(([a], [b]) => a.localeCompare(b));

type SectionProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
};

function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="section dev-section">
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

export default function DevApp() {
  return (
    <main className="frame">
      <div className="frame-content dev-frame-content">
        <Section title={`Weekend labels (${WEEKEND_LABELS.length})`} icon={<CalendarDays />}>
          <ul className="list">
            {WEEKEND_LABELS.map((label) => (
              <li key={label} className="list-item dev-list-item">
                <span className="item-left">
                  <span className="emoji" aria-hidden="true">
                    <CalendarDays />
                  </span>
                  <span className="item-label">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={`Activity hints (${activityEntries.length})`} icon={<Shapes />}>
          <ul className="list">
            {activityEntries.map(([label, Icon]) => (
              <li key={label} className="list-item dev-list-item">
                <span className="item-left">
                  <span className="emoji" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="item-label">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={`Food hints (${foodEntries.length})`} icon={<UtensilsCrossed />}>
          <ul className="list">
            {foodEntries.map(([label, Icon]) => (
              <li key={label} className="list-item dev-list-item">
                <span className="item-left">
                  <span className="emoji" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="item-label">{label}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </main>
  );
}
