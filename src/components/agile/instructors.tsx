import { MENTORS } from "@/lib/data";

export function Instructors() {
  return (
    <section
      id="instructors"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="instructors-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          SkillGorila Faculty
        </div>
        <h2 id="instructors-h2" className="font-bold text-3xl md:text-4xl">
          Learn from the <span className="ap-gradient-text">Top 1% of Industry Professionals</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
          Every IT course on SkillGorila is taught by working practitioners — SAP consultants, cloud architects, full-stack leads, ML engineers &amp; security researchers — not just full-time trainers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {MENTORS.map((m) => (
          <article
            key={m.name}
            className="ap-lift bg-card border border-border rounded-xl p-5 text-center flex flex-col items-center"
          >
            <div
              className="size-16 rounded-full grid place-items-center text-white font-bold text-lg mb-3"
              style={{ background: m.color }}
              aria-hidden
            >
              {m.initials}
            </div>
            <h3 className="text-sm font-semibold text-foreground">{m.name}</h3>
            <div className="text-xs text-cyan-300 mt-0.5">{m.role}</div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{m.exp}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
