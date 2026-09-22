"use client";

import * as React from "react";
import { useState } from "react";
import {
  Rocket,
  Search,
  BarChart3,
  Bot,
  Calendar,
  Cpu,
  GraduationCap,
  Brain,
  HelpCircle,
  Sparkles,
  X,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisitorStats } from "@/components/agile/visitor-stats";
import { RegisterForm } from "@/components/agile/register-form";
import { ProjectTracker } from "@/components/agile/project-tracker";
import { Reports } from "@/components/agile/reports";
import { AIAssistant } from "@/components/agile/ai-assistant";
import { Schedule } from "@/components/agile/schedule";
import { Programs } from "@/components/agile/programs";
import { ProgramDetails } from "@/components/agile/program-details";
import { ITCourses } from "@/components/agile/it-courses";
import { NTAIMLProject } from "@/components/agile/nt-ai-ml-project";
import { FAQ } from "@/components/agile/faq";
import { Benefits } from "@/components/agile/benefits";
import { cn } from "@/lib/utils";

type Module = {
  key: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: string; // gradient classes
  badge?: string;
};

const MODULES: Module[] = [
  { key: "register", title: "Register", desc: "4-step free enrolment wizard", icon: <Rocket className="size-5" />, accent: "from-cyan-500 to-blue-600", badge: "Free" },
  { key: "tracker", title: "Project Tracker", desc: "Track your 6-stage journey", icon: <Search className="size-5" />, accent: "from-emerald-500 to-cyan-500" },
  { key: "reports", title: "Reports", desc: "Live registration analytics + CSV", icon: <BarChart3 className="size-5" />, accent: "from-violet-500 to-cyan-500" },
  { key: "ai-mentor", title: "AP-AI Mentor", desc: "Learning assistant for students", icon: <Bot className="size-5" />, accent: "from-blue-600 to-cyan-500", badge: "AI" },
  { key: "schedule", title: "Schedule", desc: "Upcoming internship batches", icon: <Calendar className="size-5" />, accent: "from-amber-500 to-rose-500" },
  { key: "programs", title: "Programs", desc: "4 internship tracks + curriculum", icon: <Cpu className="size-5" />, accent: "from-cyan-500 to-emerald-500" },
  { key: "courses", title: "IT Courses", desc: "SAP, Cloud, DevOps, Cybersecurity", icon: <GraduationCap className="size-5" />, accent: "from-violet-500 to-blue-600" },
  { key: "nt-ai-ml", title: "NT-AI ML Project", desc: "End-to-end housing-price walkthrough", icon: <Brain className="size-5" />, accent: "from-amber-500 to-cyan-500" },
  { key: "benefits", title: "Benefits", desc: "Why AgileProjection", icon: <Sparkles className="size-5" />, accent: "from-emerald-500 to-blue-600" },
  { key: "faq", title: "FAQ", desc: "Everything you want to know", icon: <HelpCircle className="size-5" />, accent: "from-rose-500 to-amber-500" },
];

function ModuleBody({ k }: { k: string }) {
  // Override the section padding/max-width so the module fits a popup cleanly.
  const wrap = " [&_section]:!py-6 [&_section]:!px-0 [&_section]:!max-w-none [&_section]:!mx-0 [&_section]:!scroll-mt-0";
  switch (k) {
    case "register": return <div className={wrap}><RegisterForm /></div>;
    case "tracker": return <div className={wrap}><ProjectTracker /></div>;
    case "reports": return <div className={wrap}><Reports /></div>;
    case "ai-mentor": return <div className={wrap}><AIAssistant /></div>;
    case "schedule": return <div className={wrap}><Schedule /></div>;
    case "programs": return <div className={wrap}><Programs /><ProgramDetails /></div>;
    case "courses": return <div className={wrap}><ITCourses /></div>;
    case "nt-ai-ml": return <div className={wrap}><NTAIMLProject /></div>;
    case "benefits": return <div className={wrap}><Benefits /></div>;
    case "faq": return <div className={wrap}><FAQ /></div>;
    default: return null;
  }
}

export function QuickLaunch() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const current = MODULES.find((m) => m.key === openKey) || null;

  return (
    <section
      id="quick-launch"
      className="py-10 md:py-14 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="ql-h2"
    >
      {/* Hub header — enterprise dashboard feel */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40 mb-6">
        <div className="rounded-2xl bg-[#0e1b2e] p-5 md:p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-1">
                Enterprise Dashboard · NT-AI Network
              </div>
              <h2 id="ql-h2" className="font-bold text-2xl md:text-3xl">
                Quick <span className="ap-gradient-text">Launch</span>
              </h2>
              <p className="text-slate-400 text-xs md:text-sm mt-1">
                Open any module in a popup — no scrolling needed.
              </p>
            </div>
            <div className="bg-[#0a1422]/70 border border-[rgba(6,182,212,0.22)] rounded-lg px-3 py-2">
              <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-1">Live traffic</div>
              <VisitorStats />
            </div>
          </div>
        </div>
      </div>

      {/* Module cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {MODULES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setOpenKey(m.key)}
            className="group relative text-left bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-4 ap-lift overflow-hidden"
            aria-haspopup="dialog"
            aria-expanded={openKey === m.key}
          >
            {m.badge && (
              <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {m.badge}
              </span>
            )}
            <span className={cn("size-10 rounded-lg grid place-items-center text-white bg-gradient-to-br mb-3", m.accent)}>
              {m.icon}
            </span>
            <div className="font-semibold text-foreground text-sm">{m.title}</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{m.desc}</div>
            <div className="text-[10px] text-cyan-400 mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight className="size-3" />
            </div>
          </button>
        ))}
      </div>

      {/* Popup dialog containing the selected module */}
      <Dialog open={!!current} onOpenChange={(o) => !o && setOpenKey(null)}>
        <DialogContent className="bg-[#0e1b2e] border-[rgba(6,182,212,0.25)] text-foreground sm:max-w-3xl lg:sm:max-w-5xl max-h-[88vh] overflow-y-auto">
          <div className="sticky top-0 -mx-6 -mt-6 mb-2 px-6 py-3 bg-[#0e1b2e]/95 backdrop-blur border-b border-[rgba(6,182,212,0.18)] flex items-center gap-3 z-10">
            {current && (
              <span className={cn("size-9 rounded-lg grid place-items-center text-white bg-gradient-to-br", current.accent)}>
                {current.icon}
              </span>
            )}
            <div className="flex-1">
              <DialogTitle className="font-bold text-lg">{current?.title}</DialogTitle>
              <DialogDescription className="text-xs text-slate-400">{current?.desc}</DialogDescription>
            </div>
            <button
              onClick={() => setOpenKey(null)}
              aria-label="Close"
              className="size-8 rounded-md grid place-items-center text-slate-400 hover:text-cyan-300 hover:bg-[#0F2340] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="px-2 pb-2">
            {current && <ModuleBody k={current.key} />}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
