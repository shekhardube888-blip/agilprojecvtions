import Link from "next/link";
import { ArrowRight, Clock, Gift, CalendarDays } from "lucide-react";
import { PROGRAMS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const badgeStyle = (t: string): string => {
  switch (t) {
    case "tech":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    case "non-tech":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    default:
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }
};

const metaIcon = (label: string) => {
  if (label.toLowerCase().includes("duration")) return Clock;
  if (label.toLowerCase().includes("cost") || label.toLowerCase().includes("paid")) return Gift;
  return CalendarDays;
};

export function Programs() {
  return (
    <section
      id="programs"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="programs-h2"
    >
      <div className="text-center mb-12">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Internship Programs
        </div>
        <h2 id="programs-h2" className="font-bold text-3xl md:text-4xl">
          Choose your <span className="ap-gradient-text">free internship track</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
          Four tracks covering the entire engineering landscape — from hardware (Embedded / IoT) to software (Full Stack / AI/ML), plus a non-technical leadership track. All live, all project-based, all free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROGRAMS.map((p) => (
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
        ))}
      </div>
    </section>
  );
}
