import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession, ensureAccountsSeeded } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: list ALL submissions across projects (admin review queue)
export async function GET(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "";

    const where = status ? { status } : {};
    const submissions = await db.projectSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: 100,
      include: { project: { select: { title: true, techStack: true } } },
    });
    const stats = {
      total: await db.projectSubmission.count(),
      submitted: await db.projectSubmission.count({ where: { status: "submitted" } }),
      under_review: await db.projectSubmission.count({ where: { status: "under_review" } }),
      approved: await db.projectSubmission.count({ where: { status: "approved" } }),
      rejected: await db.projectSubmission.count({ where: { status: "rejected" } }),
    };
    return NextResponse.json({ ok: true, submissions, stats });
  } catch (err) {
    console.error("[admin/project-library/submission] GET error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// POST: review a submission (mentor feedback + status change)
export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const body = await req.json();
    const submissionId = String(body.submissionId || "");
    const status = String(body.status || ""); // submitted | under_review | approved | rejected
    const mentorFeedback = String(body.mentorFeedback || "").trim();

    if (!submissionId || !status) {
      return NextResponse.json(
        { ok: false, error: "submissionId and status are required." },
        { status: 400 }
      );
    }
    if (!["submitted", "under_review", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }

    const existing = await db.projectSubmission.findUnique({ where: { id: submissionId } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Submission not found." }, { status: 404 });
    }

    const updated = await db.projectSubmission.update({
      where: { id: submissionId },
      data: {
        status,
        mentorFeedback: mentorFeedback || null,
        reviewedBy: session.username,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, submission: updated });
  } catch (err) {
    console.error("[admin/project-library/submission] POST error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
