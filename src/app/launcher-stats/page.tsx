import { db } from "@/lib/db";

// Internal launcher-telemetry dashboard. Server-rendered, no client JS.
// Guarded by LAUNCHER_STATS_KEY (?key=...) — data is anonymous usage events,
// but the funnel is nobody's business but ours.

export const dynamic = "force-dynamic";

const DAY = 24 * 3600 * 1000;

function fmtMs(ms: number) {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

function Bar({ value, max, label, count }: { value: number; max: number; label: string; count: string }) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
      <div style={{ width: 170, fontSize: 13, color: "#8a93a6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ flex: 1, background: "#1a1e28", borderRadius: 4, height: 18 }}>
        <div style={{ width: `${pct}%`, background: "#4c8dff", height: "100%", borderRadius: 4 }} />
      </div>
      <div style={{ width: 70, fontSize: 13, textAlign: "right" }}>{count}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#14171f", border: "1px solid #262b38", borderRadius: 12, padding: 20 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 15, color: "#eef1f6" }}>{title}</h2>
      {children}
    </section>
  );
}

export default async function LauncherStats({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  const expected = process.env.LAUNCHER_STATS_KEY;
  if (!expected || key !== expected) {
    return <main style={{ fontFamily: "system-ui", padding: 40, color: "#8a93a6", background: "#0d0f14", minHeight: "100vh" }}>Not found.</main>;
  }

  const since30 = new Date(Date.now() - 30 * DAY);
  const [
    totalEvents,
    installs,
    byEvent,
    byCountry,
    recentEvents,
    feedback,
    gameEvents,
    sessions,
  ] = await Promise.all([
    db.launcherEvent.count(),
    db.launcherEvent.findMany({ distinct: ["installId"], select: { installId: true } }),
    db.launcherEvent.groupBy({ by: ["event"], _count: true }),
    db.launcherEvent.groupBy({ by: ["country"], _count: true, orderBy: { _count: { country: "desc" } } }),
    db.launcherEvent.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    db.launcherFeedback.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.launcherEvent.groupBy({
      by: ["gameId", "event"],
      _count: true,
      where: { gameId: { not: null }, event: { in: ["install_started", "install_completed", "install_failed", "game_launched", "dlc_downloaded"] } },
    }),
    db.launcherEvent.findMany({ where: { event: "game_closed", sessionMs: { not: null } }, select: { gameId: true, sessionMs: true } }),
  ]);

  // Daily active installs, last 30 days.
  const recent30 = await db.launcherEvent.findMany({
    where: { createdAt: { gte: since30 } },
    select: { installId: true, createdAt: true },
  });
  const daily = new Map<string, Set<string>>();
  for (const e of recent30) {
    const d = e.createdAt.toISOString().slice(0, 10);
    if (!daily.has(d)) daily.set(d, new Set());
    daily.get(d)!.add(e.installId);
  }
  const days: { day: string; n: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY).toISOString().slice(0, 10);
    days.push({ day: d, n: daily.get(d)?.size ?? 0 });
  }
  const maxDaily = Math.max(1, ...days.map((d) => d.n));

  // Per-game funnel table.
  const games = new Map<string, Record<string, number>>();
  for (const g of gameEvents) {
    const id = g.gameId!;
    if (!games.has(id)) games.set(id, {});
    games.get(id)![g.event] = g._count;
  }
  const playtime = new Map<string, { total: number; n: number }>();
  for (const s of sessions) {
    const id = s.gameId ?? "?";
    const p = playtime.get(id) ?? { total: 0, n: 0 };
    p.total += s.sessionMs!;
    p.n += 1;
    playtime.set(id, p);
  }

  const maxEvent = Math.max(1, ...byEvent.map((e) => e._count));
  const maxCountry = Math.max(1, ...byCountry.map((c) => c._count));

  return (
    <main style={{ fontFamily: "system-ui", background: "#0d0f14", color: "#eef1f6", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Veldboom Launcher — usage</h1>
          <span style={{ color: "#8a93a6", fontSize: 13 }}>
            {installs.length} opted-in install{installs.length === 1 ? "" : "s"} · {totalEvents} events · anonymous IDs only
          </span>
        </header>

        <Card title="Active installs per day (last 30 days)">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90 }}>
            {days.map((d) => (
              <div key={d.day} title={`${d.day}: ${d.n}`} style={{ flex: 1, background: d.n ? "#4c8dff" : "#1a1e28", height: `${Math.max(4, (d.n / maxDaily) * 100)}%`, borderRadius: 2 }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#8a93a6", fontSize: 11, marginTop: 4 }}>
            <span>{days[0].day}</span>
            <span>{days[days.length - 1].day}</span>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card title="Events by type">
            {byEvent
              .sort((a, b) => b._count - a._count)
              .map((e) => (
                <Bar key={e.event} value={e._count} max={maxEvent} label={e.event} count={String(e._count)} />
              ))}
            {byEvent.length === 0 && <p style={{ color: "#8a93a6", fontSize: 13 }}>No events yet — waiting for v1.8.0 users to opt in.</p>}
          </Card>
          <Card title="Countries">
            {byCountry.slice(0, 12).map((c) => (
              <Bar key={c.country ?? "?"} value={c._count} max={maxCountry} label={c.country ?? "unknown"} count={String(c._count)} />
            ))}
            {byCountry.length === 0 && <p style={{ color: "#8a93a6", fontSize: 13 }}>No data yet.</p>}
          </Card>
        </div>

        <Card title="Per game">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "#8a93a6", textAlign: "left" }}>
                <th style={{ padding: "6px 8px" }}>Game</th>
                <th style={{ padding: "6px 8px" }}>Installs started</th>
                <th style={{ padding: "6px 8px" }}>Completed</th>
                <th style={{ padding: "6px 8px" }}>Failed</th>
                <th style={{ padding: "6px 8px" }}>Launches</th>
                <th style={{ padding: "6px 8px" }}>Sessions</th>
                <th style={{ padding: "6px 8px" }}>Total playtime</th>
                <th style={{ padding: "6px 8px" }}>Avg session</th>
              </tr>
            </thead>
            <tbody>
              {[...games.entries()].map(([id, ev]) => {
                const p = playtime.get(id);
                return (
                  <tr key={id} style={{ borderTop: "1px solid #262b38" }}>
                    <td style={{ padding: "6px 8px" }}>{id}</td>
                    <td style={{ padding: "6px 8px" }}>{ev.install_started ?? 0}</td>
                    <td style={{ padding: "6px 8px", color: "#2ecc71" }}>{ev.install_completed ?? 0}</td>
                    <td style={{ padding: "6px 8px", color: ev.install_failed ? "#ff6b6b" : undefined }}>{ev.install_failed ?? 0}</td>
                    <td style={{ padding: "6px 8px" }}>{ev.game_launched ?? 0}</td>
                    <td style={{ padding: "6px 8px" }}>{p?.n ?? 0}</td>
                    <td style={{ padding: "6px 8px" }}>{p ? fmtMs(p.total) : "—"}</td>
                    <td style={{ padding: "6px 8px" }}>{p && p.n ? fmtMs(p.total / p.n) : "—"}</td>
                  </tr>
                );
              })}
              {games.size === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "10px 8px", color: "#8a93a6" }}>No game events yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card title={`Feedback (${feedback.length} latest)`}>
          {feedback.map((f) => (
            <div key={f.id} style={{ borderTop: "1px solid #262b38", padding: "10px 0" }}>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>{f.message}</div>
              <div style={{ color: "#8a93a6", fontSize: 12, marginTop: 4 }}>
                {f.createdAt.toISOString().slice(0, 16).replace("T", " ")} · {f.country ?? "??"} · v{f.version ?? "?"}
                {f.contact ? ` · ${f.contact}` : " · anonymous"}
              </div>
            </div>
          ))}
          {feedback.length === 0 && <p style={{ color: "#8a93a6", fontSize: 13 }}>Nothing yet.</p>}
        </Card>

        <Card title="Latest events">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              {recentEvents.map((e) => (
                <tr key={e.id} style={{ borderTop: "1px solid #262b38", color: "#8a93a6" }}>
                  <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{e.createdAt.toISOString().slice(5, 16).replace("T", " ")}</td>
                  <td style={{ padding: "4px 8px", color: "#eef1f6" }}>{e.event}</td>
                  <td style={{ padding: "4px 8px" }}>{e.gameId ?? ""}</td>
                  <td style={{ padding: "4px 8px" }}>{e.gameVersion ?? ""}</td>
                  <td style={{ padding: "4px 8px" }}>{e.sessionMs ? fmtMs(e.sessionMs) : ""}</td>
                  <td style={{ padding: "4px 8px" }}>{e.country ?? ""}</td>
                  <td style={{ padding: "4px 8px" }}>{e.installId.slice(0, 8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </main>
  );
}
