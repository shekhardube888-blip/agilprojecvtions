import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  FolderKanban,
  Calendar,
  Users,
  Award,
  Wifi,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Trust badges row rendered below the hero CTAs.
// Each badge pairs a Lucide icon with a short enterprise-grade label.
const TRUST_SIGNALS = [
  { icon: Calendar, label: "6-Week Program" },
  { icon: FolderKanban, label: "Real Projects" },
  { icon: Users, label: "Mentor Support" },
  { icon: Award, label: "Certificate Included" },
  { icon: Wifi, label: "100% Online" },
];

// Right-side enterprise stat card. Numbers are kept consistent with the
// counters + AICTE-aligned certificate claim so the page is internally coherent.
const HERO_STATS = [
  {
    icon: Users,
    num: "500+",
    label: "Students Enrolled",
    sub: "Across 50+ engineering colleges",
  },
  {
    icon: FolderKanban,
    num: "80+",
    label: "Industry Projects",
    sub: "AI, ML & Full Stack catalog",
  },
  {
    icon: Calendar,
    num: "6 Weeks",
    label: "Program Duration",
    sub: "Live mentor-led cohorts",
  },
  {
    icon: Award,
    num: "AICTE-Aligned",
    label: "Verifiable Certificate",
    sub: "Issued on completion",
  },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24 ap-grid-pattern"
      aria-labelledby="hero-h1"
    >
      {/* animated beam — preserved from previous design */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="ap-beam absolute -top-32 left-0 h-[480px] w-[260px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.32), transparent 70%)",
          }}
        />
        <div
          className="absolute top-40 right-10 h-[420px] w-[220px] rounded-full blur-3xl opacity-60"
          style={{
            background:
              "radial-gradient(circle at 60% 50%, rgba(37,99,235,0.32), transparent 70%)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 md:px-[5%] grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">
        {/* ─── LEFT: enterprise headline + CTAs + trust signals ─── */}
        <div className="ap-fade-up">
          {/* Compliance / accreditation badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-cyan-500 dark:text-cyan-400 mb-5">
            <ShieldCheck className="size-3.5" />
            AICTE-Aligned · Industry Mentor-Led · Verifiable Certificates
          </div>

          <h1
            id="hero-h1"
            className="font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight"
          >
            Launch Your Engineering Career with{" "}
            <span className="ap-gradient-text">Industry-Grade Internships</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Industry-Grade Internship Programs in AI, ML &amp; Full Stack
            Development. AgileProjection · NT-AI Network delivers mentor-led,
            project-based training for BE / B.Tech / ME / M.Tech / MCA students —
            with verifiable certificates designed for academic credit.
          </p>

          {/* Trust line */}
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-cyan-500 dark:text-cyan-400" />
            Trusted by{" "}
            <strong className="text-foreground font-semibold">500+</strong>{" "}
            engineering students across{" "}
            <strong className="text-foreground font-semibold">50+</strong>{" "}
            colleges
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 text-base h-12 px-6"
            >
              <Link href="#register">
                Start Free Internship <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 border-border text-foreground hover:bg-secondary hover:text-cyan-500 dark:hover:text-cyan-400"
            >
              <Link href="#programs">Explore 80+ Projects</Link>
            </Button>
          </div>

          {/* Trust signals — small badge row */}
          <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {TRUST_SIGNALS.map((t) => (
              <li
                key={t.label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] text-muted-foreground"
              >
                <t.icon className="size-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />
                <span className="truncate">{t.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ─── RIGHT: enterprise trust stat card ─── */}
        <div className="ap-fade-up">
          <div className="relative rounded-2xl border border-border bg-card p-5 md:p-6 shadow-lg shadow-cyan-500/5">
            {/* header */}
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <div className="size-9 rounded-lg ap-gradient-cyan grid place-items-center">
                <Sparkles className="size-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground leading-tight">
                  Program at a glance
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Verified metrics · Updated 2025
                </div>
              </div>
            </div>

            {/* stats grid */}
            <dl className="grid grid-cols-2 gap-3">
              {HERO_STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-muted/40 p-3.5"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <s.icon className="size-3.5 text-cyan-500 dark:text-cyan-400" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {s.label}
                    </span>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold ap-gradient-text leading-none">
                    {s.num}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                    {s.sub}
                  </div>
                </div>
              ))}
            </dl>

            {/* footer note */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-cyan-500 dark:text-cyan-400" />
                AICTE-aligned curriculum
              </span>
              <Link
                href="#register"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-500 dark:text-cyan-400 hover:underline"
              >
                Enroll now <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
