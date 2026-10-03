"use client";

import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

/**
 * GoogleSignInButton
 * ------------------
 * A "Sign in with Google" button that uses NextAuth's `signIn("google", …)`
 * client helper to kick off the Google OAuth flow. After Google authenticates
 * the user, NextAuth redirects them to `/api/auth/google-link`, which is a
 * server route (handled by the backend agent) that links the Google email to
 * the local portal session cookie and then redirects back to `/?google=1`.
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
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/api/auth/google-link" })}
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
