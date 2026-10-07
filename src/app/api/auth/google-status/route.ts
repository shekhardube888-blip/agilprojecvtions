import { NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/auth/google-status
// Returns whether Google OAuth is configured (GOOGLE_CLIENT_ID + SECRET are set).
// The Google button checks this before opening the popup so it can show a
// helpful "not configured" message instead of redirecting to a confusing
// NextAuth error page.
export async function GET() {
  const configured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return NextResponse.json({
    ok: true,
    configured,
  });
}
