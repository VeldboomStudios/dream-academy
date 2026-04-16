import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await db.checkin.create({
    data: {
      studentId: session.userId,
      mood: body.mood,
      progressSelf: body.progressSelf,
      blocker: body.blocker,
      needsHelp: body.needsHelp,
      note: body.note,
    },
  });

  await db.user.update({
    where: { id: session.userId },
    data: { lastSeenAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
