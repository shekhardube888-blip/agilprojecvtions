import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { PROJECT_STAGES, LESSONS } from "@/lib/data";

export const runtime = "nodejs";

// GET /api/student/certificate-status
// Checks ALL certificate eligibility requirements:
// 1. All 6 module assignments must be APPROVED by a mentor
// 2. All 21 lessons must be completed
// 3. All 6 module quizzes must be PASSED (score >= 60%)
// 4. The student's internshipStatus must be "completed"
//
// Returns a detailed eligibility report so the student + admin can see
// exactly what's missing.

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }

    const studentEmail = session.username.toLowerCase().trim();

    // Find the student
    const candidates = await db.student.findMany({
      where: { email: { contains: studentEmail.split("@")[0].slice(0, 3) } },
      take: 100,
    });
    let student = candidates.find((s) => s.email.toLowerCase() === studentEmail);
    if (!student) {
      const all = await db.student.findMany({ take: 500 });
      student = all.find((s) => s.email.toLowerCase() === studentEmail) || null;
    }
    if (!student) {
      return NextResponse.json({ ok: false, error: "No registration found.", code: "NO_REGISTRATION" }, { status: 404 });
    }

    // 1. Check submissions — all 6 modules must be "approved"
    const submissions = await db.submission.findMany({
      where: { studentEmail },
      select: { stage: true, status: true },
    });
    const approvedSubmissions = submissions.filter((s) => s.status === "approved").length;
    const totalModules = PROJECT_STAGES.length;
    const allSubmissionsApproved = approvedSubmissions >= totalModules;

    // 2. Check lessons — all 21 must be completed
    const completedLessons = await db.lessonProgress.count({
      where: { studentEmail },
    });
    const totalLessons = LESSONS.length;
    const allLessonsCompleted = completedLessons >= totalLessons;

    // 3. Check quizzes — all 6 modules must be passed
    const quizAttempts = await db.assessmentAttempt.findMany({
      where: { studentEmail, passed: true },
      select: { stage: true },
    });
    const passedStages = new Set(quizAttempts.map((a) => a.stage));
    const allQuizzesPassed = passedStages.size >= totalModules;

    // 4. Check internship status
    const internshipCompleted = student.internshipStatus === "completed";

    // Overall eligibility
    const eligible = allSubmissionsApproved && allLessonsCompleted && allQuizzesPassed && internshipCompleted;

    // Check for existing certificate
    const existingCert = await db.certificate.findFirst({
      where: { studentId: student.id },
      select: { certificateNumber: true, issuedAt: true },
    });

    return NextResponse.json({
      ok: true,
      eligible,
      certificate: existingCert ? { number: existingCert.certificateNumber, issuedAt: existingCert.issuedAt } : null,
      requirements: {
        assignments: { met: allSubmissionsApproved, approved: approvedSubmissions, required: totalModules },
        lessons: { met: allLessonsCompleted, completed: completedLessons, required: totalLessons },
        quizzes: { met: allQuizzesPassed, passed: passedStages.size, required: totalModules },
        internshipStatus: { met: internshipCompleted, status: student.internshipStatus },
      },
      missingRequirements: [
        !allSubmissionsApproved ? `Approve ${totalModules - approvedSubmissions} more assignment(s)` : null,
        !allLessonsCompleted ? `Complete ${totalLessons - completedLessons} more lesson(s)` : null,
        !allQuizzesPassed ? `Pass ${totalModules - passedStages.size} more quiz(zes)` : null,
        !internshipCompleted ? "Admin must mark internship as completed" : null,
      ].filter(Boolean),
    });
  } catch (err) {
    console.error("[student/certificate-status] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to check eligibility." }, { status: 500 });
  }
}
