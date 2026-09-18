import Link from "next/link";
import { ArrowRight, Sparkles, GraduationCap, BadgeCheck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRACK_PILLS = ["Embedded Systems", "Internet of Things", "Campus Ambassador", "Full Stack Dev"];

const TRUST = [
  { icon: BadgeCheck, label: "No Fee · 100% Free" },
  { icon: Award, label: "AICTE-Aligned Certificate" },
  { icon: GraduationCap, label: "Credit-Eligible" },
  { icon: Sparkles, label: "Live Daily Sessions" },
];

const HERO_STATS = [
  { num: "10,000+", label: "Students Trained", sub: "Across 500+ colleges" },
  { num: "70 / 30", label: "Practical / Theory", sub: "Hands-on lab split" },
  { num: "4 Weeks", label: "Per Program", sub: "Project-end capstone" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24 ap-grid-pattern"
      aria-labelledby="hero-h1"
    >
      {/* animated beam */}
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
        <div className="ap-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(6,182,212,0.28)] bg-[#0F2340]/60 px-3 py-1.5 text-xs text-cyan-300 font-medium mb-5">
            <span className="ap-pulse size-2 rounded-full bg-cyan-400" />
            Free Online Internships · 2025–26 Batch Open
          </div>

          <h1
            id="hero-h1"
            className="font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight"
          >
            Launch Your Engineering Career with{" "}
            <span className="ap-gradient-text">Free Industry Internships</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
            AgileProjection · NT-AI Network runs <strong className="text-slate-200">live, mentor-led, project-based internship programs</strong> for BE / B.Tech / ME / M.Tech / MCA students — in Embedded, IoT, AI/ML, Full Stack &amp; Campus Ambassador tracks. Build a real project, earn a verifiable certificate, and get career support — at <strong className="text-cyan-300">zero cost</strong>.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {TRACK_PILLS.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[rgba(6,182,212,0.2)] bg-[#0F2340]/60 px-3 py-1 text-xs text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 text-base h-12 px-6"
            >
              <Link href="#register">
                Register Free — Apply Now <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-6 border-[rgba(6,182,212,0.28)] text-slate-200 hover:bg-[#0F2340] hover:text-cyan-300"
            >
              <Link href="#programs">Explore Programs</Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
            {TRUST.map((t) => (
              <li key={t.label} className="inline-flex items-center gap-1.5">
                <t.icon className="size-4 text-cyan-400" />
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: stat cards */}
        <div className="ap-fade-up grid gap-4">
          {HERO_STATS.map((s, i) => (
            <div
              key={s.label}
              className="ap-lift bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-5 flex items-center justify-between"
              style={{ marginLeft: i === 1 ? "1.5rem" : i === 2 ? "3rem" : 0 }}
            >
              <div>
                <div className="text-3xl md:text-4xl font-bold ap-gradient-text">{s.num}</div>
                <div className="text-sm text-slate-200 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
              <div className="size-12 rounded-xl ap-gradient-cyan grid place-items-center text-navy text-xl font-bold opacity-90">
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
