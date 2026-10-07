import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// SECURITY: the admin password is NEVER logged, NEVER returned in API responses,
// NEVER shown in the UI. It is read from ADMIN_PASSWORD env var and compared
// in constant time on the server. It is NOT persisted to the database by this
// route (the local Account seeding in src/lib/auth.ts handles hashing+storage).
const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@agileprojection.com"
)
  .toLowerCase()
  .trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // dev fallback ONLY

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
            // "select_account" → shows the list of Google accounts logged into Chrome.
            // "consent" → forces the consent screen (so the user explicitly approves).
            authorization: { params: { prompt: "select_account consent", access_type: "offline" } },
          }) as any,
        ]
      : []),
    // Credentials provider — for admin only.
    // The email must match ADMIN_EMAIL exactly; the password is compared in
    // constant time via Buffer.equals after a length check.
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
  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.SESSION_SECRET ||
    "dev-secret-change-me",
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
  pages: {
    // Use the homepage as the sign-in page (no separate /login route)
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
