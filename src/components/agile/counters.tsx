import { COUNTERS } from "@/lib/data";

export function Counters() {
  return (
    <section
      aria-label="Quick metrics"
      className="border-y border-border bg-muted"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-[5%] py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {COUNTERS.map((c) => (
          <div key={c.label} className="text-center">
            <div className="text-2xl md:text-3xl font-bold ap-gradient-text">{c.num}</div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
