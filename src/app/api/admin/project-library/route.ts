import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession, ensureAccountsSeeded } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── GET: list ALL projects (incl. drafts/archived) for the admin table ──
export async function GET(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const items = await db.projectLibraryItem.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { downloads: true, submissions: true },
        },
      },
    });
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[admin/project-library] GET error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// ── POST: create a new project ──
export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const body = await req.json();

    // Required fields
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const techStack = String(body.techStack || "").trim();
    if (!title || !description || !techStack) {
      return NextResponse.json(
        { ok: false, error: "title, description, techStack are required." },
        { status: 400 }
      );
    }

    // Build a unique slug (auto-generate if not provided)
    let slug = String(body.slug || "").trim();
    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    const existing = await db.projectLibraryItem.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Sanitise JSON-ish fields (accept arrays or JSON strings)
    const parseJson = (v: unknown, fallback: unknown) => {
      if (v == null) return fallback;
      if (typeof v === "string") {
        try {
          const p = JSON.parse(v);
          return p;
        } catch {
          return fallback;
        }
      }
      return v;
    };
    const features = JSON.stringify(parseJson(body.features, []) ?? []);
    const starterFiles = JSON.stringify(parseJson(body.starterFiles, []) ?? []);

    const item = await db.projectLibraryItem.create({
      data: {
        slug,
        title,
        description,
        techStack,
        difficulty: String(body.difficulty || "Intermediate"),
        category: String(body.category || "AI"),
        features,
        starterFiles,
        status: String(body.status || "published"),
        accessLevel: String(body.accessLevel || "public"),
        featured: Boolean(body.featured || false),
        createdBy: session.username,
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[admin/project-library] POST error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
