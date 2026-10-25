import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// GET: download a single starter file from a project.
//
// ENFORCEMENT — admin-controlled "one ready-made project per student":
//   1. Admin must have assigned a project to this student (Account.assignedProjectId).
//      If null → 403 "Admin has not assigned you a project yet."
//   2. The student can only download files from the ADMIN-ASSIGNED project.
//      If the requested project != assigned project → 403 with the assigned project's title.
//   3. Re-downloading from the assigned project is always allowed.
//
// (The earlier "first download locks the student to whichever project they
//  chose first" rule is now REPLACED by admin-controlled assignment.)
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

    // ── 3. ENFORCE the admin-assigned project rule ──
    const account = await db.account.findUnique({
      where: { username: studentEmail },
      select: { assignedProjectId: true },
    });
    const assignedId = account?.assignedProjectId || null;

    if (!assignedId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Your admin has not assigned a project to you yet. Please contact your mentor to get a project assigned in User Management.",
          code: "NO_ASSIGNED_PROJECT",
        },
        { status: 403 }
      );
    }

    if (assignedId !== id) {
      // Look up the assigned project's title for a helpful error message
      const assigned = await db.projectLibraryItem.findUnique({
        where: { id: assignedId },
        select: { title: true },
      });
      return NextResponse.json(
        {
          ok: false,
          error: `You can only download your admin-assigned project: "${assigned?.title || "another project"}". This project is not assigned to you.`,
          code: "NOT_ASSIGNED_PROJECT",
          assignedProjectId: assignedId,
        },
        { status: 403 }
      );
    }

    // ── 4. Record the download (idempotent — re-downloads just update the timestamp) ──
    const existing = await db.projectDownload.findUnique({
      where: { studentEmail },
    });
    if (!existing) {
      await db.projectDownload.create({
        data: { studentEmail, projectId: id },
      });
    } else if (existing.projectId !== id) {
      // Edge case: admin reassigned the project after the student already
      // downloaded a different one. Update the row to the new project.
      await db.projectDownload.update({
        where: { studentEmail },
        data: { projectId: id, downloadedAt: new Date() },
      });
    }

    // ── 5. Stream the file back as a downloadable attachment ──
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
