import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { makeSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/auth/google-link — called after Google sign-in completes.
// Reads the NextAuth session, finds/creates the local Account linked to the
// Google user's email, sets the local HMAC `ap_session` cookie (so the
// existing /api/auth/me route works unchanged), then redirects to /.
//
// This is what binds a Google identity to the local portal: the student
// cannot register with a different email because the email here is taken
// directly from the verified Google session.
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/?error=google-failed", req.url));
    }

    const email = session.user.email.toLowerCase().trim();

    // Find or create the local Account linked to this Google email.
    // No password — Google handles authentication. passwordHash is a random
    // unusable value so the Account row is never loggable via /api/auth/login.
    let account = await db.account.findUnique({ where: { username: email } });
    if (!account) {
      const { randomBytes } = await import("crypto");
      const unusableHash =
        randomBytes(48).toString("hex") + ":" + randomBytes(64).toString("hex");
      account = await db.account.create({
        data: {
          username: email,
          passwordHash: unusableHash, // never usable — Google handles auth
          role: "guest",
          status: "unlocked",
          expiresAt: null, // permanent — Google students never expire
          passwordSetAt: null,
          fullName: session.user.name || email,
          note: "Google-linked account (no password — login via Google OAuth)",
        },
      });
    } else {
      // Ensure existing accounts are unlocked + permanent when re-linked via Google.
      // (e.g. an admin previously locked them, or they were a 2-day demo account.)
      if (account.status !== "unlocked" || account.expiresAt !== null) {
        account = await db.account.update({
          where: { id: account.id },
          data: { status: "unlocked", expiresAt: null, passwordSetAt: null },
        });
      }
    }

    // Set the local HMAC cookie so /api/auth/me works for this Google user.
    const cookie = makeSessionCookie({
      username: account.username,
      role: "guest",
      scope: "agileprojection-portal",
    });
    const res = NextResponse.redirect(new URL("/?google=1", req.url));
    res.headers.append("Set-Cookie", cookie);
    return res;
  } catch (err) {
    // SECURITY: never log the email or any credential. Only log a generic error.
    console.error("[google-link] error:", (err as Error).message);
    return NextResponse.redirect(
      new URL("/?error=google-failed", req.url)
    );
  }
}
