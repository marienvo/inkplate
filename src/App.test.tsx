import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';

type SettingsFixture = {
  challenges: Array<{
    start: string;
    end: string;
    label: string;
    value: string;
  }>;
};

async function renderAppWithSettings(settings: SettingsFixture): Promise<string> {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-03-15T10:00:00Z'));

  vi.doMock('./data/weather.json', () => ({
    default: {
      temp: 10,
      feelsLike: 8,
      summary: 'Light clouds',
      humidity: 70,
      windDirection: 'N',
      windDirectionDegrees: 0,
      windBft: 3,
      rainChance: 25,
      forecast: 'Dry',
      food: {
        savory: 'Pasta',
        sweet: 'Cake',
      },
    },
  }));
  vi.doMock('./data/calendar.json', () => ({ default: [] }));
  vi.doMock('./data/settings.json', () => ({ default: settings }));
  vi.doMock('./hooks/useSmartAgendaLimit', () => ({
    useSmartAgendaLimit: () => ({ maxEvents: 0, showSecondFoodLine: true }),
  }));
  vi.doMock('./lib/agenda', () => ({
    selectAgendaView: () => ({
      showTomorrow: false,
      visibleAppointments: [],
      hiddenAppointmentsCount: 0,
    }),
  }));

  const { default: App } = await import('./App');
  return renderToStaticMarkup(<App />);
}

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
  vi.clearAllMocks();
});

test('renders active challenge instead of the sweet second food line', async () => {
  const html = await renderAppWithSettings({
    challenges: [
      {
        start: '2026-03-01',
        end: '2026-03-31',
        label: 'March',
        value: 'No Sweets',
      },
    ],
  });

  expect(html).toContain('March');
  expect(html).toContain('No Sweets');
  expect(html).not.toContain('Cake');
});

test('keeps the sweet second food line when challenge is missing', async () => {
  const html = await renderAppWithSettings({ challenges: [] });

  expect(html).toContain('Cake');
  expect(html).not.toContain('No Sweets');
});
