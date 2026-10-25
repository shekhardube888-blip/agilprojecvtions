import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: single project detail (with starter files for the student to download)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json(
        { ok: false, error: "Not logged in.", code: "NO_SESSION" },
        { status: 401 }
      );
    }
    const studentEmail = session.username.toLowerCase().trim();
    const { id } = await params;

    const item = await db.projectLibraryItem.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        techStack: true,
        difficulty: true,
        category: true,
        features: true,
        starterFiles: true,
        accessLevel: true,
        featured: true,
        createdAt: true,
      },
    });
    if (!item || item.slug === undefined) {
      // findUnique returns null if not found
    }
    if (!item) {
      return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
    }

    // Student's download state for this project
    const download = await db.projectDownload.findUnique({
      where: { studentEmail },
      select: { projectId: true, downloadedAt: true },
    });
    const submission = await db.projectSubmission.findUnique({
      where: { projectId_studentEmail: { projectId: id, studentEmail } },
      select: { id: true, status: true, mentorFeedback: true, submittedAt: true, reviewedAt: true },
    });

    return NextResponse.json({
      ok: true,
      item,
      download: download
        ? { projectId: download.projectId, downloadedAt: download.downloadedAt }
        : null,
      submission,
    });
  } catch (err) {
    console.error("[student/project-library/[id]] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load project." }, { status: 500 });
  }
}
