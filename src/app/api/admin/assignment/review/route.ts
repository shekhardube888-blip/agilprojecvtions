import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/admin/assignment/review  { submissionId, status, feedback }
// Admin reviews a student's submission → approve or reject + provide feedback.
// The student sees the feedback in their Learning Path tab.

export async function POST(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const submissionId = String(body.submissionId || "").trim();
    const status = String(body.status || "").trim(); // "approved" | "rejected"
    const feedback = body.feedback ? String(body.feedback).trim() : null;

    if (!submissionId) {
      return NextResponse.json({ ok: false, error: "submissionId is required." }, { status: 400 });
    }
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ ok: false, error: "status must be 'approved' or 'rejected'." }, { status: 400 });
    }
    if (status === "rejected" && !feedback) {
      return NextResponse.json({ ok: false, error: "Feedback is required when rejecting." }, { status: 400 });
    }

    const existing = await db.submission.findUnique({ where: { id: submissionId } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Submission not found." }, { status: 404 });
    }

    const updated = await db.submission.update({
      where: { id: submissionId },
      data: {
        status,
        mentorFeedback: feedback,
        reviewedBy: session.username,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      submission: {
        id: updated.id,
        stage: updated.stage,
        status: updated.status,
        mentorFeedback: updated.mentorFeedback,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt,
      },
    });
  } catch (err) {
    console.error("[admin/assignment/review] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Review failed." }, { status: 500 });
  }
}
