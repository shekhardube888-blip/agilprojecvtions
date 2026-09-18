import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SCHEDULE } from "@/lib/data";
import { Button } from "@/components/ui/button";

const statusStyle = (status: string): { label: string; cls: string } => {
  if (status === "open") {
    return {
      label: "Open",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    };
  }
  return {
    label: "Coming Soon",
    cls: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  };
};

export function Schedule() {
  return (
    <section
      id="schedule"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="schedule-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Batch Schedule
        </div>
        <h2 id="schedule-h2" className="font-bold text-3xl md:text-4xl">
          Upcoming <span className="ap-gradient-text">internship batches</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-3">
          All sessions are online live. Seats are limited per batch — register early to confirm your spot.
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl overflow-hidden border border-[rgba(6,182,212,0.18)]">
        <table className="w-full text-sm">
          <thead className="bg-[#0e1b2e] text-cyan-300">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Internship</th>
              <th className="text-left font-semibold px-4 py-3">Batch Start</th>
              <th className="text-left font-semibold px-4 py-3">Last Date</th>
              <th className="text-left font-semibold px-4 py-3">Duration</th>
              <th className="text-left font-semibold px-4 py-3">Mode</th>
              <th className="text-left font-semibold px-4 py-3">Status</th>
              <th className="text-left font-semibold px-4 py-3">Apply</th>
            </tr>
          </thead>
          <tbody className="bg-[#111f35]">
            {SCHEDULE.map((row) => {
              const st = statusStyle(row.status);
              return (
                <tr
                  key={row.name}
                  className="border-t border-[rgba(6,182,212,0.1)] hover:bg-[#0F2340] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3 text-slate-300">{row.start}</td>
                  <td className="px-4 py-3 text-slate-300">{row.last}</td>
                  <td className="px-4 py-3 text-slate-300">{row.duration}</td>
                  <td className="px-4 py-3 text-slate-300">{row.mode}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${st.cls}`}
                    >
                      <span className="size-1.5 rounded-full bg-current mr-1.5" />
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
                    >
                      <Link href="#register">
                        Apply <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden grid gap-3">
        {SCHEDULE.map((row) => {
          const st = statusStyle(row.status);
          return (
            <div
              key={row.name}
              className="bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground text-sm">{row.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{row.mode}</div>
                </div>
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${st.cls}`}
                >
                  {st.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                <div className="bg-[#0e1b2e] rounded-md p-2">
                  <div className="text-slate-500">Start</div>
                  <div className="text-slate-200 font-medium mt-0.5">{row.start}</div>
                </div>
                <div className="bg-[#0e1b2e] rounded-md p-2">
                  <div className="text-slate-500">Last Date</div>
                  <div className="text-slate-200 font-medium mt-0.5">{row.last}</div>
                </div>
                <div className="bg-[#0e1b2e] rounded-md p-2">
                  <div className="text-slate-500">Duration</div>
                  <div className="text-slate-200 font-medium mt-0.5">{row.duration}</div>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="mt-3 w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
              >
                <Link href="#register">Apply Now <ArrowRight className="size-3.5" /></Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
