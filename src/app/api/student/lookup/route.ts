import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/student/lookup?email=&mobile=
// Public. A student looks up their internship tracker by email + mobile
// (the same contact they used on the registration form).
// Cross-DB safe: SQLite doesn't support Prisma's `mode: "insensitive"`,
// so we fetch a broad candidate set and filter case-insensitively in JS.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = (url.searchParams.get("email") || "").trim().toLowerCase();
    const mobile = (url.searchParams.get("mobile") || "").trim();
    if (!email || !mobile) {
      return NextResponse.json({ ok: false, error: "Email and mobile are required." }, { status: 400 });
    }
    const mobileNorm = mobile.replace(/[\s+]/g, "").replace(/^91/, "");
    const emailLower = email.toLowerCase();
    const candidates = await db.student.findMany({
      where: { email: { startsWith: email.split("@")[0].slice(0, 3) } },
      take: 100,
    });
    let pool = candidates;
    if (!candidates.some((s) => s.email.toLowerCase() === emailLower)) {
      pool = await db.student.findMany({ take: 500 });
    }
    const student = pool.find(
      (s) =>
        s.email.toLowerCase() === emailLower &&
        s.mobile.replace(/[\s+]/g, "").replace(/^91/, "") === mobileNorm
    ) || null;
    if (!student) {
      return NextResponse.json({ ok: false, error: "No registration found for that email + mobile. Please register first.", code: "NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        degree: student.degree,
        branch: student.branch,
        college: student.college,
        plan: student.plan,
        category: student.category,
        categoryLabel: student.categoryLabel,
        project: student.project,
        projectId: student.projectId,
        paymentStatus: student.paymentStatus,
        internshipStatus: student.internshipStatus,
        currentStage: student.currentStage,
        startedAt: student.startedAt,
        completedAt: student.completedAt,
        createdAt: student.createdAt,
      },
    });
  } catch (err) {
    console.error("[student/lookup] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
