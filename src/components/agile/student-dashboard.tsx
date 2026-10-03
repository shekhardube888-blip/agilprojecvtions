"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Rocket, Search, Bot, Calendar, HelpCircle, X, Sparkles, LogOut, ExternalLink, MessageSquare,
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
import { cn } from "@/lib/utils";

type TabKey = "overview" | "register" | "track" | "ai-mentor" | "ntai-chat" | "schedule" | "faq";

const TABS: { key: TabKey; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" />, desc: "Your dashboard home" },
  { key: "register", label: "Register", icon: <Rocket className="size-4" />, desc: "4-step free enrolment" },
  { key: "track", label: "Track Project", icon: <Search className="size-4" />, desc: "Your 6-stage journey" },
  { key: "ai-mentor", label: "AI Mentor", icon: <Bot className="size-4" />, desc: "Learning assistant" },
  { key: "ntai-chat", label: "NT-AI Chatbot", icon: <MessageSquare className="size-4" />, desc: "Coming in v2.0" },
  { key: "schedule", label: "Schedule", icon: <Calendar className="size-4" />, desc: "Upcoming batches" },
  { key: "faq", label: "FAQ", icon: <HelpCircle className="size-4" />, desc: "Questions & answers" },
];

const WRAP = "[&_section]:!py-4 [&_section]:!px-0 [&_section]:!max-w-none [&_section]:!mx-0 [&_section]:!scroll-mt-0";

function TabBody({ k, onJump }: { k: TabKey; onJump: (k: TabKey) => void }) {
  switch (k) {
    case "overview": return <Overview onJump={onJump} />;
    case "register": return <div className={WRAP}><RegisterForm /></div>;
    case "track": return <div className={WRAP}><ProjectTracker /></div>;
    case "ai-mentor": return <div className={WRAP}><AIAssistant /></div>;
    case "ntai-chat": return <NTAIChatbotTab disabled />;
    case "schedule": return <div className={WRAP}><Schedule /></div>;
    case "faq": return <div className={WRAP}><FAQ /></div>;
    default: return null;
  }
}

function Overview({ onJump }: { onJump: (k: TabKey) => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl p-[1px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40">
        <div className="rounded-xl bg-popover p-5">
          <div className="text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-1">Welcome to AgileProjection · NT-AI Network</div>
          <h3 className="font-bold text-xl">Your student dashboard</h3>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">Free engineering internships + 80+ AI/ML projects for BE / B.Tech / ME / M.Tech / MCA students. Everything you need is one tab away.</p>
          <div className="mt-4 bg-muted/70 border border-border rounded-lg px-3 py-2 inline-block">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Live portal traffic</div>
            <VisitorStats />
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TABS.filter((t) => t.key !== "overview").map((t) => (
          <button key={t.key} type="button" onClick={() => onJump(t.key)} className="group text-left bg-card border border-border rounded-xl p-4 ap-lift">
            <div className="flex items-center gap-2 mb-2"><span className="size-8 rounded-lg ap-gradient-cyan grid place-items-center text-navy">{t.icon}</span><span className="font-semibold text-foreground text-sm">{t.label}</span></div>
            <div className="text-[11px] text-muted-foreground">{t.desc}</div>
            <div className="text-[10px] text-cyan-400 mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open tab →</div>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5"><Sparkles className="size-3.5" /> How it works</div>
        <ol className="space-y-1.5 text-xs text-foreground">
          <li><span className="text-cyan-400 font-semibold">1.</span> <button onClick={() => onJump("register")} className="text-cyan-500 dark:text-cyan-400 underline underline-offset-2">Register</button> for free.</li>
          <li><span className="text-cyan-400 font-semibold">2.</span> Admin confirms your payment + starts your internship.</li>
          <li><span className="text-cyan-400 font-semibold">3.</span> <button onClick={() => onJump("track")} className="text-cyan-500 dark:text-cyan-400 underline underline-offset-2">Track your project</button> — 6 stages unlock; click "Start Week X Training (LLM)".</li>
          <li><span className="text-cyan-400 font-semibold">4.</span> <button onClick={() => onJump("ai-mentor")} className="text-cyan-500 dark:text-cyan-400 underline underline-offset-2">Ask the AI Mentor</button> for help.</li>
        </ol>
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
        ⚠ Coming in v2.0
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
