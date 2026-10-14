"use client";

import { Bot, Cpu, Code2, Brain, Briefcase, Building2, HardHat, MoreHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "ai-ml", label: "AI / Machine Learning", desc: "Generative AI, LLMs, Computer Vision, NLP, Deep Learning", icon: Bot, accent: "cyan" },
  { key: "cs", label: "Computer Science", desc: "Full Stack, DSA, System Design, Cloud, DevOps", icon: Code2, accent: "violet" },
  { key: "ece", label: "Electronics & Communication", desc: "Embedded Systems, IoT, VLSI, Signal Processing", icon: Cpu, accent: "emerald" },
  { key: "mech", label: "Mechanical Engineering", desc: "CAD/CAM, Robotics, Automotive, Manufacturing", icon: HardHat, accent: "amber" },
  { key: "mba", label: "MBA / Management", desc: "Business Analytics, Marketing, Finance, Operations", icon: Briefcase, accent: "rose" },
  { key: "bba", label: "BBA / Business", desc: "Entrepreneurship, Digital Marketing, HR, Supply Chain", icon: Building2, accent: "blue" },
  { key: "civil", label: "Civil Engineering", desc: "Structural, Construction Mgmt, Smart Cities, GIS", icon: Building2, accent: "teal" },
  { key: "other", label: "Other (coming v2.0)", desc: "We're adding more domains — tell us yours in the notes", icon: MoreHorizontal, accent: "slate" },
];

const ACCENTS: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500 dark:text-cyan-400", border: "border-cyan-500/20", hover: "hover:border-cyan-400/50 hover:shadow-cyan-500/10" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500 dark:text-violet-400", border: "border-violet-500/20", hover: "hover:border-violet-400/50 hover:shadow-violet-500/10" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", hover: "hover:border-emerald-400/50 hover:shadow-emerald-500/10" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20", hover: "hover:border-amber-400/50 hover:shadow-amber-500/10" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20", hover: "hover:border-rose-400/50 hover:shadow-rose-500/10" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", border: "border-blue-500/20", hover: "hover:border-blue-400/50 hover:shadow-blue-500/10" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-500 dark:text-teal-400", border: "border-teal-500/20", hover: "hover:border-teal-400/50 hover:shadow-teal-500/10" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", border: "border-slate-500/20", hover: "hover:border-slate-400/50 hover:shadow-slate-500/10" },
};

export function CategorySelector() {
  function selectCategory(key: string) {
    // Store the selected category so the registration form can pre-select it after login
    try {
      localStorage.setItem("selected-subject", key);
      localStorage.setItem("redirect-after-login", "register");
    } catch { /* ignore */ }
    // Scroll to the login section
    document.querySelector("#login")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section id="categories" className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center mb-8">
        <div className="text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Internship Categories
        </div>
        <h2 className="font-bold text-3xl md:text-4xl text-foreground">
          Choose Your <span className="ap-gradient-text">Domain</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-2xl mx-auto">
          Select your field of interest to start the internship registration. 80+ projects available across {CATEGORIES.length} domains.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const a = ACCENTS[cat.accent] || ACCENTS.cyan;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => selectCategory(cat.key)}
              className={cn(
                "group text-left bg-card border rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-0.5",
                a.border, a.hover
              )}
            >
              <div className={cn("size-10 rounded-lg grid place-items-center mb-3", a.bg, a.text)}>
                <Icon className="size-5" />
              </div>
              <div className="font-semibold text-sm text-foreground mb-1">{cat.label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mb-2">{cat.desc}</div>
              <div className={cn("text-[10px] font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all", a.text)}>
                Select <ChevronRight className="size-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA below the grid */}
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground mb-4">
          Click a category to sign in + register. Your internship starts after payment confirmation.
        </p>
        <div className="inline-flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">Plans from ₹1,499</span>
          <span>·</span>
          <span>UPI / Card / Net Banking</span>
          <span>·</span>
          <span>AICTE-Aligned Certificate</span>
        </div>
      </div>
    </section>
  );
}
