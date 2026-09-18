import { ShieldCheck } from "lucide-react";
import { ABOUT_STATS } from "@/lib/data";

export function About() {
  return (
    <section
      id="about"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="about-h2"
    >
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
            About AgileProjection
          </div>
          <h2 id="about-h2" className="font-bold text-3xl md:text-4xl leading-tight">
            A mission to make <span className="ap-gradient-text">quality engineering internships</span> free for every Indian student
          </h2>

          <div className="mt-5 space-y-4 text-sm md:text-base text-slate-400 leading-relaxed">
            <p>
              <strong className="text-slate-200">AgileProjection (NT-AI Network)</strong> was founded in 2018 with a single conviction: every engineering student in India deserves access to industry-grade mentorship, real projects, and a verifiable certificate — regardless of their financial background or college tier.
            </p>
            <p>
              Over <strong className="text-slate-200">10,000 students</strong> across <strong className="text-slate-200">500+ colleges</strong> have completed our live, project-based internship programs in Embedded Systems, IoT, Full Stack, AI/ML and Campus Ambassador tracks. Our mentors are working professionals from companies like Texas Instruments, Bosch, Qualcomm, and Infosys.
            </p>
            <p>
              We are <strong className="text-slate-200">100% free — always</strong>. No registration fee, no course fee, no certificate fee. No hidden charges of any kind. We are committed to democratising quality technical education for the next generation of Indian engineers.
            </p>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-cyan-500/25 bg-[#0F2340]/60 flex items-start gap-3">
            <ShieldCheck className="size-5 text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-300">
              <strong className="text-cyan-300">AICTE mandate compliance:</strong> our merit certificates are accepted by 500+ engineering colleges across India and are designed to meet AICTE &amp; most university internship-mandate requirements for academic credit conversion.
            </p>
          </div>
        </div>

        {/* Right: 2x3 stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ABOUT_STATS.map((s, i) => (
            <div
              key={s.label}
              className="ap-lift bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-5 text-center"
              style={{
                background:
                  i % 2 === 0 ? "#111f35" : "#0e1b2e",
              }}
            >
              <div className="text-2xl md:text-3xl font-bold ap-gradient-text">
                {s.num}
              </div>
              <div className="text-xs text-slate-400 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
