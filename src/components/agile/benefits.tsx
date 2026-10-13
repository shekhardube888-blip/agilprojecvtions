import {
  Users,
  FolderKanban,
  Award,
  Briefcase,
  CalendarClock,
  Infinity as InfinityIcon,
  type LucideIcon,
} from "lucide-react";

// Enterprise-grade 6-benefit grid. Declared inline so the section stays
// self-contained and aligned with the new enterprise tone (no emojis,
// concise two-line descriptions).
type Benefit = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

const BENEFITS_ENTERPRISE: Benefit[] = [
  {
    icon: Users,
    title: "Industry Mentor",
    desc: "Live sessions led by working professionals with 8+ years of hands-on engineering experience.",
  },
  {
    icon: FolderKanban,
    title: "Real Projects",
    desc: "Build portfolio-grade deliverables shipped to GitHub — not toy demos or guided worksheets.",
  },
  {
    icon: Award,
    title: "Verifiable Certificate",
    desc: "Earn an AICTE-aligned, QR-secured digital certificate accepted by 50+ engineering colleges.",
  },
  {
    icon: Briefcase,
    title: "Placement Support",
    desc: "Resume reviews, mock interviews, and curated job referrals through our partner network.",
  },
  {
    icon: CalendarClock,
    title: "Flexible Schedule",
    desc: "Evening live sessions plus recorded playbacks — designed around engineering college timetables.",
  },
  {
    icon: InfinityIcon,
    title: "Lifetime Access",
    desc: "Retain lifetime access to course material, project code, and the mentor community alumni channel.",
  },
];

export function Benefits() {
  return (
    <section
      id="benefits"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="benefits-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Why AgileProjection
        </div>
        <h2 id="benefits-h2" className="font-bold text-3xl md:text-4xl">
          Built for{" "}
          <span className="ap-gradient-text">career outcomes</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
<<<<<<< HEAD
          Free does not mean low-quality. Every cohort is mentor-led,
          project-driven, and structured to make you job-ready on completion.
=======
          Free doesn&apos;t mean low-quality. We invest in live mentoring, project work, and career support so you graduate ready for real industry jobs.
>>>>>>> c9094364ff9c76b34705551efe8b0a64d934664d
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {BENEFITS_ENTERPRISE.map((b) => (
          <article
            key={b.title}
<<<<<<< HEAD
            className="ap-lift bg-card border border-border rounded-xl p-5 md:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="size-11 shrink-0 rounded-xl bg-secondary border border-border grid place-items-center">
                <b.icon className="size-5 text-cyan-500 dark:text-cyan-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-foreground leading-tight">
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {b.desc}
                </p>
              </div>
            </div>
=======
            className="ap-lift bg-card border border-border rounded-xl p-6"
          >
            <div className="size-12 rounded-xl bg-secondary border border-border grid place-items-center text-2xl mb-4">
              <span aria-hidden>{b.icon}</span>
            </div>
            <h3 className="text-base font-semibold text-foreground">{b.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{b.desc}</p>
>>>>>>> c9094364ff9c76b34705551efe8b0a64d934664d
          </article>
        ))}
      </div>
    </section>
  );
}
