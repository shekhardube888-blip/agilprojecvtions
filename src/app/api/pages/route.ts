import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function GET() {
  try {
    const pages = await db.customPage.findMany({ where: { published: true }, orderBy: [{ order: "asc" }, { title: "asc" }], select: { id: true, slug: true, title: true, order: true, updatedAt: true } });
    return NextResponse.json({ ok: true, pages });
  } catch (err) { console.error("[pages] error:", (err as Error).message); return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 }); }
}
