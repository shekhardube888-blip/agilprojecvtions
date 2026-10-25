import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: list the logged-in student's submissions
export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json(
        { ok: false, error: "Not logged in.", code: "NO_SESSION" },
        { status: 401 }
      );
    }
    const studentEmail = session.username.toLowerCase().trim();

    const submissions = await db.projectSubmission.findMany({
      where: { studentEmail },
      orderBy: { submittedAt: "desc" },
      take: 50,
      include: {
        project: {
          select: { id: true, title: true, techStack: true, category: true },
        },
      },
    });
    return NextResponse.json({ ok: true, submissions });
  } catch (err) {
    console.error("[student/project-library/submission] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load submissions." }, { status: 500 });
  }
}

// POST: student submits completed work for a project
export async function POST(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json(
        { ok: false, error: "Not logged in.", code: "NO_SESSION" },
        { status: 401 }
      );
    }
    const studentEmail = session.username.toLowerCase().trim();
    const body = await req.json();

    const projectId = String(body.projectId || "");
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "projectId is required." }, { status: 400 });
    }

    // Verify the project exists + is published
    const project = await db.projectLibraryItem.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, status: true },
    });
    if (!project || project.status !== "published") {
      return NextResponse.json({ ok: false, error: "Project not available." }, { status: 404 });
    }

    // Student must have downloaded the project before submitting
    const download = await db.projectDownload.findUnique({
      where: { studentEmail },
      select: { projectId: true },
    });
    if (!download || download.projectId !== projectId) {
      return NextResponse.json(
        { ok: false, error: "Please download the starter code first." },
        { status: 403 }
      );
    }

    // Pull student name from the Student record if available
    const studentRec = await db.student.findUnique({
      where: { email: studentEmail },
      select: { firstName: true, lastName: true },
    });
    const studentName = studentRec
      ? `${studentRec.firstName} ${studentRec.lastName}`
      : null;

    const payload = {
      projectId,
      studentEmail,
      studentName,
      sourceCodeUrl: String(body.sourceCodeUrl || "").trim() || null,
      reportText: String(body.reportText || "").trim() || null,
      demoVideoUrl: String(body.demoVideoUrl || "").trim() || null,
      notes: String(body.notes || "").trim() || null,
    };

    // Upsert — one submission per (project, student)
    const submission = await db.projectSubmission.upsert({
      where: { projectId_studentEmail: { projectId, studentEmail } },
      create: { ...payload, status: "submitted" },
      update: {
        ...payload,
        // Resubmit resets the review back to "submitted" (mentor re-reviews)
        status: "submitted",
        mentorFeedback: null,
        reviewedBy: null,
        reviewedAt: null,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, submission });
  } catch (err) {
    console.error("[student/project-library/submission] POST error:", err);
    return NextResponse.json({ ok: false, error: "Failed to submit." }, { status: 500 });
  }
}
