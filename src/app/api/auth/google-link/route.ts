import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { makeSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/auth/google-link — called after Google sign-in completes.
// Reads the NextAuth session, finds/creates the local Account linked to the
// Google user's email, sets the local HMAC `ap_session` cookie (so the
// existing /api/auth/me route works unchanged), then:
//   - if `?popup=1` → returns a self-closing HTML page that postMessages the
//     parent window (popup flow — Google login opens in a popup on the portal).
//   - otherwise → redirects to /?google=1 (full-page redirect flow fallback).
//
// This is what binds a Google identity to the local portal: the student
// cannot register with a different email because the email here is taken
// directly from the verified Google session.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const isPopup = url.searchParams.get("popup") === "1";

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      // No Google session → auth failed. Signal the parent + close popup,
      // or redirect with an error.
      if (isPopup) {
        return popupResponse(false, "Google sign-in failed — no session.");
      }
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

    if (isPopup) {
      // Popup flow: return a self-closing HTML page that signals the parent.
      // The Set-Cookie header is set on this response so the browser stores
      // the session cookie before the popup closes.
      const html = popupSuccessHtml();
      const res = new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
      res.headers.append("Set-Cookie", cookie);
      return res;
    }

    // Full-page redirect flow (fallback when popup is blocked).
    const res = NextResponse.redirect(new URL("/?google=1", req.url));
    res.headers.append("Set-Cookie", cookie);
    return res;
  } catch (err) {
    // SECURITY: never log the email or any credential. Only log a generic error.
    console.error("[google-link] error:", (err as Error).message);
    if (isPopup) {
      return popupResponse(false, "Google sign-in failed. Please try again.");
    }
    return NextResponse.redirect(new URL("/?error=google-failed", req.url));
  }
}

// Returns a minimal HTML page that postMessages the parent window and closes
// the popup. Used by the popup flow so the parent can refresh its auth state.
function popupResponse(success: boolean, message: string): NextResponse {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Google Sign-In</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0B1929;color:#F8FAFC}p{text-align:center}</style>
</head><body>
<p>${success ? "✓ Sign-in complete. Closing…" : "✗ " + escapeHtml(message)}</p>
<script>
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: "google-auth-complete", success: ${success}, error: ${success ? "null" : JSON.stringify(message)} }, "*");
    }
  } catch (e) {}
  setTimeout(function(){ window.close(); }, 150);
</script>
</body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function popupSuccessHtml(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Google Sign-In</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0B1929;color:#F8FAFC}p{text-align:center}</style>
</head><body>
<p>✓ Google sign-in complete.<br>Closing this window…</p>
<script>
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: "google-auth-complete", success: true, error: null }, "*");
    }
  } catch (e) {}
  setTimeout(function(){ window.close(); }, 150);
</script>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
