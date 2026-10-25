import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ensureAccountsSeeded,
  hashPassword,
  isExpired,
  makeSessionCookie,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/auth/login  { username, password }
// Returns { ok, user: { username, role, status, expiresAt? } }
export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const { username, password } = await req.json();
    const u = String(username || "").trim().toLowerCase();
    const p = String(password || "");
    if (!u || !p) {
      return NextResponse.json({ ok: false, error: "Username and password are required." }, { status: 400 });
    }

    const account = await db.account.findUnique({ where: { username: u } });
    if (!account || !verifyPassword(p, account.passwordHash)) {
      return NextResponse.json({ ok: false, error: "Invalid username or password." }, { status: 401 });
    }

    if (account.role === "guest") {
      if (account.status !== "unlocked") {
        return NextResponse.json(
          { ok: false, error: "Your account is locked. Contact the admin to unlock after payment.", code: "LOCKED" },
          { status: 403 }
        );
      }
      if (isExpired(account.expiresAt)) {
        return NextResponse.json(
          { ok: false, error: "Your password has expired (2-day limit). Contact the admin to renew.", code: "EXPIRED" },
          { status: 403 }
        );
      }
    }

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      makeSessionCookie({ username: account.username, role: account.role as "admin" | "guest", scope: "agileprojection-portal" })
    );

    return NextResponse.json(
      {
        ok: true,
        user: {
          username: account.username,
          role: account.role,
          status: account.status,
          fullName: account.fullName,
          expiresAt: account.expiresAt,
        },
      },
      { headers }
    );
  } catch (err) {
    console.error("[auth/login] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// GET /api/auth/login  → quick "are the seeded accounts ready" check
export async function GET() {
  await ensureAccountsSeeded();
  const count = await db.account.count();
  return NextResponse.json({ ok: true, accounts: count });
}
