import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Gift,
  CalendarDays,
  Gauge,
  Star,
  type LucideIcon,
} from "lucide-react";
import { PROGRAMS, type Program } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Domain badge style — derives colour from the program's badgeType.
const badgeStyle = (t: string): string => {
  switch (t) {
    case "tech":
      return "bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border-cyan-500/30";
    case "non-tech":
      return "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30";
    default:
      return "bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/30";
  }
};

const metaIcon = (label: string): LucideIcon => {
  if (label.toLowerCase().includes("duration")) return Clock;
  if (label.toLowerCase().includes("cost") || label.toLowerCase().includes("paid"))
    return Gift;
  return CalendarDays;
};

// Per-program enhancement metadata — declared inline so we don't have to
// modify the shared `PROGRAMS` data source (which is consumed by other
// sections). `difficulty` is enterprise-style copy, `popular` flags the
// 1–2 featured cards that render a "Most Popular" ribbon.
type ProgramEnhancement = {
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  popular?: boolean;
};

const ENHANCEMENTS: Record<string, ProgramEnhancement> = {
  embedded: { difficulty: "Intermediate", popular: true },
  iot: { difficulty: "Intermediate", popular: true },
  cap: { difficulty: "Beginner" },
  fullstack: { difficulty: "Advanced" },
};

const difficultyStyle = (d: ProgramEnhancement["difficulty"]): string => {
  switch (d) {
    case "Beginner":
      return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30";
    case "Intermediate":
      return "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30";
    case "Advanced":
      return "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30";
  }
};

function ProgramCard({ p }: { p: Program }) {
  const enhancement = ENHANCEMENTS[p.id] ?? { difficulty: "Intermediate" };
  const Icon = metaIcon(p.meta[0]?.label ?? "Duration");

  return (
    <article
      className="ap-lift relative flex flex-col bg-card border border-border rounded-xl overflow-hidden"
      aria-labelledby={`program-${p.id}-title`}
    >
      {/* "Most Popular" ribbon */}
      {enhancement.popular && (
        <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          <Star className="size-3 fill-white" />
          Most Popular
        </span>
      )}

      {/* Thumbnail header */}
      <div
        className="relative h-28 grid place-items-center text-5xl"
        style={{ background: p.thumb }}
      >
        <span aria-hidden>{p.icon}</span>
        <span className="absolute top-3 right-3">
          <Badge variant="outline" className={badgeStyle(p.badgeType)}>
            {p.badge}
          </Badge>
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Title + difficulty badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            id={`program-${p.id}-title`}
            className="text-base font-semibold text-foreground leading-snug"
          >
            {p.title}
          </h3>
        </div>

        {/* Domain + difficulty + duration metadata strip */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${difficultyStyle(
              enhancement.difficulty,
            )}`}
          >
            <Gauge className="size-3" />
            {enhancement.difficulty}
          </span>
          {p.meta
            .filter((m) =>
              ["Duration", "Cost", "Paid", "Batch Start"].some((k) =>
                m.label.toLowerCase().includes(k.toLowerCase()),
              ),
            )
            .slice(0, 2)
            .map((m) => {
              const I = metaIcon(m.label);
              return (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  <I className="size-3 text-cyan-500 dark:text-cyan-400" />
                  {m.strong}
                </span>
              );
            })}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {p.desc}
        </p>

        {/* Key skills */}
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
            Key skills
          </div>
          <div className="flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] rounded-md bg-secondary border border-border px-2 py-0.5 text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Duration + meta block (full meta) */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-border">
          {p.meta.map((m) => {
            const I = metaIcon(m.label);
            return (
              <div key={m.label} className="text-center">
                <I className="size-4 text-cyan-500 dark:text-cyan-400 mx-auto mb-1" />
                <div className="text-xs font-semibold text-foreground leading-tight">
                  {m.strong}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-5 pt-0 mt-auto flex items-center gap-2">
        <Button
          asChild
          size="sm"
          className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
        >
          <Link href="#register">
            {p.primaryCta} <ArrowRight className="size-3.5" />
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400"
        >
          <Link href={`#detail-${p.id}`}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}

export function Programs() {
  return (
    <section
      id="programs"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="programs-h2"
    >
      <div className="text-center mb-12">
        <div className="text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Internship Programs
        </div>
        <h2 id="programs-h2" className="font-bold text-3xl md:text-4xl">
          Choose your <span className="ap-gradient-text">industry track</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
<<<<<<< HEAD
          Four tracks covering the full engineering landscape — from hardware
          (Embedded / IoT) to software (Full Stack / AI-ML), plus a
          non-technical leadership track. All live, all project-based, all
          mentor-led.
=======
          Four tracks covering the entire engineering landscape — from hardware (Embedded / IoT) to software (Full Stack / AI/ML), plus a non-technical leadership track. All live, all project-based, all free.
>>>>>>> c9094364ff9c76b34705551efe8b0a64d934664d
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROGRAMS.map((p) => (
<<<<<<< HEAD
          <ProgramCard key={p.id} p={p} />
=======
          <article
            key={p.id}
            className="ap-lift flex flex-col bg-card border border-border rounded-xl overflow-hidden"
          >
            <div
              className="relative h-28 grid place-items-center text-5xl"
              style={{ background: p.thumb }}
            >
              <span aria-hidden>{p.icon}</span>
              <span className="absolute top-3 right-3">
                <Badge variant="outline" className={badgeStyle(p.badgeType)}>
                  {p.badge}
                </Badge>
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-foreground leading-snug">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{p.desc}</p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] rounded-md bg-secondary border border-border px-2 py-0.5 text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-border">
                {p.meta.map((m) => {
                  const I = metaIcon(m.label);
                  return (
                    <div key={m.label} className="text-center">
                      <I className="size-4 text-cyan-400 mx-auto mb-1" />
                      <div className="text-xs font-semibold text-foreground leading-tight">
                        {m.strong}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 pt-0 mt-auto flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
              >
                <Link href="#register">
                  {p.primaryCta} <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-muted-foreground hover:text-cyan-300">
                <Link href={`#detail-${p.id}`}>Details</Link>
              </Button>
            </div>
          </article>
>>>>>>> c9094364ff9c76b34705551efe8b0a64d934664d
        ))}
      </div>
    </section>
  );
}
