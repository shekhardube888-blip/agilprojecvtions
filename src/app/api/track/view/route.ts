import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const COOKIE_NAME = "ap_uid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function genUid(): string {
  return "v_" + (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
}

function readCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(/;\s*/).map((c) => c.split("=")).find(([k]) => k === COOKIE_NAME);
  return match && match[1] ? match[1] : null;
}

// POST /api/track/view — records a page view. Uses the ap_uid cookie to
// identify unique visitors. Creates a Visitor row on first sight, or
// increments views + updates lastSeen for returning visitors.
export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    let uid = readCookie(cookie);
    const now = new Date();
    const isNew = !uid;
    if (!uid) uid = genUid();

    if (isNew) {
      await db.visitor.create({
        data: { uniqueId: uid, firstSeen: now, lastSeen: now, views: 1 },
      });
    } else {
      await db.visitor.upsert({
        where: { uniqueId: uid },
        update: { lastSeen: now, views: { increment: 1 } },
        create: { uniqueId: uid, firstSeen: now, lastSeen: now, views: 1 },
      });
    }

    const headers = new Headers();
    if (isNew) {
      headers.append("Set-Cookie", `${COOKIE_NAME}=${uid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`);
    }
    return NextResponse.json({ ok: true, uid, isNew }, { headers });
  } catch (err) {
    console.error("[track/view] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
