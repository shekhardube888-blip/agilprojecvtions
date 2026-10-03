import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { COLLEGES_SEED } from "@/lib/data";

export const runtime = "nodejs";

let seedPromise: Promise<void> | null = null;

// Auto-seed the College table from the COLLEGES_SEED constant on the first
// API call. Idempotent — only inserts colleges that don't already exist.
async function ensureCollegesSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const existing = await db.college.count();
      if (existing >= COLLEGES_SEED.length) return;
      for (const c of COLLEGES_SEED) {
        const found = await db.college.findUnique({ where: { name: c.name } });
        if (found) continue;
        await db.college.create({
          data: { name: c.name, state: c.state, source: "seed" },
        });
      }
    } catch (e) {
      seedPromise = null; // allow retry on next request
      console.error("[colleges] seed failed:", (e as Error).message);
    }
  })();
  return seedPromise;
}

// GET /api/colleges — returns all colleges (seeded + student-added), ordered by name.
// Optional: ?q=vit → filter by name (case-insensitive) for autocomplete.
export async function GET(req: Request) {
  try {
    await ensureCollegesSeeded();
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();

    const where = q
      ? { name: { contains: q } } // SQLite: case-insensitive by default for ASCII
      : {};

    const colleges = await db.college.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true, state: true, source: true },
    });

    return NextResponse.json({ ok: true, colleges });
  } catch (err) {
    console.error("[colleges] GET error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load colleges." }, { status: 500 });
  }
}

// POST /api/colleges — add a new college (called from the registration form
// when a student types a college not in the list). Idempotent: if the college
// name already exists, returns the existing one.
// Body: { name, state? }
export async function POST(req: Request) {
  try {
    await ensureCollegesSeeded();
    const { name: nameRaw, state } = await req.json();
    const name = String(nameRaw || "").trim();
    if (!name) {
      return NextResponse.json({ ok: false, error: "College name is required." }, { status: 400 });
    }
    if (name.length > 200) {
      return NextResponse.json({ ok: false, error: "College name is too long." }, { status: 400 });
    }

    // Idempotent: return existing if present
    const existing = await db.college.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ ok: true, college: existing, alreadyExisted: true });
    }

    const college = await db.college.create({
      data: { name, state: state || null, source: "student-added" },
    });
    return NextResponse.json({ ok: true, college });
  } catch (err) {
    console.error("[colleges] POST error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to add college." }, { status: 500 });
  }
}
