import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Consent-gated anonymous usage events from the Veldboom Launcher (v1.8.0+).
// The launcher only calls this after the user opts in. No auth: the payload
// carries no identity beyond a random install UUID, and every field is
// validated against a whitelist before insert.

const EVENTS = new Set([
  "launcher_started",
  "install_started",
  "install_completed",
  "install_failed",
  "game_launched",
  "game_closed",
  "dlc_downloaded",
  "file_downloaded",
]);

const MAX_BATCH = 50;
const str = (v: unknown, max: number) =>
  typeof v === "string" && v.length > 0 ? v.slice(0, max) : null;

export async function POST(req: Request) {
  let body: {
    installId?: unknown;
    events?: { event?: unknown; gameId?: unknown; gameVersion?: unknown; sessionMs?: unknown; meta?: unknown }[];
    version?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const installId = str(body.installId, 64);
  if (!installId || !Array.isArray(body.events) || body.events.length === 0) {
    return NextResponse.json({ error: "installId and events[] required" }, { status: 400 });
  }

  const version = str(body.version, 32);
  const country = req.headers.get("x-vercel-ip-country")?.slice(0, 8) ?? null;

  const rows = body.events
    .slice(0, MAX_BATCH)
    .filter((e) => typeof e?.event === "string" && EVENTS.has(e.event))
    .map((e) => ({
      installId,
      event: e.event as string,
      gameId: str(e.gameId, 64),
      version,
      gameVersion: str(e.gameVersion, 32),
      sessionMs:
        typeof e.sessionMs === "number" && isFinite(e.sessionMs)
          ? Math.max(0, Math.min(Math.round(e.sessionMs), 7 * 24 * 3600 * 1000))
          : null,
      country,
      meta: undefined,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid events" }, { status: 400 });
  }

  await db.launcherEvent.createMany({ data: rows });
  return NextResponse.json({ ok: true, stored: rows.length });
}
