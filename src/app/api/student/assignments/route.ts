import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { PROJECT_STAGES } from "@/lib/data";

export const runtime = "nodejs";

// GET /api/student/assignments
// Returns the 6 module deliverables (assignments) + the student's submission
// status for each. Used by the Learning Path to show the assignment section
// under each module.

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }

    const studentEmail = session.username.toLowerCase().trim();

    // Fetch all submissions for this student
    const submissions = await db.submission.findMany({
      where: { studentEmail },
      select: { stage: true, content: true, status: true, mentorFeedback: true, submittedAt: true, reviewedAt: true },
    });
    const subMap = new Map(submissions.map((s) => [s.stage, s]));

    // Map PROJECT_STAGES → assignments with submission status
    const assignments = PROJECT_STAGES.map((stage) => {
      const sub = subMap.get(stage.step);
      return {
        stage: stage.step,
        week: stage.week,
        title: stage.title,
        deliverable: stage.deliverable,
        desc: stage.desc,
        submission: sub ? {
          content: sub.content,
          status: sub.status,
          mentorFeedback: sub.mentorFeedback,
          submittedAt: sub.submittedAt,
          reviewedAt: sub.reviewedAt,
        } : null,
      };
    });

    const approvedCount = submissions.filter((s) => s.status === "approved").length;
    const submittedCount = submissions.length;

    return NextResponse.json({
      ok: true,
      assignments,
      stats: {
        total: PROJECT_STAGES.length,
        submitted: submittedCount,
        approved: approvedCount,
        pending: PROJECT_STAGES.length - approvedCount,
      },
    });
  } catch (err) {
    console.error("[student/assignments] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load assignments." }, { status: 500 });
  }
}
