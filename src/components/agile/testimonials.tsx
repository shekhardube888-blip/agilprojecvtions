import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="testimonials-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Student Stories
        </div>
        <h2 id="testimonials-h2" className="font-bold text-3xl md:text-4xl">
          What our <span className="ap-gradient-text">interns say</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-3">
          Real students, real projects, real career outcomes. 10,000+ engineering students trained across 500+ colleges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <article
            key={t.name}
            className="ap-lift bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-1 text-amber-400 mb-3" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4" fill="currentColor" />
              ))}
            </div>
            <blockquote className="text-sm text-slate-300 leading-relaxed flex-1">
              <span className="text-cyan-400 text-lg leading-none mr-0.5">&ldquo;</span>
              {t.quote}
              <span className="text-cyan-400 text-lg leading-none ml-0.5">&rdquo;</span>
            </blockquote>
            <div className="mt-5 pt-5 border-t border-[rgba(6,182,212,0.12)] flex items-center gap-3">
              <div
                className="size-10 rounded-full grid place-items-center font-semibold text-white text-sm"
                style={{ background: t.color }}
                aria-hidden
              >
                {initials(t.name)}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{t.name}</div>
                <div className="text-xs text-slate-500">{t.info}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
