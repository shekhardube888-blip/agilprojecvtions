"use client";

import { useState, useEffect } from "react";
import { Bot, Cpu, Code2, Brain, Briefcase, Building2, HardHat, MoreHorizontal, ChevronRight, X, Search, FolderTree, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/data";

const SUBJECT_TO_CATEGORY: Record<string, string[]> = {
  "ai-ml": ["gen-ai", "cv", "ml", "nlp", "industry", "healthcare", "security", "recommendation", "research"],
  "cs": ["gen-ai", "ml", "security", "recommendation"],
  "ece": ["industry", "cv"],
  "mech": ["industry"],
  "mba": ["recommendation", "ml"],
  "bba": ["recommendation"],
  "civil": ["industry"],
  "other": [],
};

const CATEGORIES_MAP: Record<string, { label: string; sub: string; icon: string; projects: { id: number; name: string; tags: string }[] }> =
  Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

export function CategorySelector() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Check if student is already logged in
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setIsLoggedIn(d.ok && !!d.user))
      .catch(() => setIsLoggedIn(false));
  }, []);

  function selectCategory(key: string) {
    setSelectedSubject(key);
    setExpandedCats(new Set()); // reset expanded
    try {
      localStorage.setItem("selected-subject", key);
      localStorage.setItem("redirect-after-login", "register");
    } catch { /* ignore */ }
    setTimeout(() => {
      document.getElementById("project-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  // If logged in → go to dashboard register tab; if not → scroll to login
  function proceedToRegistration() {
    try {
      localStorage.setItem("redirect-after-login", "register");
    } catch { /* ignore */ }
    if (isLoggedIn) {
      // Already logged in → dispatch event to open dashboard + register tab
      window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: "register" }));
    } else {
      // Not logged in → scroll to login
      document.querySelector("#login")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Get projects grouped by category (hierarchical)
  const subjectCategories = selectedSubject
    ? SUBJECT_TO_CATEGORY[selectedSubject]?.map((catKey: string) => {
        const cat = CATEGORIES_MAP[catKey];
        if (!cat) return null;
        const projects = search
          ? cat.projects.filter((p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.tags.toLowerCase().includes(search.toLowerCase())
            )
          : cat.projects;
        return { key: catKey, label: cat.label, sub: cat.sub, icon: cat.icon, projects };
      }).filter(Boolean) || []
    : [];

  const totalProjects = subjectCategories.reduce((sum, c) => sum + (c?.projects.length || 0), 0);

  function toggleCat(key: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const CATEGORIES_CARDS = [
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

  const selectedCat = CATEGORIES_CARDS.find((c) => c.key === selectedSubject);

  return (
    <section id="categories" className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20">
      {/* Subject cards */}
      <div className="text-center mb-8">
        <div className="text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Internship Categories
        </div>
        <h2 className="font-bold text-3xl md:text-4xl text-foreground">
          Choose Your <span className="ap-gradient-text">Domain</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-2xl mx-auto">
          Select your field of interest to see available projects organized by category. {CATEGORIES_CARDS.length} domains, 84+ projects.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES_CARDS.map((cat) => {
          const Icon = cat.icon;
          const a = ACCENTS[cat.accent] || ACCENTS.cyan;
          const isSelected = selectedSubject === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => selectCategory(cat.key)}
              className={cn(
                "group text-left bg-card border rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-0.5",
                isSelected ? cn(a.border, "ring-2 ring-offset-2 ring-offset-background", a.text) : cn(a.border, a.hover)
              )}
            >
              <div className={cn("size-10 rounded-lg grid place-items-center mb-3", a.bg, a.text)}>
                <Icon className="size-5" />
              </div>
              <div className="font-semibold text-sm text-foreground mb-1">{cat.label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mb-2">{cat.desc}</div>
              <div className={cn("text-[10px] font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all", a.text)}>
                {isSelected ? "Selected ✓" : <>Select <ChevronRight className="size-3" /></>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hierarchical project list for selected subject */}
      {selectedSubject && selectedCat && (
        <div id="project-list" className="mt-8 scroll-mt-20">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FolderTree className="size-5 text-cyan-500 dark:text-cyan-400" />
              <div>
                <h3 className="font-bold text-lg text-foreground">{selectedCat.label} — Project Catalog</h3>
                <p className="text-xs text-muted-foreground">{subjectCategories.length} categories · {totalProjects} projects total</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {search && (
                <button onClick={() => setSearch("")} className="text-[10px] text-rose-500 font-semibold">Clear search</button>
              )}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="pl-8 pr-3 h-8 rounded-lg border border-border bg-muted text-xs text-foreground w-48"
                />
              </div>
              <button onClick={() => { setSelectedSubject(null); setSearch(""); }} className="text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X className="size-3" /> Close
              </button>
            </div>
          </div>

          {/* Hierarchical list: Category → Projects (accordion) */}
          <div className="space-y-3">
            {subjectCategories.map((catData) => {
              const cat = catData as { key: string; label: string; sub: string; icon: string; projects: { id: number; name: string; tags: string }[] };
              const isExpanded = expandedCats.has(cat.key) || !!search; // auto-expand when searching
              const projectCount = cat.projects.length;
              return (
                <div key={cat.key} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Category header (click to expand) */}
                  <button
                    onClick={() => toggleCat(cat.key)}
                    className="w-full flex items-center justify-between gap-3 p-4 hover:bg-secondary/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{cat.label}</div>
                        <div className="text-[10px] text-muted-foreground">{cat.sub}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-semibold">
                        {projectCount} {projectCount === 1 ? "project" : "projects"}
                      </span>
                      <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
                    </div>
                  </button>

                  {/* Project list (expanded) */}
                  {isExpanded && projectCount > 0 && (
                    <div className="border-t border-border divide-y divide-border/50">
                      {cat.projects.map((p) => (
                        <div key={p.id} className="flex items-start justify-between gap-3 p-3 hover:bg-secondary/20 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs text-foreground">{p.name}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.tags.split(" · ").map((tag, i) => (
                                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={proceedToRegistration}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 hover:bg-cyan-500/20 font-semibold whitespace-nowrap flex items-center gap-1 shrink-0"
                          >
                            {isLoggedIn ? <><CheckCircle2 className="size-3" /> Register</> : <>Select <ChevronRight className="size-3" /></>}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty state for search */}
                  {isExpanded && projectCount === 0 && (
                    <div className="border-t border-border p-3 text-center text-[10px] text-muted-foreground">
                      No projects match your search in this category.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-6">
            <button
              onClick={proceedToRegistration}
              className="text-sm px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 inline-flex items-center gap-2"
            >
              {isLoggedIn ? (
                <><CheckCircle2 className="size-4" /> Go to Registration →</>
              ) : (
                <>Sign In to Register →</>
              )}
            </button>
            <p className="text-[10px] text-muted-foreground mt-2">
              {isLoggedIn
                ? "You're logged in — click to go straight to the registration form"
                : "Plans from ₹1,499 · UPI / Card / Net Banking · AICTE-Aligned Certificate"
              }
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
