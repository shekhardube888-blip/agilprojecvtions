"use client";

import * as React from "react";
import { CheckCircle2, Gift, ListChecks } from "lucide-react";
import { PROGRAM_DETAILS } from "@/lib/data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ProgramDetails() {
  const [tab, setTab] = React.useState(PROGRAM_DETAILS[0]?.id ?? "");

  // Sync the active tab to the URL hash so #detail-iot / #detail-cap deep-links work.
  React.useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace(/^#detail-/, "");
      if (h && PROGRAM_DETAILS.some((d) => d.id === h)) {
        setTab(h);
      }
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  return (
    <section
      id="program-details"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="program-details-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Curriculum &amp; Outcomes
        </div>
        <h2 id="program-details-h2" className="font-bold text-3xl md:text-4xl">
          What you&apos;ll <span className="ap-gradient-text">build &amp; learn</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-3">
          Weekly curriculum, deliverables, perks and eligibility — for each program. Click a tab to switch tracks.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList
          className="bg-[#0e1b2e] border border-[rgba(6,182,212,0.18)] h-auto flex-wrap rounded-xl p-1.5 gap-1"
          aria-label="Program detail tabs"
        >
          {PROGRAM_DETAILS.map((d) => (
            <TabsTrigger
              key={d.id}
              value={d.id}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/80 data-[state=active]:to-cyan-500/80 data-[state=active]:text-white rounded-md h-9 px-4 text-sm"
            >
              {d.id === "embedded"
                ? "Embedded Systems"
                : d.id === "iot"
                ? "Internet of Things"
                : d.id === "cap"
                ? "Campus Ambassador"
                : d.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {PROGRAM_DETAILS.map((d) => (
          <TabsContent key={d.id} value={d.id} className="mt-6">
            <div id={`detail-${d.id}`} className="scroll-mt-20" />
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
              {/* Left column: intro + curriculum */}
              <div className="bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-foreground">{d.title}</h3>
                <div className="mt-3 space-y-3 text-sm text-slate-400 leading-relaxed">
                  {d.intro.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                <h4 className="text-xs font-semibold tracking-widest uppercase text-cyan-400 mt-6 mb-3">
                  Weekly Curriculum
                </h4>
                <ul className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {d.curriculum.map((c) => (
                    <li
                      key={c.week}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#0e1b2e] border border-[rgba(6,182,212,0.1)]"
                    >
                      <span className="shrink-0 inline-flex items-center rounded-md ap-gradient-cyan text-navy text-[11px] font-bold px-2 py-1">
                        {c.week}
                      </span>
                      <span className="text-sm text-slate-300 leading-relaxed">
                        {c.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right column: 3 cards */}
              <div className="grid gap-4">
                <DetailCard
                  icon={ListChecks}
                  title="What You'll Build"
                  items={d.build}
                  accent="cyan"
                />
                <DetailCard
                  icon={Gift}
                  title="Perks & Recognition"
                  items={d.perks}
                  accent="blue"
                />
                <DetailCard
                  icon={CheckCircle2}
                  title="Eligibility"
                  items={d.eligibility}
                  accent="cyan"
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function DetailCard({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  accent: "cyan" | "blue";
}) {
  return (
    <div className="ap-lift bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={
            "size-8 rounded-md grid place-items-center " +
            (accent === "cyan"
              ? "bg-cyan-500/15 text-cyan-300"
              : "bg-blue-500/15 text-blue-300")
          }
        >
          <Icon className="size-4" />
        </span>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {items.map((it) => (
          <li
            key={it}
            className="flex items-start gap-2 text-sm text-slate-400 leading-relaxed"
          >
            <CheckCircle2 className="size-4 text-cyan-400 mt-0.5 shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
