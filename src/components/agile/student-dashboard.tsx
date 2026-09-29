"use client";

import * as React from "react";
import { useState } from "react";
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
  { key: "ntai-chat", label: "NT-AI Chatbot", icon: <MessageSquare className="size-4" />, desc: "NT-AI Network chatbot" },
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
    case "ntai-chat": return <NTAIChatbotTab />;
    case "schedule": return <div className={WRAP}><Schedule /></div>;
    case "faq": return <div className={WRAP}><FAQ /></div>;
    default: return null;
  }
}

function Overview({ onJump }: { onJump: (k: TabKey) => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl p-[1px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40">
        <div className="rounded-xl bg-[#0e1b2e] p-5">
          <div className="text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-1">Welcome to AgileProjection · NT-AI Network</div>
          <h3 className="font-bold text-xl">Your student dashboard</h3>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">Free engineering internships + 80+ AI/ML projects for BE / B.Tech / ME / M.Tech / MCA students. Everything you need is one tab away.</p>
          <div className="mt-4 bg-[#0a1422]/70 border border-[rgba(6,182,212,0.22)] rounded-lg px-3 py-2 inline-block">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Live portal traffic</div>
            <VisitorStats />
          </div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {TABS.filter((t) => t.key !== "overview").map((t) => (
          <button key={t.key} type="button" onClick={() => onJump(t.key)} className="group text-left bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-4 ap-lift">
            <div className="flex items-center gap-2 mb-2"><span className="size-8 rounded-lg ap-gradient-cyan grid place-items-center text-navy">{t.icon}</span><span className="font-semibold text-foreground text-sm">{t.label}</span></div>
            <div className="text-[11px] text-slate-400">{t.desc}</div>
            <div className="text-[10px] text-cyan-400 mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open tab →</div>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-[rgba(6,182,212,0.18)] bg-[#111f35] p-4">
        <div className="text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5"><Sparkles className="size-3.5" /> How it works</div>
        <ol className="space-y-1.5 text-xs text-slate-300">
          <li><span className="text-cyan-400 font-semibold">1.</span> <button onClick={() => onJump("register")} className="text-cyan-300 underline underline-offset-2">Register</button> for free.</li>
          <li><span className="text-cyan-400 font-semibold">2.</span> Admin confirms your payment + starts your internship.</li>
          <li><span className="text-cyan-400 font-semibold">3.</span> <button onClick={() => onJump("track")} className="text-cyan-300 underline underline-offset-2">Track your project</button> — 6 stages unlock; click "Start Week X Training (LLM)".</li>
          <li><span className="text-cyan-400 font-semibold">4.</span> <button onClick={() => onJump("ai-mentor")} className="text-cyan-300 underline underline-offset-2">Ask the AI Mentor</button> for help.</li>
        </ol>
      </div>
    </div>
  );
}

// ── NT-AI Chatbot tab — embeds the external NT-AI chatbot via iframe ──
function NTAIChatbotTab() {
  const CHATBOT_URL = "https://m1e8d8j40rg0-d.space-z.ai";
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "500px" }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="size-5 text-cyan-400" />
            NT-AI Chatbot
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Ask the NT-AI Network chatbot anything about your internship, projects, or career.</p>
        </div>
        <a href={CHATBOT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
          <ExternalLink className="size-3.5" /> Open in new tab
        </a>
      </div>
      <div className="flex-1 rounded-xl border border-[rgba(6,182,212,0.22)] overflow-hidden bg-white relative" style={{ minHeight: "450px" }}>
        {!loaded && !error && (
          <div className="absolute inset-0 grid place-items-center bg-[#0e1b2e]">
            <div className="text-center">
              <div className="size-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading NT-AI Chatbot…</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 grid place-items-center bg-[#0e1b2e] text-center p-6">
            <div>
              <p className="text-sm text-slate-400 mb-3">Couldn't load the chatbot inline. Open it in a new tab:</p>
              <a href={CHATBOT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 bg-[#0F2340] border border-[rgba(6,182,212,0.22)] rounded-lg px-4 py-2">
                <ExternalLink className="size-4" /> Open NT-AI Chatbot
              </a>
            </div>
          </div>
        )}
        <iframe
          src={CHATBOT_URL}
          title="NT-AI Chatbot"
          className="w-full h-full border-0"
          style={{ minHeight: "450px" }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          allow="clipboard-write; microphone; camera"
        />
      </div>
    </div>
  );
}

export function StudentDashboard({ initiallyOpen }: { initiallyOpen?: boolean } = {}) {
  const [open, setOpen] = useState(initiallyOpen || false);
  const [tab, setTab] = useState<TabKey>("overview");
  return (
    <>
      <Button onClick={() => { setOpen(true); setTab("overview"); }} size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 h-12 px-6 shadow-lg shadow-cyan-500/20">
        <LayoutDashboard className="size-5 mr-2" /> Open Student Dashboard
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0e1b2e] border-[rgba(6,182,212,0.25)] text-foreground sm:max-w-3xl lg:sm:max-w-6xl max-h-[92vh] p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[rgba(6,182,212,0.18)] bg-[#0a1422]">
            <div className="flex items-center gap-2.5">
              <span className="size-8 rounded-lg ap-gradient-cyan grid place-items-center text-navy"><LayoutDashboard className="size-4" /></span>
              <div><DialogTitle className="font-bold text-base">Student Dashboard</DialogTitle><DialogDescription className="text-[11px] text-slate-500">One window · navigate via tabs</DialogDescription></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setOpen(false); window.dispatchEvent(new Event("auth-change")); }} className="inline-flex items-center gap-1.5 text-xs px-3 h-8 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white font-semibold transition-colors">
                <LogOut className="size-3.5" /> Logout
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close" className="size-8 rounded-md grid place-items-center text-slate-400 hover:text-cyan-300 hover:bg-[#0F2340]"><X className="size-4" /></button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row max-h-[calc(92vh-64px)]">
            <nav className="sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-[rgba(6,182,212,0.18)] bg-[#0a1422]/60 p-2 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto">
              {TABS.map((t) => (
                <button key={t.key} type="button" onClick={() => setTab(t.key)} className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left", tab === t.key ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-[#0F2340] hover:text-cyan-300 border border-transparent")} aria-current={tab === t.key ? "page" : undefined}>{t.icon}<span>{t.label}</span></button>
              ))}
            </nav>
            <div className="flex-1 overflow-y-auto p-5"><TabBody k={tab} onJump={setTab} /></div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
