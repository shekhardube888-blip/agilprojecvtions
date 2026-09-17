import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/admin/registrations  → summary for staff dashboard
export async function GET() {
  try {
    const total = await db.student.count();
    const byDegree = await db.student.groupBy({
      by: ["degree"],
      _count: { degree: true },
      orderBy: { _count: { degree: "desc" } },
    });
    const byCategory = await db.student.groupBy({
      by: ["categoryLabel"],
      _count: { categoryLabel: true },
      orderBy: { _count: { categoryLabel: "desc" } },
    });
    const recent = await db.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, firstName: true, lastName: true, email: true, mobile: true,
        degree: true, branch: true, college: true, project: true, categoryLabel: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, total, byDegree, byCategory, recent });
  } catch (err) {
    console.error("[admin/registrations] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
