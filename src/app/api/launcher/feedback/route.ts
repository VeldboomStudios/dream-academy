import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// User-initiated feedback from the Veldboom Launcher's feedback form.
// Stored in Postgres; also forwarded by email when RESEND_API_KEY is set,
// matching the website's download-notification pattern.

const str = (v: unknown, max: number) =>
  typeof v === "string" && v.trim().length > 0 ? v.trim().slice(0, max) : null;

export async function POST(req: Request) {
  let body: { installId?: unknown; message?: unknown; contact?: unknown; gameId?: unknown; version?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const message = str(body.message, 4000);
  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const row = await db.launcherFeedback.create({
    data: {
      installId: str(body.installId, 64),
      message,
      contact: str(body.contact, 200),
      gameId: str(body.gameId, 64),
      version: str(body.version, 32),
      country: req.headers.get("x-vercel-ip-country")?.slice(0, 8) ?? null,
    },
  });

  const key = process.env.RESEND_API_KEY;
  if (key) {
    // Best effort — feedback is already in the database.
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: "shaquilleveldboom@gmail.com",
          subject: `Launcher feedback (${row.country ?? "??"})`,
          text: `${message}\n\n— contact: ${row.contact ?? "none"} | launcher ${row.version ?? "?"} | game ${row.gameId ?? "-"} | ${row.id}`,
        }),
      });
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ ok: true });
}
