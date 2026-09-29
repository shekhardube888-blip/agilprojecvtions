"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, LogOut, Zap, LogIn, UserCircle2, ShieldCheck } from "lucide-react";
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

  const refreshAuth = useCallback(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.ok ? d.user : null))
      .catch(() => setUser(null))
      .finally(() => setBootstrapping(false));
  }, []);

  useEffect(() => {
    refreshAuth();
    const handler = () => refreshAuth();
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, [refreshAuth]);

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
            <span className="size-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white">
              <Zap className="size-4" fill="currentColor" />
            </span>
            <span className="text-foreground">Agile<span className="text-cyan-500">Projection</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="size-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white text-xs font-bold">{initials}</span>
              <span className="text-sm text-foreground">{user.fullName || user.username}</span>
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold", isAdmin ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30" : "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30")}>{isAdmin ? "Admin" : "Student"}</span>
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

          {/* Quick-access cards */}
          <section className="px-5 md:px-[5%] max-w-7xl mx-auto pb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {(isAdmin
                ? [
                    { label: "Students", icon: "👥", desc: "Manage & approve" },
                    { label: "Applications", icon: "📋", desc: "Approval center" },
                    { label: "Certificates", icon: "🏆", desc: "Generate & verify" },
                    { label: "Reports", icon: "📊", desc: "Analytics" },
                  ]
                : [
                    { label: "My Project", href: "#project-tracker", icon: "🔍", desc: "Track 6-stage journey" },
                    { label: "AI Mentor", href: "#ai-assistant", icon: "🤖", desc: "Learning assistant" },
                    { label: "Schedule", href: "#schedule", icon: "📅", desc: "Batch dates" },
                    { label: "FAQ", href: "#faq", icon: "❓", desc: "Questions" },
                  ]
              ).map((c) => (
                <div key={c.label} className="bg-card border border-border rounded-xl p-4 hover:border-cyan-400/40 hover:shadow-md transition-all">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="font-semibold text-foreground text-sm">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground">{c.desc}</div>
                  <div className="text-[10px] text-cyan-500 dark:text-cyan-400 mt-2">{isAdmin ? "Open Admin Dashboard →" : "Open →"}</div>
                </div>
              ))}
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
            <span className="size-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white">
              <Zap className="size-4" fill="currentColor" />
            </span>
            <span className="text-foreground">Agile<span className="text-cyan-500">Projection</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="#register" className="text-sm text-cyan-500 dark:text-cyan-400 hover:text-cyan-600">Register Free →</Link>
          </div>
        </header>

        {/* Main: login card + stats */}
        <main className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: branding + stats */}
            <div className="text-center lg:text-left">
              <h1 className="font-bold text-3xl md:text-5xl text-foreground leading-tight">
                Launch Your <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Engineering Career</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-md mx-auto lg:mx-0">
                Free engineering internships + 80+ AI/ML projects for BE / B.Tech / MCA / M.Tech students. Live mentoring, real projects, AICTE-aligned certificates.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-md mx-auto lg:mx-0">
                {[{n:"10,000+",l:"Students"},{n:"500+",l:"Colleges"},{n:"80+",l:"Projects"},{n:"98%",l:"Completion"}].map(s => (
                  <div key={s.l} className="bg-card border border-border rounded-lg p-3 text-center shadow-sm">
                    <div className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{s.n}</div>
                    <div className="text-[10px] text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: login card */}
            <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="text-center mb-5">
                <div className="size-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-white mx-auto mb-3 shadow-lg">
                  <LogIn className="size-7" />
                </div>
                <h2 className="font-bold text-xl text-foreground">Portal Login</h2>
                <p className="text-xs text-muted-foreground mt-1">Students: use your registration email + mobile. Admin: admin / admin123.</p>
              </div>
              <LoginForm onLoggedIn={(u) => { setUser(u); window.dispatchEvent(new Event("auth-change")); }} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-muted-foreground">
          © 2026 AgileProjection (NT-AI) · <Link href="#register" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600">Register Free</Link> · <a href="https://agileprojection.com" target="_blank" rel="noopener noreferrer" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600">agileprojection.com</a>
        </footer>
      </div>
    </div>
  );
}

// ── Login form (embedded, not a dialog) ──
function LoginForm({ onLoggedIn }: { onLoggedIn: (u: PortalUser) => void }) {
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
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="lu" className="text-xs text-muted-foreground">Username / Email</Label>
        <Input id="lu" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your email or admin" className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-400/50" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lp" className="text-xs text-muted-foreground">Password</Label>
        <Input id="lp" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-400/50" required />
      </div>
      {error && (
        <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5 text-center">{error}</div>
      )}
      <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:opacity-90 h-11 font-semibold shadow-lg shadow-cyan-500/20">
        {loading ? <><Loader2 className="size-4 animate-spin mr-2" /> Signing in…</> : <><LogIn className="size-4 mr-2" /> Sign In</>}
      </Button>
      <div className="flex flex-wrap gap-1.5 justify-center pt-1">
        <button type="button" onClick={() => { setUsername("admin"); setPassword("admin123"); }} className="text-[10px] px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20">admin / admin123</button>
        <button type="button" onClick={() => { setUsername("flow-test@example.com"); setPassword("9999900555"); }} className="text-[10px] px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 hover:bg-violet-500/20">student demo</button>
      </div>
      <p className="text-center text-xs text-muted-foreground pt-2">
        Not registered? <Link href="#register" className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 font-semibold">Register free →</Link>
      </p>
    </form>
  );
}
