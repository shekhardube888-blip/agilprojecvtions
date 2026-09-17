import Link from "next/link";
import {
  ArrowRight,
  Database,
  BarChart3,
  Filter,
  Brain,
  Target,
  Rocket,
  ExternalLink,
} from "lucide-react";
import { AIML_CURRICULUM, AIML_FEATURES } from "@/lib/data";
import { Button } from "@/components/ui/button";

const HOUSING_URL =
  "https://medium.com/@gurupratap.matharu/end-to-end-machine-learning-project-on-predicting-housing-prices-using-regression-7ab7832840ab";

const PIPELINE = [
  { icon: Database, step: "Data Ingestion", note: "Housing CSV → Pandas DataFrame" },
  { icon: BarChart3, step: "EDA", note: "Geo scatter · correlation heatmap" },
  { icon: Filter, step: "Feature Engineering", note: "Custom transformers · pipelines" },
  { icon: Brain, step: "Modelling", note: "LinReg · DT · RF · GB" },
  { icon: Target, step: "Evaluation", note: "RMSE · CV · SHAP" },
  { icon: Rocket, step: "Deployment", note: "FastAPI + Streamlit" },
];

export function AIMLProgram() {
  return (
    <section
      id="aiml-program"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="aiml-h2"
    >
      {/* Divider banner */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-purple-600/40 via-cyan-500/40 to-blue-600/40 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#1a0a30] via-[#071a30] to-[#0a2a30] p-6 md:p-8">
          <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-2">
            Flagship Internship
          </div>
          <h2 id="aiml-h2" className="font-bold text-3xl md:text-4xl">
            🚀 AI/ML Industry Internship — <span className="ap-gradient-text">80+ Industry Projects</span>
          </h2>
          <p className="text-slate-300 mt-3 max-w-3xl leading-relaxed text-sm md:text-base">
            A 6-week, project-based ML internship designed for <strong className="text-slate-100">BE / B.Tech final-year, M.Tech and MCA students</strong>. You&apos;ll work through the complete ML lifecycle — data ingestion, EDA, feature engineering, model training, evaluation and deployment — using the famous{" "}
            <a
              href={HOUSING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 underline underline-offset-4 inline-flex items-center gap-1"
            >
              end-to-end housing-price regression project
              <ExternalLink className="size-3" />
            </a>{" "}
            as the reference architecture, and ship a working AI product by week 6.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {AIML_FEATURES.map((f) => (
          <article
            key={f.title}
            className="ap-lift bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-5"
          >
            <div className="size-11 rounded-xl bg-[#0F2340] border border-[rgba(6,182,212,0.18)] grid place-items-center text-2xl mb-3">
              <span aria-hidden>{f.icon}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
          </article>
        ))}
      </div>

      {/* Pipeline diagram */}
      <div className="bg-[#0e1b2e] border border-[rgba(6,182,212,0.18)] rounded-xl p-5 md:p-6 mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          ML Pipeline (worked example: housing-price regression)
        </div>
        <div className="flex flex-col md:flex-row md:items-stretch md:gap-0 gap-3 overflow-x-auto">
          {PIPELINE.map((p, i) => (
            <div key={p.step} className="flex items-center gap-2 md:gap-1">
              <div className="flex-1 min-w-[140px] bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-lg p-3 text-center">
                <div className="size-9 rounded-lg ap-gradient-cyan grid place-items-center text-navy mx-auto mb-2">
                  <p.icon className="size-4" />
                </div>
                <div className="text-sm font-semibold text-foreground">{p.step}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{p.note}</div>
              </div>
              {i < PIPELINE.length - 1 && (
                <ArrowRight className="size-4 text-cyan-500 shrink-0 rotate-90 md:rotate-0" aria-hidden />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">
          The same 6-stage pipeline you&apos;ll follow across all 80+ projects — adapted to the dataset and domain of your choice.
        </p>
      </div>

      {/* Curriculum timeline */}
      <div className="text-center mb-8">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          6-Week Curriculum
        </div>
        <h3 className="font-bold text-2xl md:text-3xl">
          From <span className="ap-gradient-text">Pandas notebook</span> to deployed AI product
        </h3>
      </div>

      <ol className="relative max-w-3xl mx-auto pl-6 border-l border-[rgba(6,182,212,0.22)] space-y-5">
        {AIML_CURRICULUM.map((c, i) => {
          const isHousing = i === 0 || i === 2 || i === 3;
          return (
            <li key={c.week} className="relative">
              <span
                className={
                  "absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-[#0B1929] " +
                  (isHousing ? "bg-cyan-400" : "bg-blue-500")
                }
                aria-hidden
              />
              <div
                className={
                  "bg-[#111f35] border rounded-xl p-4 " +
                  (isHousing
                    ? "border-cyan-500/40"
                    : "border-[rgba(6,182,212,0.18)]")
                }
              >
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="inline-flex items-center rounded-md ap-gradient-cyan text-navy text-[11px] font-bold px-2 py-0.5">
                    {c.week}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{c.title}</span>
                  {isHousing && (
                    <span className="text-[10px] ml-auto px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                      <Target className="size-3" /> Reference architecture
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{c.text}</p>
                {i === 0 && (
                  <a
                    href={HOUSING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200"
                  >
                    <ExternalLink className="size-3" /> Read the housing-price end-to-end ML article on Medium
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="text-center mt-10">
        <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 h-12 px-6">
          <Link href="#register">
            Register for AI/ML Internship <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
