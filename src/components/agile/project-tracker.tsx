"use client";

import * as React from "react";
import { useState } from "react";
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
  const [student, setStudent] = useState<StudentTracker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStudent(null);
    if (!email.trim() || !mobile.trim()) {
      setError("Please enter both email and mobile.");
      return;
    }
    setLoading(true);
    try {
      const url = `/api/student/lookup?email=${encodeURIComponent(email.trim())}&mobile=${encodeURIComponent(mobile.trim())}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Lookup failed");
        return;
      }
      setStudent(data.student);
      toast({ title: `Welcome, ${data.student.firstName}!` });
    } catch (err) {
      setError((err as Error).message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStudent(null);
    setError(null);
    setEmail("");
    setMobile("");
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
        <p className="text-slate-400 max-w-2xl mx-auto mt-3">
          Registered? Enter your email + mobile to track your 6-stage project journey. Once the admin
          confirms your payment and starts your internship, your stages unlock one by one.
        </p>
      </div>

      {!student ? (
        <div className="max-w-md mx-auto bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-2xl p-6">
          <form onSubmit={lookup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tk-email">Email (used at registration)</Label>
              <Input
                id="tk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu.in"
                className="bg-[#0a1422] border-[rgba(6,182,212,0.18)]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tk-mobile">Mobile (used at registration)</Label>
              <Input
                id="tk-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="bg-[#0a1422] border-[rgba(6,182,212,0.18)]"
                required
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
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
              Track My Project
            </Button>
          </form>
          <p className="text-center text-xs text-slate-500 mt-4">
            Not registered yet?{" "}
            <Link href="#register" className="text-cyan-300 underline underline-offset-4">
              Register free →
            </Link>
          </p>
        </div>
      ) : (
        <StudentRoadmap student={student} onReset={reset} />
      )}
    </section>
  );
}

function StudentRoadmap({ student, onReset }: { student: StudentTracker; onReset: () => void }) {
  const notStarted = student.internshipStatus === "not_started";
  const completed = student.internshipStatus === "completed";
  const current = student.currentStage; // 0 = not started, 1-6 = in-progress stage, 7 = done

  return (
    <div className="max-w-3xl mx-auto">
      {/* Student header */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40 mb-6">
        <div className="rounded-2xl bg-[#0e1b2e] p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-1">
                {completed ? "🎉 Internship Completed" : notStarted ? "Awaiting Start" : "Internship In Progress"}
              </div>
              <h3 className="font-bold text-xl">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {student.degree} · {student.branch} · {student.college}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onReset} className="bg-[#0F2340] border-[rgba(6,182,212,0.22)] text-slate-200 hover:text-cyan-300">
              <RefreshCw className="size-3.5 mr-1" /> Look up another
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Chip label="Project" value={student.project} accent="text-cyan-300" />
            <Chip label="Domain" value={student.categoryLabel} accent="text-cyan-300" />
            <Chip label="Plan" value={student.plan} accent="text-violet-300" />
            <Chip
              label="Payment"
              value={student.paymentStatus === "confirmed" ? "✅ Confirmed" : "⏳ Pending"}
              accent={student.paymentStatus === "confirmed" ? "text-emerald-300" : "text-amber-300"}
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
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Once the admin confirms your payment and clicks "Start Internship", your 6-stage project
              journey unlocks below — one stage at a time. Need to reach the team?
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <a href="https://wa.me/918319985622" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30">
                💬 WhatsApp +91 83199 85622
              </a>
              <a href="mailto:hr@agileprojection.com" className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25">
                ✉️ hr@agileprojection.com
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
            <div className="font-semibold text-emerald-300">🎉 Congratulations — internship completed!</div>
            <p className="text-sm text-slate-400 mt-1">
              You finished all 6 stages of your project journey. Your merit certificate will be issued within 7 days.
              {student.completedAt && ` Completed on ${new Date(student.completedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}.`}
            </p>
          </div>
        </div>
      )}

      {/* 6-stage roadmap */}
      <ol className="relative pl-6 border-l border-[rgba(6,182,212,0.22)] space-y-4">
        {PROJECT_STAGES.map((s) => {
          const stageNum = s.step;
          const isDone = current > stageNum || completed;
          const isCurrent = !completed && current === stageNum;
          const isLocked = notStarted || current < stageNum;
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
                    ? "border-cyan-500/40 bg-[#111f35] shadow-[0_0_24px_-6px_rgba(6,182,212,0.3)]"
                    : "border-[rgba(6,182,212,0.12)] bg-[#111f35]/50"
                )}
              >
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-lg" aria-hidden>{s.icon}</span>
                  <span className={cn(
                    "inline-flex items-center rounded-md text-[11px] font-bold px-2 py-0.5",
                    isDone ? "bg-emerald-500/20 text-emerald-300" : isCurrent ? "ap-gradient-cyan text-navy" : "bg-[#0F2340] text-slate-400"
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
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-600/15 text-slate-400 border border-slate-500/30">
                      <Lock className="size-3" /> Locked
                    </span>
                  )}
                </div>
                <h4 className={cn("text-sm font-semibold", isLocked && !isCurrent ? "text-slate-400" : "text-foreground")}>
                  {s.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                <div className="text-[11px] text-cyan-300/80 mt-2 flex items-center gap-1.5">
                  <ArrowRight className="size-3" /> Deliverable: <span className="text-slate-300">{s.deliverable}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Help CTA */}
      <div className="text-center mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="outline" className="bg-[#0e1b2e] border-[rgba(6,182,212,0.3)] text-slate-200 hover:text-cyan-300">
          <Link href="#ai-assistant">
            🤖 Ask AP-AI Mentor for help with a stage
          </Link>
        </Button>
        <Button asChild variant="outline" className="bg-[#0e1b2e] border-[rgba(6,182,212,0.3)] text-slate-200 hover:text-cyan-300">
          <Link href="#register">
            <Rocket className="size-4 mr-1.5" /> Register for another project
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Chip({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-[#0a1422]/60 border border-[rgba(6,182,212,0.12)] rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={cn("text-xs font-semibold mt-0.5 truncate", accent)} title={value}>{value}</div>
    </div>
  );
}
