import {
  Users,
  FolderKanban,
  Building2,
  Award,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

// Enterprise metrics — kept inline so the counters section stays
// self-contained (no dependency on data.ts).
type Counter = {
  icon: LucideIcon;
  num: string;
  label: string;
  sub: string;
};

const COUNTERS_ENTERPRISE: Counter[] = [
  {
    icon: Users,
    num: "500+",
    label: "Students Enrolled",
    sub: "Active across batches",
  },
  {
    icon: FolderKanban,
    num: "80+",
    label: "Projects Available",
    sub: "AI · ML · Full Stack",
  },
  {
    icon: Building2,
    num: "50+",
    label: "Partner Colleges",
    sub: "Pan-India network",
  },
  {
    icon: Award,
    num: "200+",
    label: "Certificates Issued",
    sub: "Verifiable · QR-secured",
  },
  {
    icon: TrendingUp,
    num: "94%",
    label: "Completion Rate",
    sub: "Cohort average",
  },
];

export function Counters() {
  return (
    <section
      aria-label="Program metrics"
      className="border-y border-border bg-muted"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-[5%] py-8 md:py-10">
        {/* header strip */}
        <div className="text-center mb-6 md:mb-8">
          <div className="text-cyan-500 dark:text-cyan-400 text-[11px] font-semibold tracking-widest uppercase">
            Outcomes that matter
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Industry-grade metrics, updated every cohort.
          </p>
        </div>

        {/* counters grid — 2 cols on mobile, 5 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {COUNTERS_ENTERPRISE.map((c) => (
            <div
              key={c.label}
              className="flex flex-col items-center text-center rounded-xl border border-border bg-card p-4 md:p-5"
            >
              <div className="size-10 rounded-lg bg-secondary border border-border grid place-items-center mb-3">
                <c.icon className="size-5 text-cyan-500 dark:text-cyan-400" />
              </div>
              <div className="text-2xl md:text-3xl font-bold ap-gradient-text leading-none">
                {c.num}
              </div>
              <div className="text-xs md:text-sm text-foreground font-medium mt-2">
                {c.label}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                {c.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
