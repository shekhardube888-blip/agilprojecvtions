"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Wraps the Next.js App Router with NextAuth's client-side SessionProvider.
 * Lets any client component call `useSession()` from "next-auth/react" to
 * read the active Google / Credentials session (used by the AgileProjection
 * portal for student Google Sign-In and admin Credentials login).
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
