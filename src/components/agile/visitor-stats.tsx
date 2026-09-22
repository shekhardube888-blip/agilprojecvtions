"use client";

import { useEffect, useState } from "react";
import { Eye, Users } from "lucide-react";

type Stats = { totalViews: number; uniqueVisitors: number; onlineNow: number };

export function VisitorStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Record a view + load stats on mount; refresh every 30s.
    const tick = async () => {
      try { await fetch("/api/track/view", { method: "POST" }); } catch { /* ignore */ }
      if (cancelled) return;
      try {
        const res = await fetch("/api/track/stats", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && data.ok) {
          setStats({ totalViews: data.totalViews, uniqueVisitors: data.uniqueVisitors, onlineNow: data.onlineNow });
        }
      } catch { /* ignore */ }
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  return (
    <div className="inline-flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
      <Stat icon={<Eye className="size-3.5 text-cyan-400" />} value={stats?.totalViews ?? "—"} label="views" />
      <span className="h-3 w-px bg-[rgba(6,182,212,0.18)]" aria-hidden />
      <Stat icon={<Users className="size-3.5 text-cyan-400" />} value={stats?.uniqueVisitors ?? "—"} label="visitors" />
      <span className="h-3 w-px bg-[rgba(6,182,212,0.18)]" aria-hidden />
      <Stat
        icon={<span className="size-2 rounded-full bg-emerald-400 ap-pulse inline-block" />}
        value={stats?.onlineNow ?? "—"}
        label="online"
      />
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-300">
      {icon}
      <span className="font-semibold text-foreground tabular-nums">{value}</span>
      <span className="text-slate-500 hidden sm:inline">{label}</span>
    </span>
  );
}
