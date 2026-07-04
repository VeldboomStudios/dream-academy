// Isle of Eline — online lap-time leaderboard.
// Self-contained: own table, no auth coupling, no impact on Dream Academy routes.
// GET  /api/ioe/lap            -> top 20 best laps (one per player)
// POST /api/ioe/lap { player, lapMs, car, pp } -> stores the lap, returns the player's rank
import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let tableReady = false;

function db() {
  return neon(process.env.DATABASE_URL as string);
}

async function ensureTable(sql: ReturnType<typeof neon>) {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS ioe_laptimes (
      id serial PRIMARY KEY,
      player text NOT NULL,
      lap_ms integer NOT NULL,
      car text,
      pp real,
      created_at timestamptz DEFAULT now()
    )`;
  tableReady = true;
}

export async function GET() {
  try {
    const sql = db();
    await ensureTable(sql);
    const rows = await sql`
      SELECT DISTINCT ON (player) player, lap_ms, car, pp, created_at
      FROM ioe_laptimes
      ORDER BY player, lap_ms ASC`;
    const top = (rows as { player: string; lap_ms: number; car: string | null; pp: number | null }[])
      .sort((a, b) => a.lap_ms - b.lap_ms)
      .slice(0, 20);
    return NextResponse.json({ ok: true, top });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const player = String(body.player ?? "").trim().slice(0, 24);
    const lapMs = Math.round(Number(body.lapMs));
    const car = String(body.car ?? "").slice(0, 48);
    const pp = Number(body.pp) || 0;
    if (!player || !Number.isFinite(lapMs) || lapMs < 5000 || lapMs > 3600000) {
      return NextResponse.json({ ok: false, error: "invalid lap" }, { status: 400 });
    }
    const sql = db();
    await ensureTable(sql);
    await sql`INSERT INTO ioe_laptimes (player, lap_ms, car, pp) VALUES (${player}, ${lapMs}, ${car}, ${pp})`;
    const rankRows = await sql`
      SELECT count(*)::int AS ahead FROM (
        SELECT player, min(lap_ms) AS best FROM ioe_laptimes GROUP BY player
      ) b WHERE b.best < ${lapMs}`;
    const rank = ((rankRows as { ahead: number }[])[0]?.ahead ?? 0) + 1;
    return NextResponse.json({ ok: true, rank });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
