import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET: download a single starter file from a project.
//
// ENFORCEMENT — "one ready-made project per student":
//   • If the student has NOT yet downloaded any project  → allow + record.
//   • If the student has already downloaded THIS project  → allow re-download (same file).
//   • If the student has already downloaded a DIFFERENT project → 403 with message.
//
// Query params:
//   • file=<fileName>   — required, which starter file to download
//
// Response:
//   • 200 OK with Content-Disposition: attachment; filename="<file>"
//   • 401/403/404 on errors
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
    const url = new URL(req.url);
    const fileName = String(url.searchParams.get("file") || "");

    if (!fileName) {
      return NextResponse.json(
        { ok: false, error: "Missing ?file=<fileName> query." },
        { status: 400 }
      );
    }

    // ── 1. Load project ──
    const item = await db.projectLibraryItem.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, status: true, starterFiles: true },
    });
    if (!item) {
      return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
    }
    if (item.status !== "published") {
      return NextResponse.json(
        { ok: false, error: "This project is not currently available." },
        { status: 403 }
      );
    }

    // ── 2. Find the requested file in the starterFiles JSON ──
    let starterFiles: Array<{ label?: string; fileName?: string; language?: string; content?: string }> = [];
    try {
      starterFiles = JSON.parse(item.starterFiles || "[]");
    } catch {
      starterFiles = [];
    }
    const file = starterFiles.find((f) => f && f.fileName === fileName);
    if (!file || !file.content) {
      return NextResponse.json(
        { ok: false, error: `File '${fileName}' not found in this project.` },
        { status: 404 }
      );
    }

    // ── 3. ENFORCE the "one ready-made project per student" rule ──
    const existing = await db.projectDownload.findUnique({
      where: { studentEmail },
      select: { projectId: true, project: { select: { title: true } } },
    });

    if (existing && existing.projectId !== id) {
      return NextResponse.json(
        {
          ok: false,
          error: `You can only download one ready-made project. You already chose: "${existing.project?.title || "another project"}".`,
          code: "ALREADY_DOWNLOADED_OTHER",
          chosenProjectId: existing.projectId,
        },
        { status: 403 }
      );
    }

    // First download from this project → record it
    if (!existing) {
      await db.projectDownload.create({
        data: { studentEmail, projectId: id },
      });
    }

    // ── 4. Stream the file back as a downloadable attachment ──
    // Determine content-type from extension (best-effort)
    const ext = (fileName.split(".").pop() || "").toLowerCase();
    const ct: Record<string, string> = {
      py: "text/x-python",
      js: "text/javascript",
      ts: "text/typescript",
      jsx: "text/jsx",
      tsx: "text/tsx",
      json: "application/json",
      md: "text/markdown",
      txt: "text/plain",
      sql: "application/sql",
      yml: "text/yaml",
      yaml: "text/yaml",
      html: "text/html",
      css: "text/css",
      env: "text/plain",
      toml: "text/plain",
      cfg: "text/plain",
      ini: "text/plain",
      sh: "application/x-sh",
      dockerfile: "text/plain",
    };
    const contentType = ct[ext] || "text/plain";

    return new NextResponse(file.content, {
      status: 200,
      headers: {
        "Content-Type": `${contentType}; charset=utf-8`,
        "Content-Disposition": `attachment; filename="${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
        "Cache-Control": "no-store",
        "X-Project-Id": id,
        "X-Project-Title": encodeURIComponent(item.title),
      },
    });
  } catch (err) {
    console.error("[student/project-library/[id]/download] GET error:", err);
    return NextResponse.json({ ok: false, error: "Download failed." }, { status: 500 });
  }
}
