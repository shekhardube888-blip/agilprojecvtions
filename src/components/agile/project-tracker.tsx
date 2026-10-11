"use client";

import * as React from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Search,
  Loader2,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Rocket,
  GraduationCap,
  X,
  MessageCircle,
  Mail,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { PROJECT_STAGES } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type StudentTracker = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  accountId?: string | null;
  degree: string;
  branch: string;
  college: string;
  plan: string;
  category: string;
  categoryLabel: string;
  project: string;
  paymentStatus: string; // pending | confirmed
  internshipStatus: string; // not_started | in_progress | completed
  currentStage: number; // 0..7
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export function ProjectTracker() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [student, setStudent] = useState<StudentTracker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noRegistration, setNoRegistration] = useState(false);
  const { toast } = useToast();

  // Fetch the logged-in student's record from the session cookie. Reused for
  // both the initial auto-load (on mount) and the "Refresh" button (so the
  // student can pull the latest status — e.g. after admin confirms payment).
  const fetchStudent = React.useCallback(async () => {
    try {
      const res = await fetch("/api/student/me", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStudent({ ...data.student, accountId: data.account?.id || null });
        setNoRegistration(false);
        setError(null);
        return true;
      } else if (res.status === 401) {
        // Not logged in — fall back to the manual lookup form.
        setStudent(null);
        return false;
      } else if (data.code === "NO_REGISTRATION") {
        setStudent(null);
        setNoRegistration(true);
        return false;
      }
      return false;
    } catch {
      // Network error — fall back to manual form silently.
      return false;
    }
  }, []);

  // Auto-fetch on mount.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchStudent();
      if (!cancelled) setAutoLoading(false);
    })();
    return () => { cancelled = true; };
  }, [fetchStudent]);

  // Refresh button handler — re-fetches the latest student record (e.g. after
  // admin confirms payment or advances a stage). Shows a spinner while loading.
  async function refreshStudent() {
    setRefreshing(true);
    try {
      const ok = await fetchStudent();
      if (ok) {
        toast({ title: "Project status refreshed", description: "Latest data loaded." });
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStudent(null);
    if (!email.trim() || !mobile.trim()) {
      setError("Please enter both email and mobile number.");
      return;
    }
    setLoading(true);
    try {
      // Combined lookup + login: verifies email + mobile, sets the session
      // cookie so the student is signed in, and returns the full record.
      const res = await fetch("/api/student/lookup-and-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), mobile: mobile.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Lookup failed");
        return;
      }
      setStudent({ ...data.student, accountId: data.account?.id || null });
      if (data.loggedIn) {
        // The student is now signed in — notify the rest of the page so the
        // dashboard mounts + the header shows their name.
        window.dispatchEvent(new Event("auth-change"));
        toast({ title: `Welcome, ${data.student.firstName}!`, description: "You're now signed in." });
      } else {
        toast({ title: `Welcome, ${data.student.firstName}!` });
      }
    } catch (err) {
      setError((err as Error).message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="project-tracker"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="tracker-h2"
    >
      <div className="text-center mb-8">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          My Internship
        </div>
        <h2 id="tracker-h2" className="font-bold text-3xl md:text-4xl">
          Project <span className="ap-gradient-text">Tracker</span> — step-by-step
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
          Already registered? Enter your email + mobile number below to{" "}
          <strong className="text-foreground">sign in &amp; track</strong> your 6-stage project journey.
          You&apos;ll be logged in automatically. Once the admin confirms your payment and starts your
          internship, your stages unlock one by one.
        </p>
      </div>

      {autoLoading ? (
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-cyan-400" />
          <p className="text-sm text-muted-foreground">Loading your project status…</p>
        </div>
      ) : noRegistration ? (
        <div className="max-w-md mx-auto bg-card border border-amber-500/30 rounded-2xl p-6 text-center">
          <AlertTriangle className="size-8 text-amber-400 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Complete your registration first</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;re signed in, but you haven&apos;t chosen a project yet. Open the Student Dashboard and complete the registration form to start tracking your internship.
          </p>
          <Link href="#register" className="inline-flex items-center gap-1.5 text-sm text-cyan-500 dark:text-cyan-400 font-semibold hover:underline">
            <Rocket className="size-4" /> Register for a project
          </Link>
        </div>
      ) : !student ? (
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6">
          <div className="text-center mb-4">
            <p className="text-xs text-muted-foreground">
              Enter your registration email + mobile number to{" "}
              <strong className="text-foreground">sign in &amp; track</strong> your project.
              You&apos;ll be logged in automatically.
            </p>
          </div>
          <form onSubmit={lookup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tk-email">Email (your login username)</Label>
              <Input
                id="tk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu.in"
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tk-mobile">Mobile Number (used at registration)</Label>
              <Input
                id="tk-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="bg-muted border-border"
                required
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-sm text-rose-500 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 h-10"
            >
              {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Search className="size-4 mr-2" />}
              Sign In &amp; Track Project
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Not registered yet?{" "}
            <Link href="#register" className="text-cyan-500 dark:text-cyan-400 underline underline-offset-4">
              Register free
            </Link>
          </p>
        </div>
      ) : (
        <StudentRoadmap student={student} onRefresh={refreshStudent} refreshing={refreshing} />
      )}
    </section>
  );
}

function StudentRoadmap({ student, onRefresh, refreshing }: { student: StudentTracker; onRefresh: () => void; refreshing: boolean }) {
  const notStarted = student.internshipStatus === "not_started";
  const completed = student.internshipStatus === "completed";
  const current = student.currentStage; // 0 = not started, 1-6 = in-progress stage, 7 = done
  const { toast } = useToast();
  const [training, setTraining] = useState<Record<number, { content: string; loading: boolean }>>({});

  async function startTraining(stage: number) {
    setTraining((t) => ({ ...t, [stage]: { content: t[stage]?.content || "", loading: true } }));
    try {
      const res = await fetch("/api/training/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, project: student.project, categoryLabel: student.categoryLabel }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Training generation failed");
      setTraining((t) => ({ ...t, [stage]: { content: data.content, loading: false } }));
      toast({ title: `Week ${stage} training ready`, description: data.title });
    } catch (err) {
      setTraining((t) => ({ ...t, [stage]: { content: "", loading: false } }));
      toast({ title: "Training failed", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Student header — auto-populated from the logged-in session */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40 mb-6">
        <div className="rounded-2xl bg-popover p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-1">
                {completed ? "Internship Completed" : notStarted ? "Awaiting Start" : "Internship In Progress"}
              </div>
              <h3 className="font-bold text-xl">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {student.degree} · {student.branch} · {student.college}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="bg-secondary border-border text-foreground hover:text-cyan-500 dark:hover:text-cyan-400">
              {refreshing ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <RefreshCw className="size-3.5 mr-1" />}
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </div>

          {/* Auto-populated student identity — User ID, Email, Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5 text-xs">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">User ID</span>
              <span className="font-mono text-foreground truncate" title={student.accountId || student.id}>
                {student.accountId ? student.accountId.slice(0, 16) : student.id.slice(0, 16)}…
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">Email</span>
              <span className="text-foreground truncate" title={student.email}>{student.email}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border">
              <span className="text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">Phone</span>
              <span className="text-foreground">{student.mobile}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <Chip label="Project" value={student.project} accent="text-cyan-500 dark:text-cyan-400" />
            <Chip label="Domain" value={student.categoryLabel} accent="text-cyan-500 dark:text-cyan-400" />
            <Chip label="Plan" value={student.plan} accent="text-violet-600 dark:text-violet-400" />
            <Chip
              label="Payment"
              value={student.paymentStatus === "confirmed" ? "Confirmed" : "Pending"}
              accent={student.paymentStatus === "confirmed" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}
            />
          </div>
        </div>
      </div>

      {/* Awaiting start banner */}
      {notStarted && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 mb-6 flex items-start gap-3">
          <Clock className="size-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-amber-300">Awaiting admin to confirm payment & start your internship</div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Once the admin confirms your payment and clicks "Start Internship", your 6-stage project
              journey unlocks below — one stage at a time. Need to reach the team?
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <a href="https://wa.me/918319985622" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30">
                <MessageCircle className="size-3.5" /> WhatsApp +91 83199 85622
              </a>
              <a href="mailto:hr@agileprojection.com" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25">
                <Mail className="size-3.5" /> hr@agileprojection.com
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Completed banner */}
      {completed && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 mb-6 flex items-start gap-3">
          <CheckCircle2 className="size-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-emerald-300">Congratulations — internship completed!</div>
            <p className="text-sm text-muted-foreground mt-1">
              You finished all 6 stages of your project journey. Your merit certificate will be issued within 7 days.
              {student.completedAt && ` Completed on ${new Date(student.completedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}.`}
            </p>
          </div>
        </div>
      )}

      {/* 6-stage roadmap */}
      <ol className="relative pl-6 border-l border-border space-y-4">
        {PROJECT_STAGES.map((s) => {
          const stageNum = s.step;
          const isDone = current > stageNum || completed;
          const isCurrent = !completed && current === stageNum;
          const isLocked = notStarted;
          const isUpcoming = !notStarted && !isDone && !isCurrent;
          return (
            <li key={s.step} className="relative">
              <span
                className={cn(
                  "absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-[#0B1929]",
                  isDone ? "bg-emerald-400" : isCurrent ? "bg-cyan-400 ap-pulse" : "bg-slate-600"
                )}
                aria-hidden
              />
              <div
                className={cn(
                  "rounded-xl border p-4",
                  isDone
                    ? "border-emerald-500/30 bg-[#0e2a1e]/40"
                    : isCurrent
                    ? "border-cyan-500/40 bg-card shadow-[0_0_24px_-6px_rgba(6,182,212,0.3)]"
                    : "border-border bg-card/50"
                )}
              >
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-lg" aria-hidden>{s.icon}</span>
                  <span className={cn(
                    "inline-flex items-center rounded-md text-[11px] font-bold px-2 py-0.5",
                    isDone ? "bg-emerald-500/20 text-emerald-300" : isCurrent ? "ap-gradient-cyan text-navy" : "bg-secondary text-muted-foreground"
                  )}>
                    {s.week} · Stage {s.step}
                  </span>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="size-3" /> Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      <Loader2 className="size-3 animate-spin" /> In progress
                    </span>
                  )}
                  {isLocked && !isDone && !isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-600/15 text-muted-foreground border border-slate-500/30">
                      <Lock className="size-3" /> Locked
                    </span>
                  )}
                </div>
                <h4 className={cn("text-sm font-semibold", isLocked && !isCurrent ? "text-muted-foreground" : "text-foreground")}>
                  {s.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                <div className="text-[11px] text-cyan-300/80 mt-2 flex items-center gap-1.5">
                  <ArrowRight className="size-3" /> Deliverable: <span className="text-muted-foreground">{s.deliverable}</span>
                </div>

                {/* LLM Start Week X Training */}
                {!notStarted && (
                  <div className="mt-3 border-t border-border pt-3">
                    {training[stageNum]?.content ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-cyan-300 inline-flex items-center gap-1.5">
                            <GraduationCap className="size-3.5" /> {s.week} Training Module
                          </span>
                          <button onClick={() => setTraining((t) => { const n = { ...t }; delete n[stageNum]; return n; })} className="text-muted-foreground hover:text-rose-300 text-[10px]" aria-label="Hide training">
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none bg-muted border border-border rounded-lg p-3 prose-headings:text-foreground prose-h2:text-sm prose-h2:mt-3 prose-h2:mb-1.5 prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-slate-100 prose-code:text-cyan-300 prose-pre:bg-[#0B1929] prose-pre:border-[rgba(6,182,212,0.15)] prose-a:text-cyan-300">
                          <ReactMarkdown>{training[stageNum].content}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => startTraining(stageNum)} disabled={training[stageNum]?.loading} className="h-8 text-xs bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90">
                        {training[stageNum]?.loading ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <GraduationCap className="size-3.5 mr-1.5" />}
                        {training[stageNum]?.loading ? "Generating training\u2026" : `Start ${s.week} Training (LLM)`}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Help CTA */}
      <div className="text-center mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => {
            // First try switching the Student Dashboard tab (if inside the popup)
            window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: "ai-mentor" }));
            // Also try scrolling on the main page (if on the marketing page)
            const el = document.getElementById("ai-assistant");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="bg-popover border-border text-foreground hover:text-cyan-300"
        >
          <Bot className="size-3.5" /> Ask AP-AI Mentor for help with a stage
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: "register" }));
            const el = document.getElementById("register");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="bg-popover border-border text-foreground hover:text-cyan-300"
        >
          <Rocket className="size-4 mr-1.5" /> Register for another project
        </Button>
      </div>
    </div>
  );
}

function Chip({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-muted/60 border border-border rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-xs font-semibold mt-0.5 truncate", accent)} title={value}>{value}</div>
    </div>
  );
}
