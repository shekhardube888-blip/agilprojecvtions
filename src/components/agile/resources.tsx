import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RESOURCES } from "@/lib/data";

export function Resources() {
  return (
    <section
      id="resources"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="resources-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Free Resources
        </div>
        <h2 id="resources-h2" className="font-bold text-3xl md:text-4xl">
          Tools to <span className="ap-gradient-text">keep you learning</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-3">
          Beyond the internship programs — a free library, an AI mentor, an end-to-end ML project guide, and our career blog.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {RESOURCES.map((r) => {
          const internal = r.href.startsWith("#");
          return (
            <article
              key={r.title}
              className="ap-lift bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-6 flex flex-col"
            >
              <div className="size-12 rounded-xl bg-[#0F2340] border border-[rgba(6,182,212,0.18)] grid place-items-center text-2xl mb-4">
                <span aria-hidden>{r.icon}</span>
              </div>
              <h3 className="text-base font-semibold text-foreground">{r.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed flex-1">{r.desc}</p>
              {internal ? (
                <Link
                  href={r.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  {r.link} <ArrowRight className="size-3.5" />
                </Link>
              ) : (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                  {r.link} <ArrowRight className="size-3.5" />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
