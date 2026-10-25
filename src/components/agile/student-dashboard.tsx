"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Rocket, Search, Bot, Calendar, HelpCircle, X, Sparkles, LogOut, ExternalLink, MessageSquare, Code2, AlertTriangle,
  BookOpen, PlayCircle, TrendingUp, CheckCircle2, Loader2, Award, FolderKanban,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisitorStats } from "@/components/agile/visitor-stats";
import { RegisterForm } from "@/components/agile/register-form";
import { ProjectTracker } from "@/components/agile/project-tracker";
import { AIAssistant } from "@/components/agile/ai-assistant";
import { Schedule } from "@/components/agile/schedule";
import { FAQ } from "@/components/agile/faq";
import { CodeRunner } from "@/components/agile/code-runner";
import { LearningPath } from "@/components/agile/learning-path";
import { ProjectLibrary } from "@/components/agile/project-library";
import { cn } from "@/lib/utils";

type TabKey = "overview" | "register" | "track" | "ai-mentor" | "ntai-chat" | "code" | "learning" | "schedule" | "faq" | "library";

const TABS: { key: TabKey; label: string; icon: React.ReactNode; desc: string; accent: string }[] = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" />, desc: "Your dashboard home", accent: "cyan" },
  { key: "register", label: "Register", icon: <Rocket className="size-4" />, desc: "4-step free enrolment", accent: "violet" },
  { key: "track", label: "Track Project", icon: <Search className="size-4" />, desc: "Your 6-stage journey", accent: "cyan" },
  { key: "learning", label: "Learning Path", icon: <BookOpen className="size-4" />, desc: "Structured lessons + progress", accent: "emerald" },
  { key: "ai-mentor", label: "AI Mentor", icon: <Bot className="size-4" />, desc: "Learning assistant", accent: "violet" },
  { key: "library", label: "Project Library", icon: <FolderKanban className="size-4" />, desc: "Browse + download ready-made projects", accent: "violet" },
  { key: "ntai-chat", label: "NT-AI Chatbot", icon: <MessageSquare className="size-4" />, desc: "Coming in v2.0", accent: "slate" },
  { key: "code", label: "Code Playground", icon: <Code2 className="size-4" />, desc: "HTML · CSS · JS live runner", accent: "emerald" },
  { key: "schedule", label: "Schedule", icon: <Calendar className="size-4" />, desc: "Upcoming batches", accent: "amber" },
  { key: "faq", label: "FAQ", icon: <HelpCircle className="size-4" />, desc: "Questions & answers", accent: "amber" },
];

const WRAP = "[&_section]:!py-4 [&_section]:!px-0 [&_section]:!max-w-none [&_section]:!mx-0 [&_section]:!scroll-mt-0";

function TabBody({ k, onJump }: { k: TabKey; onJump: (k: TabKey) => void }) {
  switch (k) {
    case "overview": return <Overview onJump={onJump} />;
    case "register": return <div className={WRAP}><RegisterForm /></div>;
    case "track": return <div className={WRAP}><ProjectTracker /></div>;
    case "ai-mentor": return <div className={WRAP}><AIAssistant /></div>;
    case "ntai-chat": return <NTAIChatbotTab disabled />;
    case "code": return <CodeRunner />;
    case "learning": return <LearningPath />;
    case "library": return <div className={WRAP}><ProjectLibrary /></div>;
    case "schedule": return <div className={WRAP}><Schedule /></div>;
    case "faq": return <div className={WRAP}><FAQ /></div>;
    default: return null;
  }
}

function Overview({ onJump }: { onJump: (k: TabKey) => void }) {
  const [dash, setDash] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/student/dashboard", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.ok) setDash(data.dashboard);
      } catch { /* ignore */ }
      finally { if (!cancelled) setDashLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Personalized dashboard cards ──
  const renderPersonalizedDashboard = () => {
    if (dashLoading) return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
        <Loader2 className="size-4 animate-spin text-cyan-500 dark:text-cyan-400" /> Loading your dashboard…
      </div>
    );

    if (!dash) return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">You haven't registered for an internship yet.</p>
        <button onClick={() => onJump("register")} className="text-xs text-cyan-500 dark:text-cyan-400 font-semibold hover:underline">Register now →</button>
      </div>
    );

    const s = dash.student;
    const i = dash.internship;
    const t = dash.training;
    const na = dash.nextAction;
    const c = dash.certificate;

    return (
      <div className="space-y-4">
        {/* Welcome banner — personalized with student name + project */}
        <div className="rounded-xl p-[1px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40">
          <div className="rounded-xl bg-popover p-5">
            <div className="text-cyan-500 dark:text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-1">
              {i.status === "completed" ? "Internship Completed" : i.status === "in_progress" ? "Internship In Progress" : "Welcome to NT-AI Network"}
            </div>
            <h3 className="font-bold text-xl text-foreground">Welcome back, {s.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {s.project !== "Not selected yet" ? (
                <>Project: <span className="text-foreground font-semibold">{s.project}</span> · {s.categoryLabel}</>
              ) : (
                "Complete your registration to choose a project."
              )}
            </p>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span>{s.degree}</span>
              <span>·</span>
              <span>{s.college}</span>
              {s.subject && <><span>·</span><span>{s.subject}</span></>}
            </div>
          </div>
        </div>

        {/* Dashboard cards — LearnVern-style progress + metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* My Internship */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="size-8 rounded-lg bg-cyan-500/10 grid place-items-center text-cyan-500 dark:text-cyan-400 mb-2"><Rocket className="size-4" /></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">My Internship</div>
            <div className="text-xs font-semibold text-foreground mt-0.5 truncate" title={s.project}>{s.project !== "Not selected yet" ? s.project.slice(0, 20) + "…" : "Not selected"}</div>
          </div>

          {/* Learning Progress */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="size-8 rounded-lg bg-violet-500/10 grid place-items-center text-violet-500 dark:text-violet-400 mb-2"><TrendingUp className="size-4" /></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Learning Progress</div>
            <div className="text-xs font-bold text-foreground mt-0.5">{i.completionPercent}%</div>
            <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all" style={{ width: `${i.completionPercent}%` }} />
            </div>
          </div>

          {/* Training Modules */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="size-8 rounded-lg bg-emerald-500/10 grid place-items-center text-emerald-600 dark:text-emerald-400 mb-2"><BookOpen className="size-4" /></div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Modules Generated</div>
            <div className="text-xs font-bold text-foreground mt-0.5">{t.modulesGenerated} / {t.totalModules}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{t.totalModules - t.modulesGenerated} pending</div>
          </div>

          {/* Certificate Eligibility */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className={cn("size-8 rounded-lg grid place-items-center mb-2", c.eligible ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground")}>
              <Award className="size-4" />
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Certificate</div>
            <div className={cn("text-xs font-bold mt-0.5", c.eligible ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
              {c.issued ? "Issued" : c.eligible ? "Eligible!" : "Not eligible"}
            </div>
            {c.number && <div className="text-[9px] font-mono text-amber-500 dark:text-amber-400 mt-0.5 truncate">{c.number}</div>}
          </div>
        </div>

        {/* Next recommended action — LearnVern-style "continue where you left off" */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-cyan-500/15 grid place-items-center text-cyan-500 dark:text-cyan-400 shrink-0">
                <PlayCircle className="size-5" />
              </div>
              <div>
                <div className="text-[10px] text-cyan-500 dark:text-cyan-400 uppercase tracking-wider font-semibold">Next Action</div>
                <div className="text-sm font-semibold text-foreground mt-0.5">{na.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{na.description}</div>
              </div>
            </div>
            <button
              onClick={() => onJump(na.action as TabKey)}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 font-semibold hover:bg-cyan-500/25 transition-colors whitespace-nowrap"
            >
              Go →
            </button>
          </div>
        </div>

        {/* Pending stages (if any) */}
        {t.pendingStages.length > 0 && i.paymentStatus === "confirmed" && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Pending Training Modules</div>
            <div className="flex flex-wrap gap-2">
              {t.pendingStages.map((ps: any) => (
                <span key={ps.stage} className="text-[10px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {ps.week}: {ps.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Internship timeline */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">Internship Timeline</div>
          <div className="flex items-center gap-1">
            {Array.from({ length: i.totalStages }, (_, idx) => {
              const stageNum = idx + 1;
              const done = stageNum <= i.currentStage;
              const current = stageNum === i.currentStage && i.status === "in_progress";
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className={cn(
                    "size-7 rounded-full grid place-items-center text-[10px] font-bold transition-colors",
                    done ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                    current ? "bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 ring-2 ring-cyan-500/30" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {done ? <CheckCircle2 className="size-3.5" /> : stageNum}
                  </div>
                  <span className={cn("text-[8px] text-center leading-tight", current ? "text-cyan-500 dark:text-cyan-400 font-semibold" : "text-muted-foreground")}>
                    Wk {stageNum}
                  </span>
                </div>
              );
            })}
          </div>
          {i.startedAt && (
            <div className="text-[10px] text-muted-foreground mt-3 text-center">
              Started: {new Date(i.startedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              {i.completedAt && ` · Completed: ${new Date(i.completedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}`}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderPersonalizedDashboard()}

      {/* Quick-access tab cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TABS.filter((t) => t.key !== "overview").map((t) => {
          const accents: Record<string, { bg: string; text: string }> = {
            cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500 dark:text-cyan-400" },
            violet: { bg: "bg-violet-500/10", text: "text-violet-500 dark:text-violet-400" },
            emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
            amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
            slate: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400" },
          };
          const a = accents[t.accent] || accents.cyan;
          return (
          <button key={t.key} type="button" onClick={() => onJump(t.key)} className="group text-left bg-card border border-border rounded-xl p-4 ap-lift hover:border-cyan-400/40">
            <div className="flex items-center gap-2 mb-2"><span className={cn("size-8 rounded-lg grid place-items-center", a.bg, a.text)}>{t.icon}</span><span className="font-semibold text-foreground text-sm">{t.label}</span></div>
            <div className="text-[11px] text-muted-foreground">{t.desc}</div>
            <div className={cn("text-[10px] mt-2 font-semibold", a.text)}>Open tab</div>
          </button>
          );
        })}
      </div>
    </div>
  );
}

// ── NT-AI Chatbot tab — launches the external chatbot in a new tab ──
function NTAIChatbotTab() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8" style={{ minHeight: "400px" }}>
      <div className="size-16 rounded-2xl bg-muted/50 border border-border grid place-items-center text-muted-foreground mx-auto mb-4">
        <MessageSquare className="size-8" />
      </div>
      <h3 className="font-bold text-xl text-foreground">NT-AI Chatbot</h3>
      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
        <AlertTriangle className="size-3" /> Coming in v2.0
      </div>
      <p className="text-sm text-muted-foreground mt-3 max-w-md">
        The NT-AI Network chatbot (powered by OpenAI GPT) will be available in the next version.
        For now, use the <strong className="text-cyan-500">AP-AI Mentor</strong> tab for learning assistance.
      </p>
    </div>
  );
}

export function StudentDashboard({ initiallyOpen }: { initiallyOpen?: boolean } = {}) {
  const [open, setOpen] = useState(initiallyOpen || false);
  const [tab, setTab] = useState<TabKey>("overview");

  // Listen for tab-switch requests from embedded components (e.g. Project Tracker's "Ask AI Mentor" button)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as TabKey;
      if (detail) {
        setTab(detail);
        setOpen(true);
      }
    };
    window.addEventListener("switch-dashboard-tab", handler);
    return () => window.removeEventListener("switch-dashboard-tab", handler);
  }, []);

  return (
    <>
      <Button onClick={() => { setOpen(true); setTab("overview"); }} size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-primary-foreground hover:opacity-90 h-12 px-6 shadow-lg shadow-cyan-500/20">
        <LayoutDashboard className="size-5 mr-2" /> Open Student Dashboard
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-popover border-border text-foreground sm:max-w-3xl lg:sm:max-w-6xl max-h-[92vh] p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted">
            <div className="flex items-center gap-2.5">
              <span className="size-8 rounded-lg ap-gradient-cyan grid place-items-center text-navy"><LayoutDashboard className="size-4" /></span>
              <div><DialogTitle className="font-bold text-base">Student Dashboard</DialogTitle><DialogDescription className="text-[11px] text-muted-foreground">One window · navigate via tabs</DialogDescription></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setOpen(false); window.dispatchEvent(new Event("auth-change")); }} className="inline-flex items-center gap-1.5 text-xs px-3 h-8 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-primary-foreground font-semibold transition-colors">
                <LogOut className="size-3.5" /> Logout
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close" className="size-8 rounded-md grid place-items-center text-muted-foreground hover:text-cyan-500 dark:text-cyan-400 hover:bg-secondary"><X className="size-4" /></button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row max-h-[calc(92vh-64px)]">
            <nav className="sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-border bg-muted/60 p-2 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto">
              {TABS.map((t) => (
                <button key={t.key} type="button" onClick={() => setTab(t.key)} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left", tab === t.key ? "bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30" : "text-foreground hover:bg-secondary hover:text-cyan-500 dark:text-cyan-400 border border-transparent")} aria-current={tab === t.key ? "page" : undefined}>{t.icon}<span>{t.label}</span></button>
              ))}
            </nav>
            <div className="flex-1 overflow-y-auto p-5"><TabBody k={tab} onJump={setTab} /></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
