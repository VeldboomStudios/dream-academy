// Veldboom Launcher DLC fulfillment.
// Stripe payment link -> checkout.session.completed webhook -> invite the buyer's GitHub
// account to the DLC's private repo. The launcher auto-accepts the invite, unlocking the DLC.
//
// Setup (Vercel env):
//   STRIPE_WEBHOOK_SECRET  - from the Stripe webhook endpoint config
//   GITHUB_INVITE_TOKEN    - fine-grained PAT with admin (collaborators) access to the DLC repos
// Stripe payment link setup per DLC:
//   - metadata key "repo" = "VeldboomStudios/<dlc-repo>"
//   - the launcher appends ?client_reference_id=<github login> to the link automatically
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function verifyStripeSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string])
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  // Reject events older than 5 minutes (replay protection).
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const ghToken = process.env.GITHUB_INVITE_TOKEN;
  if (!secret || !ghToken) {
    return NextResponse.json({ ok: false, error: "webhook not configured" }, { status: 500 });
  }

  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ ok: false, error: "bad signature" }, { status: 400 });
  }

  const event = JSON.parse(payload);
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true, skipped: event.type });
  }

  const session = event.data?.object ?? {};
  const login = String(session.client_reference_id ?? "").trim();
  const repo = String(session.metadata?.repo ?? "").trim();
  if (!login || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(login)) {
    return NextResponse.json({ ok: false, error: "missing/invalid github login" }, { status: 400 });
  }
  if (!/^VeldboomStudios\/[A-Za-z0-9._-]+$/.test(repo)) {
    return NextResponse.json({ ok: false, error: "missing/invalid repo metadata" }, { status: 400 });
  }

  // Invite the buyer as a read-only collaborator on the DLC repo.
  const res = await fetch(`https://api.github.com/repos/${repo}/collaborators/${login}`, {
    method: "PUT",
    headers: {
      "User-Agent": "VeldboomDlcFulfillment",
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${ghToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ permission: "pull" }),
  });

  // 201 = invited, 204 = already a collaborator. Anything else = fulfillment failure.
  if (res.status !== 201 && res.status !== 204) {
    const detail = await res.text();
    console.error(`DLC fulfillment failed: ${repo} <- ${login}: HTTP ${res.status} ${detail}`);
    return NextResponse.json({ ok: false, error: `github invite failed (${res.status})` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, invited: login, repo });
}
