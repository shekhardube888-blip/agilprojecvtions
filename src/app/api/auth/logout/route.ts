import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/auth/logout — clears the session cookie
export async function POST() {
  try {
    const headers = new Headers();
    headers.append("Set-Cookie", clearSessionCookie());
    return NextResponse.json({ ok: true, message: "Logged out" }, { headers });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
