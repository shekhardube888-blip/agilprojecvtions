import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// POST /api/newsletter  { email }
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const clean = String(email || "").trim().toLowerCase();
    if (!clean || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
    }
    // upsert: ignore duplicate email errors so we don't leak who's subscribed.
    try {
      await db.subscriber.create({ data: { email: clean } });
    } catch {
      // Already subscribed — that's fine.
    }
    return NextResponse.json({ ok: true, message: "Subscribed! New batch alerts will land in your inbox." });
  } catch (err) {
    console.error("[newsletter] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
