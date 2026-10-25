import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: list published projects for students. Also surfaces the student's
// existing download + submission so the UI can show "downloaded" / "submitted"
// badges next to each project card.
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

    const items = await db.projectLibraryItem.findMany({
      where: { status: "published" },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        techStack: true,
        difficulty: true,
        category: true,
        features: true,
        accessLevel: true,
        featured: true,
        createdAt: true,
      },
    });

    // Per-student: which project (if any) has this student already downloaded?
    const download = await db.projectDownload.findUnique({
      where: { studentEmail },
      select: { projectId: true, downloadedAt: true },
    });

    // Per-student: all their submissions (projectId → status)
    const submissions = await db.projectSubmission.findMany({
      where: { studentEmail },
      select: { projectId: true, status: true, id: true },
    });
    const subMap = new Map(submissions.map((s) => [s.projectId, s]));

    // Admin-assigned project — only this project can be downloaded.
    // If null, the student cannot download ANY project from the library.
    const account = await db.account.findUnique({
      where: { username: studentEmail },
      select: { assignedProjectId: true },
    });
    const assignedProjectId = account?.assignedProjectId || null;
    let assignedProjectTitle: string | null = null;
    if (assignedProjectId) {
      const proj = await db.projectLibraryItem.findUnique({
        where: { id: assignedProjectId },
        select: { title: true },
      });
      assignedProjectTitle = proj?.title || null;
    }

    return NextResponse.json({
      ok: true,
      items,
      downloadedProjectId: download?.projectId || null,
      downloadedAt: download?.downloadedAt || null,
      submissions: subMap,
      assignedProjectId,
      assignedProjectTitle,
    });
  } catch (err) {
    console.error("[student/project-library] GET error:", err);
    return NextResponse.json({ ok: false, error: "Failed to load projects." }, { status: 500 });
  }
}
