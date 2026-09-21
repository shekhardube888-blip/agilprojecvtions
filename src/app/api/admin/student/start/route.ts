import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, readSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/admin/student/start  { studentId }
// Admin-only. Confirms payment + starts the student's internship:
//   paymentStatus = "confirmed", internshipStatus = "in_progress",
//   currentStage = 1, startedAt = now.
export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ ok: false, error: "studentId is required" }, { status: 400 });
    }
    const student = await db.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 });
    }
    const updated = await db.student.update({
      where: { id: studentId },
      data: {
        paymentStatus: "confirmed",
        internshipStatus: "in_progress",
        currentStage: 1,
        startedAt: new Date(),
      },
    });
    return NextResponse.json({
      ok: true,
      student: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        project: updated.project,
        categoryLabel: updated.categoryLabel,
        paymentStatus: updated.paymentStatus,
        internshipStatus: updated.internshipStatus,
        currentStage: updated.currentStage,
        startedAt: updated.startedAt,
      },
    });
  } catch (err) {
    console.error("[admin/student/start] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
