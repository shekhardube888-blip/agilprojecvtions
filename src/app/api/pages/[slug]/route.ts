import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const page = await db.customPage.findUnique({ where: { slug } });
    if (!page || !page.published) return NextResponse.json({ ok: false, error: "Page not found" }, { status: 404 });
    return NextResponse.json({ ok: true, page: { id: page.id, slug: page.slug, title: page.title, html: page.html, order: page.order, updatedAt: page.updatedAt } });
  } catch (err) { console.error("[pages/[slug]] error:", (err as Error).message); return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 }); }
}
