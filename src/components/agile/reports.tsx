"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  GraduationCap,
  Layers,
  RefreshCw,
  Users,
  Building2,
  Clock,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type DegreeRow = { degree: string; _count: { degree: number } };
type CategoryRow = { categoryLabel: string; _count: { categoryLabel: number } };
type Recent = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  degree: string;
  branch: string;
  college: string;
  project: string;
  categoryLabel: string;
  createdAt: string;
};
type ReportData = {
  ok: boolean;
  total: number;
  byDegree: DegreeRow[];
  byCategory: CategoryRow[];
  recent: Recent[];
};

const BAR_COLORS = [
  "#06B6D4",
  "#2563EB",
  "#7c3aed",
  "#f59e0b",
  "#22c55e",
  "#ec4899",
  "#dc2626",
  "#0891b2",
  "#84cc16",
  "#a855f7",
];

export function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/registrations", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load report");
      setData(json);
    } catch (err) {
      const msg = (err as Error).message || "Failed to load report";
      setError(msg);
      toast({ title: "Report load failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const degreeData = (data?.byDegree ?? []).map((d) => ({
    name: d.degree,
    count: d._count.degree,
  }));
  const categoryData = (data?.byCategory ?? []).map((d) => ({
    name: d.categoryLabel,
    count: d._count.categoryLabel,
  }));
  const uniqueColleges = new Set(
    (data?.recent ?? []).map((r) => r.college?.toLowerCase().trim()).filter(Boolean)
  ).size;
  const topCategory = categoryData[0];
  const topDegree = degreeData[0];

  return (
    <section
      id="reports"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="reports-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Staff Dashboard · Live Insights
        </div>
        <h2 id="reports-h2" className="font-bold text-3xl md:text-4xl">
          Registration <span className="ap-gradient-text">Reports & Analytics</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-3">
          Live counts of students registered for AgileProjection internships — broken down by degree
          (BE / B.Tech / MCA / M.Tech) and by AI/ML project domain. Data refreshes from the database in real time.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-slate-500 inline-flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {data
            ? `Last refreshed ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
            : "Loading…"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
          className="bg-[#0e1b2e] border-[rgba(6,182,212,0.22)] text-slate-200 hover:text-cyan-300 hover:border-cyan-500/40"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Refresh
        </Button>
      </div>

      {loading && !data ? (
        <ReportSkeleton />
      ) : error ? (
        <div className="text-center py-12 text-rose-300 text-sm border border-rose-500/30 rounded-xl bg-rose-500/5">
          {error}
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Users className="size-5" />}
              label="Total Registrations"
              value={String(data.total)}
              accent="from-cyan-500 to-blue-600"
            />
            <StatCard
              icon={<GraduationCap className="size-5" />}
              label="Degrees Enrolled"
              value={String(data.byDegree.length)}
              accent="from-violet-500 to-cyan-500"
            />
            <StatCard
              icon={<Building2 className="size-5" />}
              label="Colleges (recent)"
              value={String(uniqueColleges)}
              accent="from-emerald-500 to-cyan-500"
            />
            <StatCard
              icon={<Layers className="size-5" />}
              label="AI/ML Domains"
              value={String(data.byCategory.length)}
              accent="from-amber-500 to-rose-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-[#111f35] border-[rgba(6,182,212,0.18)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="size-4 text-cyan-400" />
                  Registrations by Degree
                </CardTitle>
              </CardHeader>
              <CardContent>
                {degreeData.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={degreeData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(6,182,212,0.18)" }}
                        interval={0}
                        angle={-12}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(6,182,212,0.18)" }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(6,182,212,0.06)" }}
                        contentStyle={{
                          background: "#0e1b2e",
                          border: "1px solid rgba(6,182,212,0.25)",
                          borderRadius: 10,
                          color: "#F8FAFC",
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#67E8F9" }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
                        {degreeData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {topDegree && (
                  <p className="text-xs text-slate-500 mt-3 inline-flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-emerald-400" />
                    Top degree: <span className="text-cyan-300 font-semibold">{topDegree.name}</span> ·{" "}
                    {topDegree.count} student{topDegree.count === 1 ? "" : "s"}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#111f35] border-[rgba(6,182,212,0.18)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Layers className="size-4 text-cyan-400" />
                  Registrations by AI/ML Domain
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      layout="vertical"
                      data={categoryData}
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.08)" horizontal={false} />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(6,182,212,0.18)" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={150}
                        tick={{ fill: "#94a3b8", fontSize: 10.5 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(6,182,212,0.18)" }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(6,182,212,0.06)" }}
                        contentStyle={{
                          background: "#0e1b2e",
                          border: "1px solid rgba(6,182,212,0.25)",
                          borderRadius: 10,
                          color: "#F8FAFC",
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#67E8F9" }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {topCategory && (
                  <p className="text-xs text-slate-500 mt-3 inline-flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-emerald-400" />
                    Top domain: <span className="text-cyan-300 font-semibold">{topCategory.name}</span> ·{" "}
                    {topCategory.count} student{topCategory.count === 1 ? "" : "s"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent registrations */}
          <Card className="bg-[#111f35] border-[rgba(6,182,212,0.18)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="size-4 text-cyan-400" />
                Recent Registrations (latest {data.recent.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recent.length === 0 ? (
                <EmptyState label="No registrations yet — registrations will appear here once students submit the form." />
              ) : (
                <div className="max-h-96 overflow-y-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#0e1b2e] z-10">
                      <tr className="text-left text-xs text-slate-400 border-b border-[rgba(6,182,212,0.18)]">
                        <th className="px-3 py-2 font-semibold">Student</th>
                        <th className="px-3 py-2 font-semibold hidden sm:table-cell">Degree / Branch</th>
                        <th className="px-3 py-2 font-semibold hidden md:table-cell">College</th>
                        <th className="px-3 py-2 font-semibold">Project</th>
                        <th className="px-3 py-2 font-semibold text-right hidden sm:table-cell">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-[rgba(6,182,212,0.08)] hover:bg-[#0F2340]/50"
                        >
                          <td className="px-3 py-2.5">
                            <div className="font-medium text-foreground">
                              {r.firstName} {r.lastName}
                            </div>
                            <div className="text-xs text-slate-500">{r.email}</div>
                          </td>
                          <td className="px-3 py-2.5 hidden sm:table-cell">
                            <div className="text-cyan-300 text-xs">{r.degree}</div>
                            <div className="text-xs text-slate-500">{r.branch}</div>
                          </td>
                          <td className="px-3 py-2.5 hidden md:table-cell text-slate-300 text-xs">
                            {r.college}
                          </td>
                          <td className="px-3 py-2.5 max-w-[220px]">
                            <div className="text-xs text-foreground truncate" title={r.project}>
                              {r.project}
                            </div>
                            <div className="text-[11px] text-slate-500">{r.categoryLabel}</div>
                          </td>
                          <td className="px-3 py-2.5 text-right text-xs text-slate-400 hidden sm:table-cell whitespace-nowrap">
                            {timeAgo(r.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-500 mt-6">
            Reports auto-update. For a CSV export or batch-wise breakdown, email{" "}
            <a
              href="mailto:shekhar.dube@agileprojection.com"
              className="text-cyan-300 underline underline-offset-4"
            >
              shekhar.dube@agileprojection.com
            </a>
            .
          </p>
        </>
      ) : null}
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-5 ap-lift">
      <div className="flex items-start justify-between mb-3">
        <span className={`size-10 rounded-lg grid place-items-center text-white bg-gradient-to-br ${accent}`}>
          {icon}
        </span>
      </div>
      <div className="font-bold text-2xl md:text-3xl ap-gradient-text leading-none">{value}</div>
      <div className="text-xs text-slate-400 mt-1.5">{label}</div>
    </div>
  );
}

function EmptyState({ label = "No data yet." }: { label?: string }) {
  return (
    <div className="h-[200px] grid place-items-center text-sm text-slate-500 text-center px-6">
      {label}
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#111f35] border border-[rgba(6,182,212,0.12)] rounded-xl p-5 h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[#111f35] border border-[rgba(6,182,212,0.12)] rounded-xl p-5 h-80" />
        ))}
      </div>
      <div className="bg-[#111f35] border border-[rgba(6,182,212,0.12)] rounded-xl p-5 h-64" />
    </div>
  );
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
