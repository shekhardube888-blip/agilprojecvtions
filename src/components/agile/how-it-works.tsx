import { STEPS } from "@/lib/data";

export function HowItWorks() {
  return (
    <section
      id="how"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="how-h2"
    >
      <div className="text-center mb-12">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          How It Works
        </div>
        <h2 id="how-h2" className="font-bold text-3xl md:text-4xl">
          Your path from <span className="ap-gradient-text">enrolment to certificate</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
          Five clear steps — no fee, no documents, no friction. Pick a track, register free, attend live sessions, build your project, and earn your certificate.
        </p>
      </div>

      <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-2">
        {/* connecting line (desktop) */}
        <div
          className="hidden md:block absolute top-[34px] left-[10%] right-[10%] h-px bg-gradient-to-r from-cyan-500/20 via-cyan-500/40 to-cyan-500/20"
          aria-hidden
        />
        {STEPS.map((s) => (
          <li
            key={s.num}
            className="ap-lift relative flex flex-col items-center text-center bg-card border border-border rounded-xl p-5"
          >
            <div className="size-16 rounded-full ap-gradient-cyan grid place-items-center text-navy font-bold text-lg mb-4 relative z-10">
              {s.num}
            </div>
            <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
