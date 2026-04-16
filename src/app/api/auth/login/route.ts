import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email en wachtwoord vereist" }, { status: 400 });
  }

  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 });
  }

  await createSession({
    userId: user.id,
    role: user.role,
    institutionId: user.institutionId,
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    role: user.role,
  });
}
