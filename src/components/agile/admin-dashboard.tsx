"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Users, FileText, CreditCard, Cpu, GraduationCap, FolderKanban,
  CalendarCheck, Award, BarChart3, Brain, Bell, Settings, X, RefreshCw, Loader2,
  CheckCircle2, Lock, Rocket, Forward, ShieldCheck, Search, Download, ExternalLink, LogOut,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ── types ──
type Student = {
  id: string; firstName: string; lastName: string; email: string; mobile: string;
  degree: string; branch: string; semester: string; plan: string; college: string;
  state: string; categoryLabel: string; project: string;
  paymentStatus: string; internshipStatus: string; currentStage: number;
  createdAt: string; completedAt?: string | null;
};
type Cert = {
  id: string; certificateNumber: string; type: string; eligibility: string;
  issuedAt: string;
  student: { firstName: string; lastName: string; email: string; degree: string; branch: string; college: string; project: string; categoryLabel: string; completedAt: string | null };
};
type MenuKey =
  | "dashboard" | "students" | "applications" | "payments" | "internships" | "mentors"
  | "projects" | "attendance" | "certificates" | "reports" | "ai" | "notifications" | "settings";

const MENU: { key: MenuKey; label: string; icon: React.ReactNode; group: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" />, group: "Overview" },
  { key: "students", label: "Students", icon: <Users className="size-4" />, group: "Overview" },
  { key: "applications", label: "Applications", icon: <FileText className="size-4" />, group: "Overview" },
  { key: "payments", label: "Payments", icon: <CreditCard className="size-4" />, group: "Operations" },
  { key: "internships", label: "Internships", icon: <Cpu className="size-4" />, group: "Operations" },
  { key: "mentors", label: "Mentors", icon: <GraduationCap className="size-4" />, group: "Operations" },
  { key: "projects", label: "Projects", icon: <FolderKanban className="size-4" />, group: "Operations" },
  { key: "attendance", label: "Attendance", icon: <CalendarCheck className="size-4" />, group: "Operations" },
  { key: "certificates", label: "Certificates", icon: <Award className="size-4" />, group: "Lifecycle" },
  { key: "reports", label: "Reports", icon: <BarChart3 className="size-4" />, group: "Lifecycle" },
  { key: "ai", label: "AI Analytics", icon: <Brain className="size-4" />, group: "Insights" },
  { key: "notifications", label: "Notifications", icon: <Bell className="size-4" />, group: "Insights" },
  { key: "settings", label: "Settings", icon: <Settings className="size-4" />, group: "Insights" },
];

export function AdminDashboard() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<MenuKey>("dashboard");

  return (
    <>
      <Button
        onClick={() => { setOpen(true); setTab("dashboard"); }}
        size="lg"
        className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90 h-12 px-6 shadow-lg shadow-violet-500/20"
      >
        <ShieldCheck className="size-5 mr-2" />
        Open Admin Dashboard
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0e1b2e] border-[rgba(6,182,212,0.25)] text-foreground sm:max-w-3xl lg:sm:max-w-7xl max-h-[94vh] p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[rgba(6,182,212,0.18)] bg-[#0a1422]">
            <div className="flex items-center gap-2.5">
              <span className="size-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 grid place-items-center text-white">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <DialogTitle className="font-bold text-base">Admin Dashboard</DialogTitle>
                <DialogDescription className="text-[11px] text-slate-500">NT-AI Network · enterprise admin suite</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setOpen(false); window.dispatchEvent(new Event("auth-change")); }} className="inline-flex items-center gap-1.5 text-xs px-3 h-8 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white font-semibold transition-colors">
                <LogOut className="size-3.5" /> Logout
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close" className="size-8 rounded-md grid place-items-center text-slate-400 hover:text-cyan-300 hover:bg-[#0F2340]">
                <X className="size-4" />
              </button>
            </div>
          </div>
          {/* Sidebar + content */}
          <div className="flex max-h-[calc(94vh-64px)]">
            <nav className="w-16 sm:w-52 shrink-0 border-r border-[rgba(6,182,212,0.18)] bg-[#0a1422]/60 overflow-y-auto p-2 flex flex-col gap-0.5">
              {MENU.map((m, i) => (
                <React.Fragment key={m.key}>
                  {i === 0 || MENU[i].group !== MENU[i - 1].group ? (
                    <div className="text-[9px] uppercase tracking-wider text-slate-600 px-2 pt-3 pb-1 hidden sm:block">{m.group}</div>
                  ) : null}
                  <button
                    onClick={() => setTab(m.key)}
                    className={cn(
                      "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm transition-colors text-left",
                      tab === m.key ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-[#0F2340] hover:text-cyan-300 border border-transparent"
                    )}
                    title={m.label}
                  >
                    {m.icon}
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                </React.Fragment>
              ))}
            </nav>
            <div className="flex-1 overflow-y-auto p-5">
              <TabContent tab={tab} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TabContent({ tab }: { tab: MenuKey }) {
  switch (tab) {
    case "dashboard": return <DashboardTab />;
    case "students": return <StudentsTab />;
    case "applications": return <ApplicationsTab />;
    case "certificates": return <CertificatesTab />;
    case "reports": return <ReportsTab />;
    default: return <StubTab tab={tab} />;
  }
}

// ── shared data hook ──
function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations?since=all&limit=500", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setStudents(data.recent || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { students, loading, load };
}

// ── Dashboard tab (KPI cards) ──
function DashboardTab() {
  const { students, loading } = useStudents();
  const [certCount, setCertCount] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/admin/certificates", { cache: "no-store" })
      .then(r => r.json()).then(d => { if (d.ok) setCertCount(d.count); }).catch(() => {});
  }, [students]);
  const total = students.length;
  const pending = students.filter(s => s.paymentStatus !== "confirmed").length;
  const active = students.filter(s => s.internshipStatus === "in_progress").length;
  const completed = students.filter(s => s.internshipStatus === "completed").length;
  const kpis = [
    { label: "Total Students", value: total, icon: <Users className="size-5" />, accent: "from-cyan-500 to-blue-600" },
    { label: "Pending Approval", value: pending, icon: <FileText className="size-5" />, accent: "from-amber-500 to-rose-500", highlight: pending > 0 },
    { label: "Active Interns", value: active, icon: <Rocket className="size-5" />, accent: "from-violet-500 to-cyan-500", highlight: active > 0 },
    { label: "Completed", value: completed, icon: <CheckCircle2 className="size-5" />, accent: "from-emerald-500 to-cyan-500" },
    { label: "Certificates Issued", value: certCount ?? "—", icon: <Award className="size-5" />, accent: "from-blue-600 to-cyan-500" },
  ];
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Dashboard</h3>
      <p className="text-xs text-slate-500 mb-4">Complete student lifecycle — registration to certificate.</p>
      {loading ? <Loading /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {kpis.map(k => (
            <div key={k.label} className={cn("bg-[#111f35] rounded-xl p-4 border", k.highlight ? "border-cyan-400/50 shadow-[0_0_20px_-4px_rgba(6,182,212,0.3)]" : "border-[rgba(6,182,212,0.18)]")}>
              <span className={cn("size-9 rounded-lg grid place-items-center text-white bg-gradient-to-br mb-2", k.accent)}>{k.icon}</span>
              <div className="font-bold text-2xl ap-gradient-text leading-none">{k.value}</div>
              <div className="text-[11px] text-slate-400 mt-1.5">{k.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-[rgba(6,182,212,0.18)] bg-[#111f35] p-4">
        <div className="text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-2">Pipeline</div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Pill color="amber" label="Pending" n={pending} />
          <span className="text-slate-600">→</span>
          <Pill color="cyan" label="Active" n={active} />
          <span className="text-slate-600">→</span>
          <Pill color="emerald" label="Completed" n={completed} />
          <span className="text-slate-600">→</span>
          <Pill color="blue" label="Certified" n={certCount ?? 0} />
        </div>
        <p className="text-[11px] text-slate-500 mt-3">Approve payment → start internship → advance 6 stages → generate certificate. Use the Students / Applications / Certificates tabs to action each stage.</p>
      </div>
    </div>
  );
}

function Pill({ color, label, n }: { color: "amber" | "cyan" | "emerald" | "blue"; label: string; n: number }) {
  const c = { amber: "bg-amber-500/15 text-amber-300 border-amber-500/30", cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", blue: "bg-blue-500/15 text-blue-300 border-blue-500/30" }[color];
  return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold", c)}>{label} <strong className="tabular-nums">{n}</strong></span>;
}

// ── Students tab (filters + actions) ──
function StudentsTab() {
  const { students, loading, load } = useStudents();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCollege, setFilterCollege] = useState("all");

  const colleges = Array.from(new Set(students.map(s => s.college).filter(Boolean))).sort();
  const filtered = students.filter(s => {
    if (q && !(`${s.firstName} ${s.lastName} ${s.email} ${s.project}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (filterStatus !== "all") {
      if (filterStatus === "pending" && s.paymentStatus === "confirmed") return false;
      if (filterStatus === "active" && s.internshipStatus !== "in_progress") return false;
      if (filterStatus === "completed" && s.internshipStatus !== "completed") return false;
    }
    if (filterCollege !== "all" && s.college !== filterCollege) return false;
    return true;
  });

  async function start(id: string, name: string) {
    setBusy(id); try {
      const res = await fetch("/api/admin/student/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: id }) });
      const d = await res.json(); if (!res.ok || !d.ok) throw new Error(d.error);
      toast({ title: `Approved ${name}'s payment`, description: "Stage 1 unlocked." }); await load();
    } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setBusy(null); }
  }
  async function advance(id: string, name: string) {
    setBusy(id + "-a"); try {
      const res = await fetch("/api/admin/student/advance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: id }) });
      const d = await res.json(); if (!res.ok || !d.ok) throw new Error(d.error);
      const done = d.student.internshipStatus === "completed";
      toast({ title: done ? `🎉 ${name} completed!` : `${name} → Stage ${d.student.currentStage}`, description: done ? "Ready for certificate." : `Stage ${d.student.currentStage}/6.` }); await load();
    } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setBusy(null); }
  }

  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Student Management</h3>
      <p className="text-xs text-slate-500 mb-4">Filter, approve payments, advance stages, generate certificates.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="size-4 absolute left-2.5 top-2.5 text-slate-500" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name / email / project…" className="bg-[#0a1422] border-[rgba(6,182,212,0.18)] pl-8 h-9 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#0a1422] border border-[rgba(6,182,212,0.18)] rounded-md h-9 px-2 text-xs text-slate-200">
          <option value="all">All status</option><option value="pending">Pending</option><option value="active">Active</option><option value="completed">Completed</option>
        </select>
        <select value={filterCollege} onChange={e => setFilterCollege(e.target.value)} className="bg-[#0a1422] border border-[rgba(6,182,212,0.18)] rounded-md h-9 px-2 text-xs text-slate-200 max-w-[160px]">
          <option value="all">All colleges</option>{colleges.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-slate-300 hover:text-cyan-300 h-9"><RefreshCw className={cn("size-3.5", loading && "animate-spin")} /></Button>
      </div>
      {loading ? <Loading /> : filtered.length === 0 ? <Empty text="No students match the filters." /> : (
        <div className="border border-[rgba(6,182,212,0.18)] rounded-lg max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0e1b2e] z-10"><tr className="text-left text-[10px] text-slate-400 border-b border-[rgba(6,182,212,0.18)]">
              <th className="px-3 py-2">Student</th><th className="px-3 py-2 hidden md:table-cell">Project</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Action</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => {
                const done = s.internshipStatus === "completed";
                const inProg = s.internshipStatus === "in_progress";
                return (
                  <tr key={s.id} className="border-b border-[rgba(6,182,212,0.08)] last:border-0 hover:bg-[#0F2340]/40">
                    <td className="px-3 py-2"><div className="font-medium text-foreground text-xs">{s.firstName} {s.lastName}</div><div className="text-[10px] text-slate-500">{s.degree} · {s.college}</div></td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs text-slate-300 max-w-[180px]"><div className="truncate" title={s.project}>{s.project}</div><div className="text-[10px] text-slate-500">{s.categoryLabel}</div></td>
                    <td className="px-3 py-2">{done ? <Badge color="emerald" icon={<CheckCircle2 className="size-2.5" />}>Done</Badge> : inProg ? <Badge color="cyan" icon={<Loader2 className="size-2.5" />}>Stage {s.currentStage}/6</Badge> : <Badge color="amber" icon={<Lock className="size-2.5" />}>Pending</Badge>}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {done ? <GenCertButton studentId={s.id} name={s.firstName} small /> :
                        inProg ? <Button size="sm" variant="outline" onClick={() => advance(s.id, s.firstName)} disabled={busy === s.id + "-a"} className="h-7 text-[11px] bg-[#0F2340] border-[rgba(6,182,212,0.22)] text-slate-200 hover:text-cyan-300">{busy === s.id + "-a" ? <Loader2 className="size-3 animate-spin" /> : <Forward className="size-3.5" />}Advance</Button> :
                        <Button size="sm" onClick={() => start(s.id, s.firstName)} disabled={busy === s.id} className="h-7 text-[11px] bg-gradient-to-r from-emerald-600 to-cyan-500 text-white hover:opacity-90">{busy === s.id ? <Loader2 className="size-3 animate-spin" /> : <Rocket className="size-3.5" />}Approve & Start</Button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Applications tab (approval center) ──
function ApplicationsTab() {
  const { students, loading, load } = useStudents();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const pending = students.filter(s => s.paymentStatus !== "confirmed");
  const active = students.filter(s => s.paymentStatus === "confirmed" && s.internshipStatus === "in_progress");
  const completed = students.filter(s => s.internshipStatus === "completed");
  async function start(id: string, name: string) {
    setBusy(id); try { const res = await fetch("/api/admin/student/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: id }) }); const d = await res.json(); if (!res.ok || !d.ok) throw new Error(d.error); toast({ title: `Approved ${name}`, description: "Internship started." }); await load(); } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); } finally { setBusy(null); }
  }
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Application Approval Center</h3>
      <p className="text-xs text-slate-500 mb-4">Review and approve pending applications.</p>
      {loading ? <Loading /> : (
        <div className="space-y-4">
          <AppGroup title="Pending Review" count={pending.length} accent="amber" students={pending} empty="No pending applications — all approved!" action={(s) => <Button size="sm" onClick={() => start(s.id, s.firstName)} disabled={busy === s.id} className="h-7 text-[11px] bg-gradient-to-r from-emerald-600 to-cyan-500 text-white hover:opacity-90">{busy === s.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3.5" />}Approve</Button>} />
          <AppGroup title="Approved / In Progress" count={active.length} accent="cyan" students={active} empty="No active interns." action={() => <span className="text-[10px] text-slate-500">Use Students tab → Advance</span>} />
          <AppGroup title="Completed" count={completed.length} accent="emerald" students={completed} empty="No completed interns yet." action={(s) => <GenCertButton studentId={s.id} name={s.firstName} small />} />
        </div>
      )}
    </div>
  );
}

function AppGroup({ title, count, accent, students, empty, action }: { title: string; count: number; accent: "amber" | "cyan" | "emerald"; students: Student[]; empty: string; action: (s: Student) => React.ReactNode }) {
  const c = { amber: "text-amber-300 border-amber-500/30", cyan: "text-cyan-300 border-cyan-500/30", emerald: "text-emerald-300 border-emerald-500/30" }[accent];
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5"><span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0a1422] border", c)}>{title}</span><span className="text-[10px] text-slate-500">{count}</span></div>
      {students.length === 0 ? <div className="text-[11px] text-slate-500 py-2 px-3 border border-[rgba(6,182,212,0.1)] rounded-lg bg-[#0a1422]/40">{empty}</div> : (
        <div className="border border-[rgba(6,182,212,0.18)] rounded-lg max-h-48 overflow-y-auto">
          <table className="w-full text-sm"><tbody>
            {students.map(s => <tr key={s.id} className="border-b border-[rgba(6,182,212,0.08)] last:border-0 hover:bg-[#0F2340]/40">
              <td className="px-2 py-1.5"><div className="font-medium text-foreground text-xs">{s.firstName} {s.lastName}</div><div className="text-[10px] text-slate-500">{s.degree} · {s.college}</div></td>
              <td className="px-2 py-1.5 hidden sm:table-cell text-xs text-slate-300 max-w-[140px] truncate" title={s.project}>{s.project}</td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">{action(s)}</td>
            </tr>)}
          </tbody></table>
        </div>
      )}
    </div>
  );
}

// ── Certificates tab (auto-generation + verify + download) ──
function CertificatesTab() {
  const { toast } = useToast();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true); try { const res = await fetch("/api/admin/certificates", { cache: "no-store" }); const d = await res.json(); if (d.ok) setCerts(d.certificates); } catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Certificate Management</h3>
      <p className="text-xs text-slate-500 mb-4">Auto-issue verifiable certificates for completed students. Eligibility: project completed (6/6 stages) + mentor approved.</p>
      {loading ? <Loading /> : certs.length === 0 ? <Empty text="No certificates issued yet. Go to Students tab → find a completed student → click Generate Certificate." /> : (
        <div className="border border-[rgba(6,182,212,0.18)] rounded-lg max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0e1b2e] z-10"><tr className="text-left text-[10px] text-slate-400 border-b border-[rgba(6,182,212,0.18)]"><th className="px-3 py-2">Certificate #</th><th className="px-3 py-2">Student</th><th className="px-3 py-2 hidden md:table-cell">Project</th><th className="px-3 py-2 text-right">Verify / Download</th></tr></thead>
            <tbody>
              {certs.map(c => (
                <tr key={c.id} className="border-b border-[rgba(6,182,212,0.08)] last:border-0 hover:bg-[#0F2340]/40">
                  <td className="px-3 py-2"><div className="font-mono text-xs text-cyan-300 font-semibold">{c.certificateNumber}</div><div className="text-[10px] text-slate-500">{new Date(c.issuedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div></td>
                  <td className="px-3 py-2"><div className="font-medium text-foreground text-xs">{c.student.firstName} {c.student.lastName}</div><div className="text-[10px] text-slate-500">{c.student.degree} · {c.student.college}</div></td>
                  <td className="px-3 py-2 hidden md:table-cell text-xs text-slate-300 max-w-[160px] truncate" title={c.student.project}>{c.student.project}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <a href={`/api/certificate/${c.certificateNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200 mr-2"><ExternalLink className="size-3" />Verify</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[11px] text-slate-500 mt-3"><Award className="size-3 inline text-cyan-400 mr-1" />Each certificate has a unique number (e.g. AP-2026-XXXXXX) — anyone can verify it at <code className="text-cyan-300">/api/certificate/&lt;number&gt;</code>.</p>
    </div>
  );
}

// Generate Certificate button (used in Students + Applications tabs for completed students)
function GenCertButton({ studentId, name, small }: { studentId: string; name: string; small?: boolean }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [cert, setCert] = useState<{ certificateNumber: string } | null>(null);
  async function gen() {
    setBusy(true); try {
      const res = await fetch("/api/admin/certificate/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId }) });
      const d = await res.json(); if (!res.ok || !d.ok) throw new Error(d.error);
      setCert({ certificateNumber: d.certificate.certificateNumber });
      toast({ title: `Certificate issued for ${name}`, description: d.certificate.certificateNumber + (d.certificate.alreadyExisted ? " (already existed)" : "") });
    } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setBusy(false); }
  }
  if (cert) return <a href={`/api/certificate/${cert.certificateNumber}`} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-cyan-200", small && "h-7")}><ExternalLink className="size-3" />{cert.certificateNumber}</a>;
  return <Button size="sm" onClick={gen} disabled={busy} className="h-7 text-[11px] bg-gradient-to-r from-amber-500 to-cyan-500 text-white hover:opacity-90">{busy ? <Loader2 className="size-3 animate-spin" /> : <Award className="size-3.5" />}Generate Cert</Button>;
}

// ── Reports tab (embeds the existing /api/admin/registrations analytics summary) ──
function ReportsTab() {
  const { students, loading } = useStudents();
  if (loading) return <Loading />;
  const byDegree: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byCollege: Record<string, number> = {};
  students.forEach(s => { byDegree[s.degree] = (byDegree[s.degree] || 0) + 1; byCategory[s.categoryLabel] = (byCategory[s.categoryLabel] || 0) + 1; byCollege[s.college] = (byCollege[s.college] || 0) + 1; });
  const sorted = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1]);
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Reports</h3>
      <p className="text-xs text-slate-500 mb-4">College-wise, branch-wise, technology-wise breakdowns.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <ReportList title="By Degree" data={sorted(byDegree)} />
        <ReportList title="By Technology" data={sorted(byCategory)} />
        <ReportList title="By College" data={sorted(byCollege)} />
      </div>
    </div>
  );
}
function ReportList({ title, data }: { title: string; data: [string, number][] }) {
  const max = Math.max(1, ...data.map(d => d[1]));
  return (
    <div className="bg-[#111f35] border border-[rgba(6,182,212,0.18)] rounded-xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold mb-3">{title}</div>
      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {data.length === 0 ? <div className="text-xs text-slate-500">No data.</div> : data.map(([k, n]) => (
          <div key={k} className="text-xs"><div className="flex justify-between mb-0.5"><span className="text-slate-300 truncate pr-2">{k}</span><span className="text-cyan-300 font-semibold tabular-nums">{n}</span></div><div className="h-1.5 bg-[#0a1422] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${(n / max) * 100}%` }} /></div></div>
        ))}
      </div>
    </div>
  );
}

// ── Stub tabs (structure for the rest of the enterprise suite) ──
function StubTab({ tab }: { tab: MenuKey }) {
  const labels: Record<string, { title: string; desc: string; features: string[] }> = {
    payments: { title: "Payment Management", desc: "For future paid programs — track payments, refunds, invoices, GST reports.", features: ["Payment Pending / Completed", "Refund Requests", "Invoice Download", "Revenue + GST Reports"] },
    internships: { title: "Internship Management", desc: "Create and configure internship tracks.", features: ["Create Internship (title, duration, mentor, technology, max students, dates)", "AI/ML · Full Stack · IoT · Embedded · Campus Ambassador"] },
    mentors: { title: "Mentor Management", desc: "Add mentors, assign students/batches, track performance + workload.", features: ["Add Mentor", "Assign Students + Batches", "Performance Tracking", "Workload Monitoring"] },
    projects: { title: "Project Management", desc: "Project library, templates, assignments, submission + evaluation.", features: ["Project Library (84+ templates)", "Assignments", "Submission", "Evaluation (Assigned → Reviewed → Approved)"] },
    attendance: { title: "Attendance Management", desc: "Daily tracking — Present / Absent / Leave / Late + analytics.", features: ["Daily Tracking", "Attendance %", "Batch-wise + College-wise analytics", "Daily Progress Monitoring"] },
    ai: { title: "AI Analytics Dashboard", desc: "ML-powered insights on student outcomes.", features: ["Dropout Prediction", "Student Risk Score", "Performance Prediction", "Attendance Trends", "Certificate Eligibility Forecast", "AI Mentor Analytics (most-asked questions, learning gaps)"] },
    notifications: { title: "Notification Center", desc: "Send notifications across channels.", features: ["Email", "SMS", "WhatsApp", "Portal Notifications", "Templates: Batch Started / Assignment Due / Attendance Warning / Certificate Available"] },
    settings: { title: "Settings (Super Admin)", desc: "Manage colleges, courses, technologies, mentors, roles, permissions.", features: ["Manage Colleges / Courses / Technologies / Mentors", "Roles: Super Admin · Admin · Mentor · College Coordinator · Student", "Permissions"] },
  };
  const info = labels[tab] || { title: String(tab), desc: "", features: [] };
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">{info.title}</h3>
      <p className="text-xs text-slate-500 mb-4">{info.desc}</p>
      <div className="rounded-xl border border-dashed border-[rgba(6,182,212,0.25)] bg-[#111f35]/50 p-6 text-center">
        <div className="size-12 rounded-xl bg-[#0F2340] border border-[rgba(6,182,212,0.22)] grid place-items-center text-cyan-400 mx-auto mb-3"><Brain className="size-6" /></div>
        <div className="font-semibold text-foreground text-sm">Part of the NT-AI enterprise admin suite</div>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">This module is scaffolded in the sidebar. Planned features:</p>
        <ul className="text-xs text-slate-400 mt-3 max-w-md mx-auto space-y-1 text-left">
          {info.features.map(f => <li key={f} className="flex items-start gap-1.5"><CheckCircle2 className="size-3 text-cyan-400 mt-0.5 shrink-0" />{f}</li>)}
        </ul>
      </div>
    </div>
  );
}

function Loading() { return <div className="py-10 text-center text-sm text-slate-500"><Loader2 className="size-5 animate-spin mx-auto mb-2" /> Loading…</div>; }
function Empty({ text }: { text: string }) { return <div className="py-8 text-center text-sm text-slate-500 border border-dashed border-[rgba(6,182,212,0.18)] rounded-lg">{text}</div>; }
function Badge({ color, icon, children }: { color: "amber" | "cyan" | "emerald"; icon: React.ReactNode; children: React.ReactNode }) {
  const c = { amber: "bg-amber-500/15 text-amber-300 border-amber-500/30", cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" }[color];
  return <span className={cn("inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border", c)}>{icon}{children}</span>;
}
