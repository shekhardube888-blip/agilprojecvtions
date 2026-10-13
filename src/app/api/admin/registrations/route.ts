import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/admin/registrations  → summary + recent list for the staff dashboard.
//
// Query params:
//   since = 24h | 7d | 30d | all   (default: all) — filters the recent list + the
//                                   per-degree/per-category breakdowns to registrations
//                                   added within the window, and returns `newSince`.
//   limit = <int>                   (default 50, max 500) — caps the recent list length.
//   format = csv                    → returns a CSV of the filtered registrations
//                                     (one row per student) instead of JSON.
//
// Returns JSON:
//   { ok, total, newToday, newSince, since, byDegree[], byCategory[], recent[] }
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const since = (url.searchParams.get("since") || "all") as "24h" | "7d" | "30d" | "all";
    const limitParam = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Math.min(Math.max(limitParam || 50, 1), 500);
    const format = url.searchParams.get("format");

    // Compute the "since" cutoff timestamp.
    const now = new Date();
    const sinceMs =
      since === "24h" ? 24 * 3600 * 1000 :
      since === "7d"  ? 7  * 24 * 3600 * 1000 :
      since === "30d" ? 30 * 24 * 3600 * 1000 :
      Number.POSITIVE_INFINITY;
    const cutoff = since === "all" ? null : new Date(now.getTime() - sinceMs);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const where = cutoff ? { createdAt: { gte: cutoff } } : {};

    const [total, newToday, newSince, byDegree, byCategory, recent] = await Promise.all([
      db.student.count(),
      db.student.count({ where: { createdAt: { gte: startOfToday } } }),
      db.student.count({ where }),
      db.student.groupBy({
        by: ["degree"],
        where,
        _count: { degree: true },
        orderBy: { _count: { degree: "desc" } },
      }),
      db.student.groupBy({
        by: ["categoryLabel"],
        where,
        _count: { categoryLabel: true },
        orderBy: { _count: { categoryLabel: "desc" } },
      }),
      db.student.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true, firstName: true, lastName: true, email: true, mobile: true,
          degree: true, branch: true, semester: true, plan: true,
          college: true, state: true, project: true, categoryLabel: true,
          category: true, projectId: true, consentWa: true, consentEm: true,
          emailSent: true, waSent: true, source: true, notes: true,
          paymentStatus: true, internshipStatus: true, currentStage: true,
          startedAt: true, completedAt: true,
          createdAt: true,
        },
      }),
    ]);

    // CSV export mode.
    if (format === "csv") {
      const header = [
        "createdAt", "firstName", "lastName", "email", "mobile",
        "degree", "branch", "semester", "plan", "college", "state",
        "category", "categoryLabel", "project", "projectId",
        "source", "notes", "consentWa", "consentEm", "emailSent", "waSent",
        "paymentStatus", "internshipStatus", "currentStage", "startedAt", "completedAt",
      ].join(",");
      const esc = (v: unknown) => {
        const s = v === null || v === undefined ? "" : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const rows = recent.map((r) =>
        [
          r.createdAt.toISOString(),
          r.firstName, r.lastName, r.email, r.mobile,
          r.degree, r.branch, r.semester, r.plan, r.college, r.state,
          r.category, r.categoryLabel, r.project, r.projectId ?? "",
          r.source ?? "", r.notes ?? "",
          r.consentWa, r.consentEm, r.emailSent, r.waSent,
          r.paymentStatus ?? "", r.internshipStatus ?? "", r.currentStage ?? "",
          r.startedAt?.toISOString() ?? "", r.completedAt?.toISOString() ?? "",
        ].map(esc).join(",")
      );
      const csv = [header, ...rows].join("\n");
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const fname = `agileprojection-registrations-${since}-${stamp}.csv`;
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fname}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      total,
      newToday,
      newSince,
      since,
      windowStart: cutoff ? cutoff.toISOString() : null,
      byDegree,
      byCategory,
      recent,
    });
  } catch (err) {
    console.error("[admin/registrations] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
