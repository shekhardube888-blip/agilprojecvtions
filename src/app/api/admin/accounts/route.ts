import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, isExpired, readSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/admin/accounts — admin-only: list all accounts with status/expiry.
export async function GET(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const accounts = await db.account.findMany({
      orderBy: [{ role: "asc" }, { username: "asc" }],
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        fullName: true,
        note: true,
        passwordSetAt: true,
        expiresAt: true,
        createdAt: true,
        assignedProjectId: true,
      },
    });

    // Look up titles for any assigned projects (one round-trip)
    const assignedIds = accounts
      .map((a) => a.assignedProjectId)
      .filter((id): id is string => Boolean(id));
    const projects = assignedIds.length
      ? await db.projectLibraryItem.findMany({
          where: { id: { in: assignedIds } },
          select: { id: true, title: true },
        })
      : [];
    const projectMap = new Map(projects.map((p) => [p.id, p.title]));

    const out = accounts.map((a) => ({
      ...a,
      assignedProjectTitle: a.assignedProjectId ? projectMap.get(a.assignedProjectId) || null : null,
      expired: a.role === "guest" ? isExpired(a.expiresAt) : false,
    }));
    return NextResponse.json({ ok: true, accounts: out });
  } catch (err) {
    console.error("[admin/accounts] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
