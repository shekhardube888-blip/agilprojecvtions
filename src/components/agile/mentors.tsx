import { MENTORS } from "@/lib/data";

export function Mentors() {
  return (
    <section
      id="mentors"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="mentors-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Meet the Mentors
        </div>
        <h2 id="mentors-h2" className="font-bold text-3xl md:text-4xl">
          Learn from <span className="ap-gradient-text">industry veterans</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
          Our mentors are active professionals with 8&ndash;20 years of experience at companies like Texas Instruments, Bosch, Qualcomm &amp; Infosys. They bring real-world context to every session.
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
