"use client";

import { useCallback } from "react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

/**
 * GoogleSignInButton
 * ------------------
 * A "Sign in with Google" button that opens Google OAuth in a centered popup
 * window ON the portal (not a full-page redirect). When the popup closes
 * (after Google auth + the /api/auth/google-link?popup=1 callback), it
 * postMessages the parent, which then refreshes its auth state.
 *
 * Fallback: if the browser blocks the popup, it falls back to a full-page
 * redirect via NextAuth's `signIn("google", ...)`.
 *
 * The button renders the official Google "G" logo inline (no network image
 * dependency) so it always renders identically in light / dark themes.
 */
export function GoogleSignInButton({
  label = "Sign in with Google",
  className,
}: {
  /** Optional label override (e.g. "Sign in with Google to register"). */
  label?: string;
  /** Optional extra className appended to the button. */
  className?: string;
}) {
  const handleClick = useCallback(() => {
    const callbackUrl = "/api/auth/google-link?popup=1";
    // NextAuth's Google signin endpoint — opening it in a popup runs the whole
    // OAuth flow inside that window and returns to our callback with ?popup=1.
    const authUrl = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    const w = 500;
    const h = 640;
    const left = Math.max(0, Math.round((window.screen.width - w) / 2));
    const top = Math.max(0, Math.round((window.screen.height - h) / 2));
    const features = [
      `width=${w}`,
      `height=${h}`,
      `left=${left}`,
      `top=${top}`,
      "scrollbars=yes",
      "toolbar=no",
      "menubar=no",
      "location=no",
      "status=no",
      "resizable=yes",
    ].join(",");

    let popup: Window | null = null;
    try {
      popup = window.open(authUrl, "google-auth-popup", features);
    } catch {
      popup = null;
    }

    // If the popup was blocked (null) OR the browser doesn't support popups,
    // fall back to the full-page redirect flow.
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      void signIn("google", { callbackUrl: "/api/auth/google-link" });
      return;
    }

    // Listen for a postMessage from the popup when auth completes.
    const onMessage = (e: MessageEvent) => {
      if (e.data && typeof e.data === "object" && e.data.type === "google-auth-complete") {
        cleanup();
        // Refresh the portal's auth state. The page listens for "auth-change"
        // and re-fetches /api/auth/me, which now returns the logged-in student.
        window.dispatchEvent(new Event("auth-change"));
        if (!e.data.success) {
          // Optional: surface the error via a toast. The parent page handles
          // the ?error=google-failed query param in its own useEffect.
          console.warn("[google-auth]", e.data.error);
        }
      }
    };
    window.addEventListener("message", onMessage);

    // Fallback: poll for the popup closing (in case the postMessage is missed
    // — e.g. the user closes the popup manually, or the OAuth provider blocks
    // cross-window messaging).
    const interval = window.setInterval(() => {
      if (popup?.closed) {
        cleanup();
        // The cookie was set in the popup; refresh the auth state so the
        // dashboard mounts without a full page reload.
        window.dispatchEvent(new Event("auth-change"));
      }
    }, 400);

    function cleanup() {
      window.removeEventListener("message", onMessage);
      if (interval) window.clearInterval(interval);
    }

    // Safety: clean up the interval after 5 minutes (avoids a leak if the
    // user walks away with the popup open).
    window.setTimeout(cleanup, 5 * 60 * 1000);
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full h-12 rounded-lg bg-white text-zinc-800 border border-zinc-300",
        "flex items-center justify-center gap-3 px-4 font-medium text-sm",
        "shadow-sm hover:shadow-md hover:bg-zinc-50 active:bg-zinc-100",
        "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      aria-label={label}
    >
      {/* Official Google "G" logo (inline SVG — no external request) */}
      <svg
        className="size-5 shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.2-.6-.3-1.25-.3-2.09s.1-1.49.3-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
