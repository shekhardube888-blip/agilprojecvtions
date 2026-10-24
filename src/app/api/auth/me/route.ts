import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, isExpired, readSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/auth/me — returns the currently logged-in user, with a live
// expiry check against the DB (so admin locks / expiries take effect immediately).
export async function GET(req: Request) {
  try {
    await ensureAccountsSeeded();
    const cookie = req.headers.get("cookie");
    const session = readSession(cookie);
    if (!session) return NextResponse.json({ ok: true, user: null });

    const account = await db.account.findUnique({ where: { username: session.username } });
    if (!account) return NextResponse.json({ ok: true, user: null });

    if (account.role === "guest") {
      if (account.status !== "unlocked") {
        return NextResponse.json({
          ok: true,
          user: {
            username: account.username,
            role: account.role,
            status: "locked",
            fullName: account.fullName,
            expiresAt: null,
            expired: true,
          },
        });
      }
      const expired = isExpired(account.expiresAt);
      return NextResponse.json({
        ok: true,
        user: {
          username: account.username,
          role: account.role,
          status: account.status,
          fullName: account.fullName,
          expiresAt: account.expiresAt,
          expired,
        },
      });
    }

    // admin
    return NextResponse.json({
      ok: true,
      user: {
        username: account.username,
        role: account.role,
        status: account.status,
        fullName: account.fullName,
        expiresAt: null,
        expired: false,
      },
    });
  } catch (err) {
    console.error("[auth/me] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
