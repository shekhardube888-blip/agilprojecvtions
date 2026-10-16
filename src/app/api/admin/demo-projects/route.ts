import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/admin/demo-projects?status=pending
// Admin-only. Lists all demo project requests for mentor review.

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    const where = statusFilter && statusFilter !== "all" ? { status: statusFilter } : {};

    const requests = await db.demoProjectRequest.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      take: 100,
    });

    const stats = {
      total: await db.demoProjectRequest.count(),
      pending: await db.demoProjectRequest.count({ where: { status: "pending" } }),
      approved: await db.demoProjectRequest.count({ where: { status: "approved" } }),
      rejected: await db.demoProjectRequest.count({ where: { status: "rejected" } }),
    };

    return NextResponse.json({ ok: true, requests, stats });
  } catch (err) {
    console.error("[admin/demo-projects] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load requests." }, { status: 500 });
  }
}
