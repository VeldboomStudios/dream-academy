import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const match = await db.peerSuggestion.findUnique({ where: { id } });
  if (!match || match.fromStudentId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.peerSuggestion.update({
    where: { id },
    data: { status: "CONTACTED" },
  });

  redirect("/student?contacted=true");
}
