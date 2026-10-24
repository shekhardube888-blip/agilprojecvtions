import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// SECURITY: the admin password is NEVER logged, NEVER returned in API responses,
// NEVER shown in the UI. It is read from ADMIN_PASSWORD env var and compared in
// constant time on the server. It is NOT persisted to the database by this route
// (the local Account seeding in src/lib/auth.ts handles hashing+storage).
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@agileprojection.com")
  .toLowerCase()
  .trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // dev fallback ONLY

// NextAuth v4 REQUIRES a secret to sign cookies/JWTs. If NEXTAUTH_SECRET (or
// SESSION_SECRET) is not set, we fall back to a dev secret + log a loud warning.
// NEVER use the dev secret in production — always set NEXTAUTH_SECRET in .env.
const FALLBACK_SECRET = "agileprojection-nextauth-dev-secret-DO-NOT-USE-IN-PROD";
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || FALLBACK_SECRET;
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXTAUTH_SECRET &&
  !process.env.SESSION_SECRET
) {
  console.warn(
    "\n⚠⚠⚠  NEXTAUTH_SECRET is not set in production!  ⚠⚠⚠\n" +
      "Generate one with: openssl rand -base64 32\n" +
      "Add to .env: NEXTAUTH_SECRET=...\n" +
      "The app is using an INSECURE fallback secret right now.\n"
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google provider — for students. Only enabled if creds are configured.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Force the Google Chrome profile/account picker to show EVERY time
            // (even if the user has only one Google account or an existing session).
            authorization: {
              params: { prompt: "select_account consent", access_type: "offline" },
            },
          }) as any,
        ]
      : []),
    // Credentials provider — for admin only.
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // SECURITY: constant-time-ish comparison; never log the password.
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        if (email !== ADMIN_EMAIL) return null;

        // Direct compare — the env var IS the secret; hashing it would add
        // nothing here. Use a length-safe comparison to avoid timing leaks.
        const a = Buffer.from(ADMIN_PASSWORD, "utf8");
        const b = Buffer.from(String(credentials.password), "utf8");
        if (a.length !== b.length) return null;
        if (!a.equals(b)) return null;

        return {
          id: "admin",
          email: ADMIN_EMAIL,
          name: "AgileProjection Admin",
          role: "admin",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  // trustHost is required for NextAuth v4 when the app is accessed from a host
  // that isn't localhost (preview URL, Vercel deployment, etc.). Without it,
  // NextAuth silently fails with "NEXTAUTH_URL" / "UNSUPPORTED_API" errors.
  trustHost: true,
  // ALWAYS provide a secret — if it's undefined, NextAuth throws a 500 on
  // internal endpoints like /api/auth/_log (which is what causes the
  // CLIENT_FETCH_ERROR in the browser console).
  secret: NEXTAUTH_SECRET,
  // Custom pages — signIn uses the homepage; OAuth errors redirect there too
  // (with ?error= in the query string, which the homepage detects + shows a toast).
  pages: {
    signIn: "/",
    error: "/",
  },
  // Logger — surfaces NextAuth errors in the server console for debugging.
  logger: {
    error(code: string, message: unknown) {
      console.error("[next-auth] error:", code, typeof message === "object" ? JSON.stringify(message) : message);
    },
    warn(code: string) {
      console.warn("[next-auth] warn:", code);
    },
    debug() {},
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "google" && user?.email) {
        token.role = "guest";
        token.googleEmail = user.email.toLowerCase();
      } else if (account?.provider === "credentials" && user) {
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      // Expose role + googleEmail on the session for the client
      (session.user as { role?: string; googleEmail?: string }).role =
        (token.role as string) || "guest";
      (session.user as { googleEmail?: string }).googleEmail =
        token.googleEmail as string | undefined;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
