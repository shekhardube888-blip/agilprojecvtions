import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, readSession } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    const body = await req.json();
    const slug = String(body.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    const title = String(body.title || "").trim();
    const html = String(body.html || "");
    if (!slug || !title) return NextResponse.json({ ok: false, error: "slug and title required" }, { status: 400 });
    const published = body.published !== false;
    const order = Number(body.order ?? 0) || 0;
    const page = await db.customPage.upsert({ where: { slug }, update: { title, html, published, order, updatedAt: new Date() }, create: { slug, title, html, published, order } });
    return NextResponse.json({ ok: true, page: { id: page.id, slug: page.slug, title: page.title, published: page.published, order: page.order } });
  } catch (err) { console.error("[admin/pages] error:", err); return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 }); }
}
export async function GET(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    const pages = await db.customPage.findMany({ orderBy: [{ order: "asc" }, { title: "asc" }], select: { id: true, slug: true, title: true, published: true, order: true, updatedAt: true } });
    return NextResponse.json({ ok: true, pages });
  } catch (err) { console.error("[admin/pages GET] error:", err); return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 }); }
}
export async function DELETE(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || "";
    if (!slug) return NextResponse.json({ ok: false, error: "slug required" }, { status: 400 });
    await db.customPage.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (err) { console.error("[admin/pages DELETE] error:", err); return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 }); }
}
