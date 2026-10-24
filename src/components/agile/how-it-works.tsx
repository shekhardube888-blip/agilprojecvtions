import {
  UserPlus,
  BadgeCheck,
  PlayCircle,
  FolderKanban,
  Award,
  type LucideIcon,
} from "lucide-react";

// Enterprise-grade 5-step flow: Register → Get Approved → Start Training → Build
// Project → Get Certified. Each step pairs a Lucide icon with a concise,
// professional description and renders inside a connected timeline.
type Step = {
  num: string;
  icon: LucideIcon;
  title: string;
  desc: string;
};

const STEPS_ENTERPRISE: Step[] = [
  {
    num: "01",
    icon: UserPlus,
    title: "Register",
    desc: "Sign in with Google and submit your student profile — no documents required, no fee charged at any stage.",
  },
  {
    num: "02",
    icon: BadgeCheck,
    title: "Get Approved",
    desc: "Our team verifies your enrollment and matches you to a track aligned with your degree stream and semester.",
  },
  {
    num: "03",
    icon: PlayCircle,
    title: "Start Training",
    desc: "Join live mentor-led sessions delivered online. Recorded playbacks are available within two hours for revision.",
  },
  {
    num: "04",
    icon: FolderKanban,
    title: "Build Project",
    desc: "Apply what you learn to a real industry project — shipped to GitHub, demo-ready, and reviewable by your mentor.",
  },
  {
    num: "05",
    icon: Award,
    title: "Get Certified",
    desc: "Earn an AICTE-aligned, QR-verifiable digital certificate that is accepted by 50+ engineering colleges.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="how-h2"
    >
      <div className="text-center mb-12">
        <div className="text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          How It Works
        </div>
        <h2 id="how-h2" className="font-bold text-3xl md:text-4xl">
          Your path from{" "}
          <span className="ap-gradient-text">registration to certificate</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
          Five structured steps — no fee, no friction. Register, get approved,
          start training, ship a real project, and earn a verifiable
          certificate.
        </p>
      </div>

      <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2">
        {/* Timeline — horizontal line connecting step icons (desktop only) */}
        <div
          className="hidden md:block absolute top-[42px] left-[10%] right-[10%] h-px bg-gradient-to-r from-cyan-500/20 via-cyan-500/50 to-cyan-500/20"
          aria-hidden
        />
        {/* Timeline dots — small markers between icons to reinforce progression */}
        <div
          className="hidden md:block absolute top-[40px] left-1/2 -translate-x-1/2 size-1 rounded-full bg-cyan-500/40"
          aria-hidden
        />

        {STEPS_ENTERPRISE.map((s) => (
          <li
            key={s.num}
            className="ap-lift relative flex flex-col items-center text-center bg-card border border-border rounded-xl p-5"
          >
            {/* Icon circle with step number badge */}
            <div className="relative z-10 mb-4">
              <div className="size-16 rounded-full ap-gradient-cyan grid place-items-center text-white">
                <s.icon className="size-7" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-card border border-border grid place-items-center text-[10px] font-bold text-cyan-500 dark:text-cyan-400">
                {s.num}
              </span>
            </div>

            <h3 className="text-base font-semibold text-foreground">
              {s.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {s.desc}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
