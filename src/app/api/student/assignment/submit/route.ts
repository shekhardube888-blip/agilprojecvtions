import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/student/assignment/submit  { stage, content }
// Student submits their work for a module's deliverable. Idempotent —
// re-submitting updates the existing submission + resets status to "submitted"
// (so the mentor knows to re-review).

export async function POST(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }

    const studentEmail = session.username.toLowerCase().trim();
    const body = await req.json();
    const stage = Number(body.stage);
    const content = String(body.content || "").trim();

    if (!stage || stage < 1 || stage > 6) {
      return NextResponse.json({ ok: false, error: "stage must be 1-6" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ ok: false, error: "Content is required. Paste your work, a GitHub link, or notes." }, { status: 400 });
    }
    if (content.length > 10000) {
      return NextResponse.json({ ok: false, error: "Submission too long (max 10000 chars)." }, { status: 400 });
    }

    // Get student name + project for the submission record
    const students = await db.student.findMany({ where: { email: { contains: studentEmail.split("@")[0].slice(0, 3) } }, take: 50 });
    const student = students.find((s) => s.email.toLowerCase() === studentEmail);

    // Upsert the submission (re-submitting resets to "submitted" for re-review)
    const submission = await db.submission.upsert({
      where: { studentEmail_stage: { studentEmail, stage } },
      create: {
        studentEmail,
        studentName: student ? `${student.firstName} ${student.lastName}`.trim() : studentEmail,
        stage,
        project: student?.project || null,
        content,
        status: "submitted",
      },
      update: {
        content,
        status: "submitted",
        mentorFeedback: null,
        reviewedBy: null,
        reviewedAt: null,
      },
    });

    return NextResponse.json({
      ok: true,
      submission: {
        id: submission.id,
        stage: submission.stage,
        status: submission.status,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (err) {
    console.error("[student/assignment/submit] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Submission failed." }, { status: 500 });
  }
}
