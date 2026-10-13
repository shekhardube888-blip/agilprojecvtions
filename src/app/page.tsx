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
import { Footer } from "@/components/agile/footer";
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
    const handler = () => refreshAuth();
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
  // NOT LOGGED IN → BEAUTIFUL LOGIN PAGE
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" aria-hidden />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" aria-hidden />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-5 md:px-[5%] py-4">
          <Link href="#top" className="flex items-center gap-2 font-bold text-lg">
            <img src="/agileprojection-logo.png" alt="AgileProjection" className="h-8 w-auto rounded-md" />
            <span className="text-muted-foreground/40 hidden sm:inline">|</span>
            <img src="/ntai-logo.png" alt="NT-AI Network" className="h-8 w-auto rounded-md" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="#register" className="text-sm text-cyan-500 dark:text-cyan-400 hover:text-cyan-600">Register Free</Link>
          </div>
        </header>

        {/* Main: login card + stats */}
        <main className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: branding + hero image + stats */}
            <div className="text-center lg:text-left">
              <h1 className="font-bold text-3xl md:text-5xl text-foreground leading-tight">
                Launch Your <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Engineering Career</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-md mx-auto lg:mx-0">
                Free engineering internships + 80+ AI/ML projects for BE / B.Tech / MCA / M.Tech students. Live mentoring, real projects, AICTE-aligned certificates.
              </p>
              {/* Professional hero image — attracts students + visual impact */}
              <img
                src="/hero-students.png"
                alt="Engineering students collaborating on AI/ML projects"
                className="w-full rounded-2xl border border-border shadow-lg shadow-cyan-500/10 mt-5 hidden sm:block"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 max-w-md mx-auto lg:mx-0">
                {[{n:"10,000+",l:"Students"},{n:"500+",l:"Colleges"},{n:"80+",l:"Projects"},{n:"98%",l:"Completion"}].map(s => (
                  <div key={s.l} className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <div className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{s.n}</div>
                    <div className="text-[10px] text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
              {/* NT-AI Network presentation image — lower section, below stats */}
              <img
                src="/ntai-presentation.png"
                alt="NT-AI Network training presentation with data dashboards"
                className="w-full rounded-2xl border border-border shadow-lg shadow-cyan-500/10 mt-5 hidden sm:block"
              />
            </div>

            {/* Right: login/signup card */}
            <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="text-center mb-5">
                <div className="size-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white mx-auto mb-3 shadow-lg">
                  {authView === "login" ? <LogIn className="size-7" /> : <UserCircle2 className="size-7" />}
                </div>
                <h2 className="font-bold text-xl text-foreground">
                  {authView === "login" ? "Portal Login" : "Create Student Account"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {authView === "login"
                    ? "Students: sign in with Google or sign up. Admin: use your credentials."
                    : "Sign up with your email + password. Student accounts only — permanent access."}
                </p>
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
          </div>
        </main>

        {/* Project Tracker — visitors can sign in + track with email + mobile */}
        <ProjectTracker />

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-muted-foreground">
          © 2026 AgileProjection (NT-AI) · <Link href="#register" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600">Register Free</Link> · <a href="https://agileprojection.com" target="_blank" rel="noopener noreferrer" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600">agileprojection.com</a>
          <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
            <AlertTriangle className="size-3" /> Version 1.0 — Test Version. Next comes after testing.
          </div>
        </footer>
      </div>
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
