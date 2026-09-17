import Link from "next/link";
import { ArrowRight, Star, Settings, Zap } from "lucide-react";
import { COURSES } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PILL_CATEGORIES = [
  "All",
  "SAP Modules",
  "Cloud & BTP",
  "Programming",
  "AI & ML",
  "Data & Analytics",
  "Cloud & DevOps",
  "Cybersecurity",
  "Business",
];

const badgeClass = (cls: string): string => {
  switch (cls) {
    case "cyan":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    case "amber":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "red":
      return "bg-red-500/15 text-red-300 border-red-500/30";
    case "indigo":
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    case "green":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
};

export function ITCourses() {
  return (
    <section
      id="it-courses"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="it-courses-h2"
    >
      {/* Partnership banner */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40 mb-6">
        <div className="rounded-2xl bg-[#0e1b2e] px-5 py-4 flex items-center gap-4">
          <span className="size-10 rounded-xl ap-gradient-cyan grid place-items-center text-navy">
            <Zap className="size-5" fill="currentColor" />
          </span>
          <div className="flex-1">
            <div className="text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-0.5">
              Powered by SkillGorila Partnership
            </div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              86 industry-ready IT courses on SkillGorila — every one free for AgileProjection students.
            </div>
          </div>
        </div>
      </div>

      {/* SAP feature banner */}
      <div className="rounded-2xl border border-[rgba(6,182,212,0.22)] bg-gradient-to-br from-[#0a2a20] via-[#071a30] to-[#1a0a30] p-6 md:p-8 mb-8 grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
        <div>
          <div className="text-amber-300 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-2">
            <Settings className="size-4" /> Master SAP
          </div>
          <h2 id="it-courses-h2" className="font-bold text-2xl md:text-3xl">
            India&apos;s #1 SAP Training Platform
          </h2>
          <p className="text-sm text-slate-400 mt-3 leading-relaxed max-w-xl">
            SAP Ariba, BTP, S/4HANA MM, and SAP AI Core — with real sandbox access, live mentor-led sessions, and certification aligned with SAP&apos;s official curriculum. The fastest path to a high-paying SAP consultant role in India.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["SAP Ariba", "SAP BTP", "SAP S/4HANA MM", "SAP AI Core", "Generative AI for SAP"].map((t) => (
              <span
                key={t}
                className="text-[11px] rounded-md bg-[#0F2340] border border-[rgba(6,182,212,0.18)] px-2 py-1 text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-[#0a1422] border border-[rgba(6,182,212,0.18)] rounded-xl p-5 text-center">
          <div className="text-4xl font-bold ap-gradient-text">95%</div>
          <div className="text-sm text-slate-300 mt-1">Placement Rate</div>
          <div className="text-xs text-slate-500 mt-1">SAP-certified alumni placed across 200+ Indian enterprises</div>
        </div>
      </div>

      {/* Filter pills (decorative) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PILL_CATEGORIES.map((p, i) => (
          <button
            key={p}
            type="button"
            className={
              "text-xs px-3 py-1.5 rounded-full border transition-all " +
              (i === 0
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                : "bg-[#0F2340] text-slate-400 border-[rgba(6,182,212,0.18)] hover:text-cyan-300 hover:border-cyan-500/30")
            }
          >
            {p}
          </button>
        ))}
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COURSES.map((c) => (
          <article
            key={c.title}
            className="ap-lift flex flex-col bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl overflow-hidden"
          >
            <div
              className="relative h-24 grid place-items-center text-4xl"
              style={{ background: c.thumb }}
            >
              <span aria-hidden>{c.icon}</span>
              <div className="absolute top-2 right-2 flex flex-wrap gap-1.5 justify-end">
                {c.badges.map((b) => (
                  <Badge
                    key={b.label}
                    variant="outline"
                    className={badgeClass(b.cls)}
                  >
                    {b.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-foreground leading-snug">{c.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed flex-1">{c.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {c.meta.map((m) => (
                  <span
                    key={m}
                    className="text-[10px] text-slate-500 bg-[#0a1422] border border-[rgba(6,182,212,0.1)] rounded px-1.5 py-0.5"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <Star className="size-3.5" fill="currentColor" />
                  <span className="text-slate-300 font-medium">{c.rating}</span>
                  <span className="text-slate-500">· {c.reviews}</span>
                </div>
              </div>
            </div>
            <div className="p-5 pt-0 mt-auto flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Price</div>
                <div className="text-emerald-300 font-bold text-sm">{c.price}</div>
              </div>
              <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90">
                <a
                  href="https://www.skillgorila.com/s/store"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enroll Now <ArrowRight className="size-3.5" />
                </a>
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button asChild variant="outline" className="border-[rgba(6,182,212,0.28)] text-slate-200 hover:bg-[#0F2340] hover:text-cyan-300">
          <a
            href="https://www.skillgorila.com/s/store"
            target="_blank"
            rel="noopener noreferrer"
          >
            View All 86 Courses on SkillGorila <ArrowRight className="size-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
