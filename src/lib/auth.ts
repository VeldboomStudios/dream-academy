// Simple JWT-based session auth using jose
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");
const COOKIE = "dream_session";

export interface SessionData {
  userId: string;
  role: string;
  institutionId: string;
}

export async function createSession(data: SessionData) {
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getSession(): Promise<SessionData | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function authenticate(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
  return user;
}
