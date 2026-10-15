"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Clock, BarChart3, Tag, X, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CatalogProject = {
  id: number;
  name: string;
  tags: string;
  categoryKey: string;
  categoryLabel: string;
  categoryIcon: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
};

// Flatten all CATEGORIES → a single searchable list of projects.
const ALL_PROJECTS: CatalogProject[] = CATEGORIES.flatMap((cat) =>
  cat.projects.map((p, i) => ({
    id: p.id,
    name: p.name,
    tags: p.tags,
    categoryKey: cat.key,
    categoryLabel: cat.label,
    categoryIcon: cat.icon,
    // Assign difficulty based on position in the category (first 3 = Beginner, next 4 = Intermediate, rest = Advanced)
    difficulty: (i < 3 ? "Beginner" : i < 7 ? "Intermediate" : "Advanced") as CatalogProject["difficulty"],
    duration: "6 Weeks",
  }))
);

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const DURATIONS = ["All", "4 Weeks", "6 Weeks", "8 Weeks"] as const;

const ACCENT_COLORS: Record<string, string> = {
  "gen-ai": "text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "cv": "text-violet-500 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
  "ml": "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "nlp": "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  "industry": "text-blue-500 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  "healthcare": "text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
  "security": "text-red-500 dark:text-red-400 bg-red-500/10 border-red-500/20",
  "recommendation": "text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "research": "text-teal-500 dark:text-teal-400 bg-teal-500/10 border-teal-500/20",
  "embedded": "text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
};

export function CourseCatalog() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return ALL_PROJECTS.filter((p) => {
      // Search: match name or tags
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.tags.toLowerCase().includes(q) && !p.categoryLabel.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Domain filter
      if (domainFilter !== "all" && p.categoryKey !== domainFilter) return false;
      // Difficulty filter
      if (difficultyFilter !== "All" && p.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [search, domainFilter, difficultyFilter]);

  const domains = [{ key: "all", label: "All Domains", icon: "🌐" }, ...CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon }))];

  return (
    <section id="catalog" className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Course Catalog
        </div>
        <h2 className="font-bold text-3xl md:text-4xl text-foreground">
          Find Your <span className="ap-gradient-text">Internship Project</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-2xl mx-auto">
          Browse {ALL_PROJECTS.length}+ industry-grade projects across {CATEGORIES.length} domains. Filter by domain, difficulty, or search by technology.
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, technology, or domain… (e.g. RAG, YOLO, Chatbot)"
            className="pl-10 pr-10 h-11 bg-card border-border"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {/* Domain filter */}
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground cursor-pointer"
        >
          {domains.map((d) => (
            <option key={d.key} value={d.key}>{d.icon} {d.label}</option>
          ))}
        </select>

        {/* Difficulty filter */}
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground cursor-pointer"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{d === "All" ? "All Levels" : d}</option>
          ))}
        </select>

        {/* Results count */}
        <span className="text-xs text-muted-foreground ml-2">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
        </span>

        {(search || domainFilter !== "all" || difficultyFilter !== "All") && (
          <button
            onClick={() => { setSearch(""); setDomainFilter("all"); setDifficultyFilter("All"); }}
            className="text-xs text-rose-500 hover:text-rose-400 font-semibold ml-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No projects match your search. Try different keywords or clear the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const accent = ACCENT_COLORS[p.categoryKey] || ACCENT_COLORS["gen-ai"];
            return (
              <div
                key={p.id}
                className="group bg-card border border-border rounded-xl p-5 hover:border-cyan-400/40 hover:shadow-lg transition-all cursor-pointer flex flex-col"
              >
                {/* Top: domain badge + difficulty */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={cn("text-[10px] font-semibold px-2 py-1 rounded-full border", accent)}>
                    {p.categoryIcon} {p.categoryLabel}
                  </span>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-1 rounded-full border",
                    p.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                    p.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                    "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20"
                  )}>
                    {p.difficulty}
                  </span>
                </div>

                {/* Project name */}
                <h3 className="font-semibold text-sm text-foreground leading-tight mb-2 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                  {p.name}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.tags.split(" · ").map((tag, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                  ))}
                </div>

                {/* Footer: duration + CTA */}
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="size-3" /> {p.duration}
                  </span>
                  <a
                    href="#register"
                    className="flex items-center gap-1 text-[10px] font-semibold text-cyan-500 dark:text-cyan-400 hover:gap-2 transition-all"
                  >
                    Enroll <ChevronRight className="size-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA at the bottom */}
      <div className="text-center mt-10">
        <p className="text-sm text-muted-foreground mb-4">
          Can't find what you're looking for? We're adding new projects every month.
        </p>
        <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90">
          <a href="#register">Register for Free</a>
        </Button>
      </div>
    </section>
  );
}
