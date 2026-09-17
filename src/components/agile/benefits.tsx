import { BENEFITS } from "@/lib/data";

export function Benefits() {
  return (
    <section
      id="benefits"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="benefits-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Why AgileProjection
        </div>
        <h2 id="benefits-h2" className="font-bold text-3xl md:text-4xl">
          The benefits that make us <span className="ap-gradient-text">different</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-3">
          Free doesn&apos;t mean low-quality. We invest in live mentoring, project work, and career support so you graduate ready for real industry jobs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BENEFITS.map((b) => (
          <article
            key={b.title}
            className="ap-lift bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-6"
          >
            <div className="size-12 rounded-xl bg-[#0F2340] border border-[rgba(6,182,212,0.18)] grid place-items-center text-2xl mb-4">
              <span aria-hidden>{b.icon}</span>
            </div>
            <h3 className="text-base font-semibold text-foreground">{b.title}</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{b.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
