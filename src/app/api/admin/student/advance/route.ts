import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, readSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/admin/student/advance  { studentId }
// Admin-only. Moves the student to the next project stage (currentStage++).
// Stage 7 = all 6 stages done → internshipStatus = "completed", completedAt = now.
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
    if (student.internshipStatus !== "in_progress") {
      return NextResponse.json({ ok: false, error: "Internship not started yet. Confirm payment + start first." }, { status: 400 });
    }
    const next = Math.min(student.currentStage + 1, 7);
    const isDone = next === 7;
    const updated = await db.student.update({
      where: { id: studentId },
      data: {
        currentStage: next,
        internshipStatus: isDone ? "completed" : "in_progress",
        completedAt: isDone ? new Date() : null,
      },
    });
    return NextResponse.json({
      ok: true,
      student: {
        id: updated.id,
        currentStage: updated.currentStage,
        internshipStatus: updated.internshipStatus,
        completedAt: updated.completedAt,
      },
    });
  } catch (err) {
    console.error("[admin/student/advance] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
