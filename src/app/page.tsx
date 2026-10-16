"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, LogOut, Zap, LogIn, UserCircle2, ShieldCheck, Users, FileText, Award, BarChart3, Search, Bot, Calendar, HelpCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/agile/theme-toggle";
import { StudentDashboard } from "@/components/agile/student-dashboard";
import { AdminDashboard } from "@/components/agile/admin-dashboard";
import { CustomPages } from "@/components/agile/custom-pages";
import { VisitorStats } from "@/components/agile/visitor-stats";
import { SalesChat } from "@/components/agile/sales-chat";
import { ProjectTracker } from "@/components/agile/project-tracker";
import { CourseCatalog } from "@/components/agile/course-catalog";
import { CategorySelector } from "@/components/agile/category-selector";
import { Footer } from "@/components/agile/footer";
import { Nav } from "@/components/agile/nav";
import { SectionNavigator } from "@/components/agile/section-navigator";
import { GoogleSignInButton } from "@/components/agile/google-sign-in-button";
import { SignupForm } from "@/components/agile/signup-form";
import { cn } from "@/lib/utils";
// Marketing sections (for visitor landing page)
import { Hero } from "@/components/agile/hero";
import { Counters } from "@/components/agile/counters";
import { HowItWorks } from "@/components/agile/how-it-works";
import { Programs } from "@/components/agile/programs";
import { ProgramDetails } from "@/components/agile/program-details";
import { Schedule } from "@/components/agile/schedule";
import { Benefits } from "@/components/agile/benefits";
import { Testimonials } from "@/components/agile/testimonials";
import { About } from "@/components/agile/about";
import { Mentors } from "@/components/agile/mentors";
import { FAQ } from "@/components/agile/faq";
import { Resources } from "@/components/agile/resources";
import { RegisterForm } from "@/components/agile/register-form";
import { Reports } from "@/components/agile/reports";
import { ITCourses } from "@/components/agile/it-courses";
import { Instructors } from "@/components/agile/instructors";
import { AIMLProgram } from "@/components/agile/aiml-program";
import { NTAIMLProject } from "@/components/agile/nt-ai-ml-project";
import { AIAssistant } from "@/components/agile/ai-assistant";
import { Newsletter } from "@/components/agile/newsletter";

type PortalUser = { username: string; role: string; status: string; fullName: string | null };

export default function Home() {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const { toast } = useToast();

  const refreshAuth = useCallback(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.ok ? d.user : null))
      .catch(() => setUser(null))
      .finally(() => setBootstrapping(false));
  }, []);

  useEffect(() => {
    // 1. Bootstrap auth state on mount.
    refreshAuth();
    const handler = () => {
      refreshAuth();
      // Check if a category was selected on the landing page → redirect to register
      try {
        const redirect = localStorage.getItem("redirect-after-login");
        if (redirect === "register") {
          localStorage.removeItem("redirect-after-login");
          // The dashboard will auto-open; the register form reads the selected-subject
          // from localStorage + pre-selects it.
          // Dispatch an event the StudentDashboard can listen for:
          setTimeout(() => window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: "register" })), 500);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener("auth-change", handler);

    // 2. Google OAuth callback handling. After NextAuth redirects the user
    //    back from Google → /api/auth/google-link (the backend route that
    //    links the Google email to the local portal session cookie), we land
    //    back on /?google=1. We refresh auth state + strip the query param.
    //    On failure NextAuth redirects to /?error=<code> → toast.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const googleDone = params.get("google") === "1";
      const errorCode = params.get("error");
      if (googleDone) {
        refreshAuth();
        params.delete("google");
        const remaining = params.toString();
        const newUrl =
          window.location.pathname + (remaining ? `?${remaining}` : "") + window.location.hash;
        window.history.replaceState(null, "", newUrl);
      }
      if (errorCode) {
        // Map NextAuth error codes to human-readable messages.
        const errorMessages: Record<string, { title: string; description: string }> = {
          "google-failed": { title: "Google sign-in failed", description: "Please try again." },
          Configuration: { title: "Server configuration error", description: "NEXTAUTH_SECRET is missing. Add it to .env (see /api/auth/debug-google)." },
          OAuthSigninError: { title: "Google OAuth error", description: "Google rejected the sign-in. Check your GOOGLE_CLIENT_ID + SECRET in .env + the redirect URI in Google Cloud Console." },
          OAuthCallbackError: { title: "Google callback failed", description: "The redirect URI in Google Cloud Console doesn't match. Visit /api/auth/debug-google for the exact URI." },
          OAuthCreateAccountError: { title: "Account creation failed", description: "Couldn't create the Google-linked account. Please try again." },
          AccessDenied: { title: "Access denied", description: "You cancelled the Google consent. Try again and approve the permission request." },
          Verification: { title: "Token verification failed", description: "Your session expired. Please sign in again." },
        };
        const msg = errorMessages[errorCode] || {
          title: "Sign-in error",
          description: `Error code: ${errorCode}. Visit /api/auth/debug-google for diagnostics.`,
        };
        toast({ title: msg.title, description: msg.description, variant: "destructive" });
        params.delete("error");
        const remaining = params.toString();
        const newUrl =
          window.location.pathname + (remaining ? `?${remaining}` : "") + window.location.hash;
        window.history.replaceState(null, "", newUrl);
      }
    }

    return () => window.removeEventListener("auth-change", handler);
  }, [refreshAuth, toast]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // LOGGED IN → DASHBOARD (with LOGOUT button)
  // ════════════════════════════════════════════════════════════
  if (user) {
    const isAdmin = user.role === "admin";
    const initials = (user.fullName || user.username).split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Top bar with LOGOUT */}
        <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/90 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-[5%]">
          <Link href="#top" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <img src="/agileprojection-logo.png" alt="AgileProjection" className="h-7 w-auto rounded-md" />
            <span className="text-muted-foreground/40 hidden sm:inline">|</span>
            <img src="/ntai-logo.png" alt="NT-AI Network" className="h-7 w-auto rounded-md" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="size-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white text-xs font-bold">{initials}</span>
              <span className="text-sm text-foreground">{user.fullName || user.username}</span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold", isAdmin ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-500 dark:text-cyan-400 border-cyan-500/30" : "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30")}>{isAdmin ? "Admin" : "Student"}</span>
            </div>
            <ThemeToggle />
            <Button onClick={logout} size="sm" className="bg-rose-500 hover:bg-rose-600 text-white h-9 px-4 shadow-md shadow-rose-500/20">
              <LogOut className="size-4 mr-1.5" /> Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 pt-16">
          {/* Dashboard banner */}
          <section id="dashboard" className="py-6 md:py-8 px-5 md:px-[5%] max-w-7xl mx-auto">
            <div className="rounded-2xl p-[1px] bg-gradient-to-r from-cyan-400/40 via-blue-500/40 to-cyan-400/40">
              <div className="rounded-2xl bg-card border border-border p-5 md:p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-cyan-500 dark:text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-1">
                      {isAdmin ? "Admin Portal" : "Student Portal"} · NT-AI Network
                    </div>
                    <h2 className="font-bold text-2xl md:text-3xl text-foreground">
                      Welcome, {user.fullName || user.username} 👋
                    </h2>
                    <p className="text-muted-foreground text-xs md:text-sm mt-1.5">
                      {isAdmin ? "Manage students, applications, certificates, reports, and more." : "Register, track your project, ask the AI mentor — all in one dashboard."}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isAdmin ? <AdminDashboard initiallyOpen /> : <StudentDashboard initiallyOpen />}
                    <CustomPages />
                    <div className="bg-muted/50 border border-border rounded-lg px-3 py-1.5"><VisitorStats /></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick-access cards — each with a unique accent color for easy scanning */}
          <section className="px-5 md:px-[5%] max-w-7xl mx-auto pb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(isAdmin
                ? [
                    { label: "Students", icon: <Users className="size-4" />, desc: "Manage & approve", accent: "emerald" },
                    { label: "Applications", icon: <FileText className="size-4" />, desc: "Approval center", accent: "violet" },
                    { label: "Certificates", icon: <Award className="size-4" />, desc: "Generate & verify", accent: "amber" },
                    { label: "Reports", icon: <BarChart3 className="size-4" />, desc: "Analytics", accent: "cyan" },
                  ]
                : [
                    { label: "My Project", href: "#project-tracker", icon: <Search className="size-4" />, desc: "Track 6-stage journey", accent: "cyan" },
                    { label: "AI Mentor", href: "#ai-assistant", icon: <Bot className="size-4" />, desc: "Learning assistant", accent: "violet" },
                    { label: "Schedule", href: "#schedule", icon: <Calendar className="size-4" />, desc: "Batch dates", accent: "emerald" },
                    { label: "FAQ", href: "#faq", icon: <HelpCircle className="size-4" />, desc: "Questions", accent: "amber" },
                  ]
              ).map((c) => {
                const accents: Record<string, { bg: string; text: string; border: string; hover: string }> = {
                  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500 dark:text-cyan-400", border: "border-cyan-500/20", hover: "hover:border-cyan-400/50" },
                  violet: { bg: "bg-violet-500/10", text: "text-violet-500 dark:text-violet-400", border: "border-violet-500/20", hover: "hover:border-violet-400/50" },
                  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", hover: "hover:border-emerald-400/50" },
                  amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20", hover: "hover:border-amber-400/50" },
                };
                const a = accents[c.accent] || accents.cyan;
                return (
                <div key={c.label} className={cn("bg-card border rounded-xl p-4 hover:shadow-md transition-all", a.border, a.hover)}>
                  <div className={cn("size-10 rounded-lg grid place-items-center mb-3", a.bg, a.text)}>{c.icon}</div>
                  <div className="font-semibold text-foreground text-sm">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground">{c.desc}</div>
                  <div className={cn("text-[10px] mt-2 font-semibold", a.text)}>{isAdmin ? "Open Admin Dashboard" : "Open"}</div>
                </div>
                );
              })}
            </div>
          </section>

          {!isAdmin && <ProjectTracker />}
        </main>
        <SalesChat />
        <Footer />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // NOT LOGGED IN → MARKETING LANDING PAGE + LOGIN WALL
  // Visitors see the full marketing page (hero, stats, programs, benefits, etc.)
  // but can't access the dashboard, project tracker, or course catalog without logging in.
  // The login/signup card is a section on the page (#login) so visitors can sign in.
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col bg-background" id="top">
      {/* ── Professional dropdown nav (like agileprojection.com) ── */}
      <Nav />

      {/* Floating section navigator (dots on the right) */}
      <SectionNavigator />

      {/* ── 1. Hero section ── */}
      <Hero />

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 2. Stats / Counters ── */}
      <Counters />

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 3. How it works (5-step timeline) ── */}
      <HowItWorks />

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 4. Programs (internship programs) ── */}
      <Programs />

      {/* ── 4b. Category Selector — choose domain → auto-prompt login → register ── */}
      <CategorySelector />

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 5. Benefits ── */}
      <Benefits />

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 6. Testimonials ── */}
      <Testimonials />

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 7. About ── */}
      <About />

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 8. Login / Signup section (the login wall) ── */}
      <section id="login" className="py-16 md:py-24 px-5 md:px-[5%] max-w-5xl mx-auto scroll-mt-20">
        <div className="text-center mb-8">
          <div className="text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
            {authView === "login" ? "Portal Login" : "Create Account"}
          </div>
          <h2 className="font-bold text-2xl md:text-3xl text-foreground">
            {authView === "login" ? "Sign in to access your dashboard" : "Sign up to start your internship"}
          </h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            {authView === "login"
              ? "Students: sign in with Google or email+password. Admin: use your credentials."
              : "Create a free student account — permanent access, no expiry."}
          </p>
        </div>

        <div className="max-w-md mx-auto bg-card backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-2xl">
          {/* Toggle between login + signup */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg mb-5">
            <button
              type="button"
              onClick={() => setAuthView("login")}
              className={cn("flex-1 py-2 rounded-md text-xs font-semibold transition-colors", authView === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthView("signup")}
              className={cn("flex-1 py-2 rounded-md text-xs font-semibold transition-colors", authView === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
            >
              Sign Up
            </button>
          </div>

          {authView === "login" ? (
            <LoginForm
              onLoggedIn={(u) => { setUser(u); window.dispatchEvent(new Event("auth-change")); }}
              onSwitchToSignup={() => setAuthView("signup")}
            />
          ) : (
            <SignupForm
              onSignedUp={(u) => { setUser(u); window.dispatchEvent(new Event("auth-change")); }}
              onSwitchToLogin={() => setAuthView("login")}
            />
          )}
        </div>

        {/* Trust signals below the login card */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><ShieldCheck className="size-3 text-emerald-500" /> AICTE-Aligned</span>
          <span className="flex items-center gap-1"><ShieldCheck className="size-3 text-emerald-500" /> Industry Mentor-Led</span>
          <span className="flex items-center gap-1"><ShieldCheck className="size-3 text-emerald-500" /> Verifiable Certificates</span>
          <span className="flex items-center gap-1"><ShieldCheck className="size-3 text-emerald-500" /> 100% Online</span>
        </div>
      </section>

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 9. FAQ ── */}
      <FAQ />

      {/* divider */}
      <div className="ap-divider" />

      {/* ── 10. Newsletter ── */}
      <Newsletter />

      {/* ── Footer ── */}
      <Footer />

      {/* Floating Sign In button (mobile) */}
      <a
        href="#login"
        className="sm:hidden fixed bottom-4 right-4 z-50 size-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white grid place-items-center shadow-lg shadow-cyan-500/30"
        aria-label="Sign In"
      >
        <LogIn className="size-5" />
      </a>
    </div>
  );
}

// ── Login form (embedded, not a dialog) ──
function LoginForm({ onLoggedIn, onSwitchToSignup }: { onLoggedIn: (u: PortalUser) => void; onSwitchToSignup: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
        return;
      }
      toast({ title: `Welcome, ${data.user.username}!`, description: data.user.role === "admin" ? "Admin access granted." : "Student access granted." });
      onLoggedIn(data.user);
    } catch (err) {
      setError((err as Error).message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Google Sign-In for students (top of form) */}
      <GoogleSignInButton />

      {/* Divider between Google and the admin-only credentials form */}
      <div className="flex items-center gap-3" aria-hidden>
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="lu" className="text-xs text-muted-foreground">Admin Username / Email</Label>
          <Input id="lu" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin email" className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-400/50" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lp" className="text-xs text-muted-foreground">Admin Password</Label>
          <Input id="lp" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-400/50" required />
        </div>
        {error && (
          <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5 text-center">{error}</div>
        )}
        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:opacity-90 h-11 font-semibold shadow-lg shadow-cyan-500/20">
          {loading ? <><Loader2 className="size-4 animate-spin mr-2" /> Signing in…</> : <><LogIn className="size-4 mr-2" /> Sign In</>}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground pt-1">
          Admin login only. Students use Google Sign-In or sign up below.
        </p>
        <p className="text-center text-xs text-muted-foreground pt-1">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSwitchToSignup} className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 font-semibold">
            Sign up as student
          </button>
        </p>
      </form>
    </div>
  );
}
