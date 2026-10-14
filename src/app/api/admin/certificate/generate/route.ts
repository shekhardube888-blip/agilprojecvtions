import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, readSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/admin/certificate/generate  { studentId }
// Admin-only. Auto-issues a verifiable certificate for a COMPLETED student
// (internshipStatus === "completed"). Eligibility: project completed + mentor approved
// (represented by the admin having advanced the student through all 6 stages).
// Returns the certificate (with a unique certificate number).
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
    if (student.internshipStatus !== "completed") {
      return NextResponse.json({
        ok: false,
        error: "Student hasn't completed the internship yet. Advance them through all 6 stages first.",
      }, { status: 400 });
    }

    // ── Certificate eligibility check (#6): ALL requirements must be met ──
    // 1. All 6 module assignments must be approved
    const approvedSubs = await db.submission.count({
      where: { studentEmail: student.email.toLowerCase(), status: "approved" },
    });
    // 2. All 21 lessons must be completed
    const completedLessons = await db.lessonProgress.count({
      where: { studentEmail: student.email.toLowerCase() },
    });
    // 3. All 6 module quizzes must be passed
    const passedQuizzes = await db.assessmentAttempt.findMany({
      where: { studentEmail: student.email.toLowerCase(), passed: true },
      select: { stage: true },
    });

    const { PROJECT_STAGES, LESSONS } = await import("@/lib/data");
    const totalModules = PROJECT_STAGES.length;
    const totalLessons = LESSONS.length;
    const passedStages = new Set(passedQuizzes.map((q) => q.stage));

    const missing: string[] = [];
    if (approvedSubs < totalModules) missing.push(`Assignments approved: ${approvedSubs}/${totalModules}`);
    if (completedLessons < totalLessons) missing.push(`Lessons completed: ${completedLessons}/${totalLessons}`);
    if (passedStages.size < totalModules) missing.push(`Quizzes passed: ${passedStages.size}/${totalModules}`);

    if (missing.length > 0) {
      return NextResponse.json({
        ok: false,
        error: `Certificate not eligible yet. Missing: ${missing.join(", ")}`,
        missing,
      }, { status: 400 });
    }
    // Idempotent: if a certificate already exists, return it.
    const existing = await db.certificate.findFirst({ where: { studentId } });
    if (existing) {
      return NextResponse.json({ ok: true, certificate: { ...existing, alreadyExisted: true } });
    }
    // Generate a unique certificate number: AP-YYYY-XXXXXX (6 random alnum)
    const year = new Date().getFullYear();
    const rand = (crypto.randomUUID?.() ?? Math.random().toString(36))
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 6)
      .toUpperCase()
      .padEnd(6, "0");
    const certificateNumber = `AP-${year}-${rand}`;
    const cert = await db.certificate.create({
      data: {
        certificateNumber,
        studentId,
        type: "Internship Completion",
        eligibility: "Project completed (6/6 stages) · mentor approved",
      },
    });
    return NextResponse.json({ ok: true, certificate: cert });
  } catch (err) {
    console.error("[admin/certificate/generate] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
