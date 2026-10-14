import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/admin/submissions
// Admin-only. Returns all submissions (optionally filtered by status) for
// mentor review. Sorted by submittedAt desc (most recent first).

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status"); // "submitted" | "approved" | "rejected" | "all"
    const where = statusFilter && statusFilter !== "all" ? { status: statusFilter } : {};

    const submissions = await db.submission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: 100,
      select: {
        id: true,
        studentEmail: true,
        studentName: true,
        stage: true,
        project: true,
        content: true,
        status: true,
        mentorFeedback: true,
        reviewedBy: true,
        submittedAt: true,
        reviewedAt: true,
      },
    });

    const stats = {
      total: await db.submission.count(),
      submitted: await db.submission.count({ where: { status: "submitted" } }),
      approved: await db.submission.count({ where: { status: "approved" } }),
      rejected: await db.submission.count({ where: { status: "rejected" } }),
    };

    return NextResponse.json({ ok: true, submissions, stats });
  } catch (err) {
    console.error("[admin/submissions] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load submissions." }, { status: 500 });
  }
}
