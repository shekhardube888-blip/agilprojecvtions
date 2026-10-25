import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession, ensureAccountsSeeded } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET a single project by id (admin: includes everything)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const { id } = await params;
    const item = await db.projectLibraryItem.findUnique({
      where: { id },
      include: {
        _count: { select: { downloads: true, submissions: true } },
        submissions: {
          orderBy: { submittedAt: "desc" },
          take: 50,
        },
      },
    });
    if (!item) {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[admin/project-library/[id]] GET error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// PATCH: update an existing project
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();

    const existing = await db.projectLibraryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }

    // Build a partial update object — only fields that were provided
    const data: Record<string, unknown> = {};
    const allowed = [
      "title", "description", "techStack", "difficulty", "category",
      "status", "accessLevel", "featured",
    ];
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    // Slug: special-case — keep unique
    if (body.slug && body.slug !== existing.slug) {
      const clash = await db.projectLibraryItem.findUnique({ where: { slug: body.slug } });
      if (clash && clash.id !== id) {
        return NextResponse.json({ ok: false, error: "Slug already in use." }, { status: 400 });
      }
      data.slug = body.slug;
    }
    // JSON-stringifiable fields
    if (body.features !== undefined) {
      data.features = typeof body.features === "string" ? body.features : JSON.stringify(body.features ?? []);
    }
    if (body.starterFiles !== undefined) {
      data.starterFiles =
        typeof body.starterFiles === "string" ? body.starterFiles : JSON.stringify(body.starterFiles ?? []);
    }

    const updated = await db.projectLibraryItem.update({
      where: { id },
      data,
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error("[admin/project-library/[id]] PATCH error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// DELETE: remove a project (cascades to downloads + submissions)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const { id } = await params;
    await db.projectLibraryItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/project-library/[id]] DELETE error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
