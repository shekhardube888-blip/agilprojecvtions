import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, readSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/admin/user/history?accountId=xxx
// Returns the full admin-action audit trail for a student account:
// every reset-password, lock, unlock, set-expiry, renew action with the
// admin who did it, the reason, the resulting expiry, and when.
//
// Admin-only.
export async function GET(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }

    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId") || "";
    if (!accountId) {
      return NextResponse.json({ ok: false, error: "accountId is required." }, { status: 400 });
    }

    const account = await db.account.findUnique({
      where: { id: accountId },
      select: { id: true, username: true, fullName: true, role: true, status: true, expiresAt: true, note: true },
    });
    if (!account) {
      return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
    }

    const logs = await db.unlockLog.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        adminUser: true,
        action: true,
        reason: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      account,
      history: logs.map((l) => ({
        id: l.id,
        adminUser: l.adminUser,
        action: l.action,
        reason: l.reason,
        expiresAt: l.expiresAt,
        createdAt: l.createdAt,
      })),
    });
  } catch (err) {
    console.error("[admin/user/history] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load history." }, { status: 500 });
  }
}
