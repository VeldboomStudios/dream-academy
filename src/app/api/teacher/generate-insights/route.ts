import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { generateClassInsights, findPeerMatches } from "@/lib/insights";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  // Verify teacher owns this class
  const klass = await db.class.findFirst({
    where: { id: classId, teachers: { some: { id: session.userId } } },
    include: { enrollments: true },
  });
  if (!klass) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  // Clear old insights for this class (last 24h auto-prune)
  await db.insight.deleteMany({
    where: { classId, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });

  let insightsCreated = 0;
  try {
    insightsCreated = await generateClassInsights(classId);
  } catch (e) {
    console.error("generateClassInsights failed:", e);
  }

  // Also refresh peer matches for all students
  let peerMatches = 0;
  for (const e of klass.enrollments) {
    peerMatches += await findPeerMatches(e.studentId, classId);
  }

  redirect(`/teacher?insights=${insightsCreated}&peers=${peerMatches}`);
}
