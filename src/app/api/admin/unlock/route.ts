import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, expiryAfterUnlock, isExpired, readSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/admin/unlock  { username, reason? }
// Admin-only. Sets the guest account to "unlocked" and resets the 2-day
// password expiry window. Used after the admin confirms payment from the guest.
export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const body = await req.json();
    const username = String(body.username || "").trim().toLowerCase();
    const reason = body.reason ? String(body.reason) : "Payment received — access renewed for 2 days";
    if (!username) {
      return NextResponse.json({ ok: false, error: "username is required" }, { status: 400 });
    }
    const account = await db.account.findUnique({ where: { username } });
    if (!account) {
      return NextResponse.json({ ok: false, error: "Account not found" }, { status: 404 });
    }
    if (account.role !== "guest") {
      return NextResponse.json({ ok: false, error: "Only guest accounts can be unlocked/renewed." }, { status: 400 });
    }

    const expiresAt = expiryAfterUnlock();
    const updated = await db.account.update({
      where: { id: account.id },
      data: {
        status: "unlocked",
        passwordSetAt: new Date(),
        expiresAt,
        note: reason,
      },
    });

    await db.unlockLog.create({
      data: {
        accountId: account.id,
        adminUser: session.username,
        reason,
        expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      account: {
        username: updated.username,
        role: updated.role,
        status: updated.status,
        expiresAt: updated.expiresAt,
        note: updated.note,
        expired: isExpired(updated.expiresAt),
      },
    });
  } catch (err) {
    console.error("[admin/unlock] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
