function formatNow(): string {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

export default function App() {
  return (
    <main className="frame">
      <header className="header">
        <h1>Hello World</h1>
        <p>Inkplate Route 1 dashboard</p>
      </header>

      <section className="grid">
        <article className="card">
          <h2>Tijdstip render</h2>
          <p>{formatNow()}</p>
        </article>
        <article className="card">
          <h2>Status</h2>
          <p>Klaar voor device upload</p>
        </article>
        <article className="card">
          <h2>Resolutie</h2>
          <p>720 x 1280</p>
        </article>
        <article className="card">
          <h2>Update interval</h2>
          <p>Elke paar uur via deep sleep</p>
        </article>
      </section>
    </main>
  );
}
