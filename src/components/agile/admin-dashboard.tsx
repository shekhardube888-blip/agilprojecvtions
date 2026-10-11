"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Users, FileText, CreditCard, Cpu, GraduationCap, FolderKanban,
  CalendarCheck, Award, BarChart3, Brain, Bell, Settings, X, RefreshCw, Loader2,
  CheckCircle2, Lock, Rocket, Forward, ShieldCheck, Search, Download, ExternalLink, LogOut,
  History,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import { MENTORS, CATEGORIES, DEGREES, BRANCHES, PLANS, STATES, SOURCES, PROGRAMS, AIML_CURRICULUM } from "@/lib/data";
import { MessageCircle, Mail } from "lucide-react";
import { CertificateView } from "@/components/agile/certificate-view";

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
  | "projects" | "attendance" | "user-mgmt" | "certificates" | "reports" | "ai" | "notifications" | "settings";

const MENU: { key: MenuKey; label: string; icon: React.ReactNode; group: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" />, group: "Overview" },
  { key: "students", label: "Students", icon: <Users className="size-4" />, group: "Overview" },
  { key: "applications", label: "Applications", icon: <FileText className="size-4" />, group: "Overview" },
  { key: "payments", label: "Payments", icon: <CreditCard className="size-4" />, group: "Operations" },
  { key: "internships", label: "Internships", icon: <Cpu className="size-4" />, group: "Operations" },
  { key: "mentors", label: "Mentors", icon: <GraduationCap className="size-4" />, group: "Operations" },
  { key: "projects", label: "Projects", icon: <FolderKanban className="size-4" />, group: "Operations" },
  { key: "attendance", label: "Attendance", icon: <CalendarCheck className="size-4" />, group: "Operations" },
  { key: "user-mgmt", label: "User Management", icon: <Users className="size-4" />, group: "Lifecycle" },
  { key: "certificates", label: "Certificates", icon: <Award className="size-4" />, group: "Lifecycle" },
  { key: "reports", label: "Reports", icon: <BarChart3 className="size-4" />, group: "Lifecycle" },
  { key: "ai", label: "AI Analytics", icon: <Brain className="size-4" />, group: "Insights" },
  { key: "notifications", label: "Notifications", icon: <Bell className="size-4" />, group: "Insights" },
  { key: "settings", label: "Settings", icon: <Settings className="size-4" />, group: "Insights" },
];

export function AdminDashboard({ initiallyOpen }: { initiallyOpen?: boolean } = {}) {
  const [open, setOpen] = useState(initiallyOpen || false);
  const [tab, setTab] = useState<MenuKey>("dashboard");
  const [viewCert, setViewCert] = useState<Cert | null>(null);
  const [certViewOpen, setCertViewOpen] = useState(false);

  // Listen for "view-certificate" events from nested components (GenCertButton,
  // CertificatesTab) — fetches the full cert data + opens the visual certificate dialog.
  useEffect(() => {
    const handler = async (e: Event) => {
      const number = (e as CustomEvent).detail as string;
      if (!number) return;
      try {
        const res = await fetch(`/api/certificate/${encodeURIComponent(number)}?json=1`, { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.ok) {
          setViewCert(data.certificate);
          setCertViewOpen(true);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener("view-certificate", handler);
    return () => window.removeEventListener("view-certificate", handler);
  }, []);

  return (
    <>
      <Button
        onClick={() => { setOpen(true); setTab("dashboard"); }}
        size="lg"
        className="bg-gradient-to-r from-violet-600 to-cyan-500 text-primary-foreground hover:opacity-90 h-12 px-6 shadow-lg shadow-violet-500/20"
      >
        <ShieldCheck className="size-5 mr-2" />
        Open Admin Dashboard
      </Button>
      {/* Visual certificate dialog — overlays the admin dashboard */}
      <CertificateView certificate={viewCert} open={certViewOpen} onOpenChange={setCertViewOpen} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-popover border-border text-foreground sm:max-w-3xl lg:sm:max-w-7xl max-h-[94vh] p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted">
            <div className="flex items-center gap-2.5">
              <span className="size-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 grid place-items-center text-primary-foreground">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <DialogTitle className="font-bold text-base">Admin Dashboard</DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground">NT-AI Network · enterprise admin suite</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setOpen(false); window.dispatchEvent(new Event("auth-change")); }} className="inline-flex items-center gap-1.5 text-xs px-3 h-8 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-primary-foreground font-semibold transition-colors">
                <LogOut className="size-3.5" /> Logout
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close" className="size-8 rounded-md grid place-items-center text-muted-foreground hover:text-cyan-500 dark:text-cyan-400 hover:bg-secondary">
                <X className="size-4" />
              </button>
            </div>
          </div>
          {/* Sidebar + content */}
          <div className="flex max-h-[calc(94vh-64px)]">
            <nav className="w-16 sm:w-52 shrink-0 border-r border-border bg-muted/60 overflow-y-auto p-2 flex flex-col gap-0.5">
              {MENU.map((m, i) => (
                <React.Fragment key={m.key}>
                  {i === 0 || MENU[i].group !== MENU[i - 1].group ? (
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground px-2 pt-3 pb-1 hidden sm:block">{m.group}</div>
                  ) : null}
                  <button
                    onClick={() => setTab(m.key)}
                    className={cn(
                      "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm transition-colors text-left",
                      tab === m.key ? "bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30" : "text-foreground hover:bg-secondary hover:text-cyan-500 dark:text-cyan-400 border border-transparent"
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
    case "user-mgmt": return <UserManagementTab />;
    case "certificates": return <CertificatesTab />;
    case "reports": return <ReportsTab />;
    case "mentors": return <MentorsTab />;
    case "attendance": return <AttendanceTab />;
    case "projects": return <ProjectsTab />;
    case "ai": return <AIAnalyticsTab />;
    case "notifications": return <NotificationsTab />;
    case "settings": return <SettingsTab />;
    case "payments": return <PaymentsTab />;
    case "internships": return <InternshipsTab />;
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
      <p className="text-xs text-muted-foreground mb-4">Complete student lifecycle — registration to certificate.</p>
      {loading ? <Loading /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {kpis.map(k => (
            <div key={k.label} className={cn("bg-card rounded-xl p-4 border", k.highlight ? "border-cyan-400/50 shadow-[0_0_20px_-4px_rgba(6,182,212,0.3)]" : "border-border")}>
              <span className={cn("size-9 rounded-lg grid place-items-center text-primary-foreground bg-gradient-to-br mb-2", k.accent)}>{k.icon}</span>
              <div className="font-bold text-2xl ap-gradient-text leading-none">{k.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1.5">{k.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-cyan-400 text-[11px] font-semibold tracking-widest uppercase mb-2">Pipeline</div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Pill color="amber" label="Pending" n={pending} />
          <span className="text-muted-foreground">→</span>
          <Pill color="cyan" label="Active" n={active} />
          <span className="text-muted-foreground">→</span>
          <Pill color="emerald" label="Completed" n={completed} />
          <span className="text-muted-foreground">→</span>
          <Pill color="blue" label="Certified" n={certCount ?? 0} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">Approve payment → start internship → advance 6 stages → generate certificate. Use the Students / Applications / Certificates tabs to action each stage.</p>
      </div>
    </div>
  );
}

function Pill({ color, label, n }: { color: "amber" | "cyan" | "emerald" | "blue"; label: string; n: number }) {
  const c = { amber: "bg-amber-500/15 text-amber-300 border-amber-500/30", cyan: "bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border-cyan-500/30", emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", blue: "bg-blue-500/15 text-blue-300 border-blue-500/30" }[color];
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
      <p className="text-xs text-muted-foreground mb-4">Filter, approve payments, advance stages, generate certificates.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="size-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name / email / project…" className="bg-muted border-border pl-8 h-9 text-sm" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-2 text-xs text-foreground">
          <option value="all">All status</option><option value="pending">Pending</option><option value="active">Active</option><option value="completed">Completed</option>
        </select>
        <select value={filterCollege} onChange={e => setFilterCollege(e.target.value)} className="bg-muted border border-border rounded-md h-9 px-2 text-xs text-foreground max-w-[160px]">
          <option value="all">All colleges</option>{colleges.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-foreground hover:text-cyan-500 dark:text-cyan-400 h-9"><RefreshCw className={cn("size-3.5", loading && "animate-spin")} /></Button>
      </div>
      {loading ? <Loading /> : filtered.length === 0 ? <Empty text="No students match the filters." /> : (
        <div className="border border-border rounded-lg max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-popover z-10"><tr className="text-left text-[10px] text-muted-foreground border-b border-border">
              <th className="px-3 py-2">Student</th><th className="px-3 py-2 hidden md:table-cell">Project</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Action</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => {
                const done = s.internshipStatus === "completed";
                const inProg = s.internshipStatus === "in_progress";
                return (
                  <tr key={s.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/40">
                    <td className="px-3 py-2"><div className="font-medium text-foreground text-xs">{s.firstName} {s.lastName}</div><div className="text-[10px] text-muted-foreground">{s.degree} · {s.college}</div></td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs text-foreground max-w-[180px]"><div className="truncate" title={s.project}>{s.project}</div><div className="text-[10px] text-muted-foreground">{s.categoryLabel}</div></td>
                    <td className="px-3 py-2">{done ? <Badge color="emerald" icon={<CheckCircle2 className="size-2.5" />}>Done</Badge> : inProg ? <Badge color="cyan" icon={<Loader2 className="size-2.5" />}>Stage {s.currentStage}/6</Badge> : <Badge color="amber" icon={<Lock className="size-2.5" />}>Pending</Badge>}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {done ? <GenCertButton studentId={s.id} name={s.firstName} small /> :
                        inProg ? <Button size="sm" variant="outline" onClick={() => advance(s.id, s.firstName)} disabled={busy === s.id + "-a"} className="h-7 text-[11px] bg-secondary border-border text-foreground hover:text-cyan-500 dark:text-cyan-400">{busy === s.id + "-a" ? <Loader2 className="size-3 animate-spin" /> : <Forward className="size-3.5" />}Advance</Button> :
                        <Button size="sm" onClick={() => start(s.id, s.firstName)} disabled={busy === s.id} className="h-7 text-[11px] bg-gradient-to-r from-emerald-600 to-cyan-500 text-primary-foreground hover:opacity-90">{busy === s.id ? <Loader2 className="size-3 animate-spin" /> : <Rocket className="size-3.5" />}Approve & Start</Button>}
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
      <p className="text-xs text-muted-foreground mb-4">Review and approve pending applications.</p>
      {loading ? <Loading /> : (
        <div className="space-y-4">
          <AppGroup title="Pending Review" count={pending.length} accent="amber" students={pending} empty="No pending applications — all approved!" action={(s) => <Button size="sm" onClick={() => start(s.id, s.firstName)} disabled={busy === s.id} className="h-7 text-[11px] bg-gradient-to-r from-emerald-600 to-cyan-500 text-primary-foreground hover:opacity-90">{busy === s.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3.5" />}Approve</Button>} />
          <AppGroup title="Approved / In Progress" count={active.length} accent="cyan" students={active} empty="No active interns." action={() => <span className="text-[10px] text-muted-foreground">Use Students tab → Advance</span>} />
          <AppGroup title="Completed" count={completed.length} accent="emerald" students={completed} empty="No completed interns yet." action={(s) => <GenCertButton studentId={s.id} name={s.firstName} small />} />
        </div>
      )}
    </div>
  );
}

function AppGroup({ title, count, accent, students, empty, action }: { title: string; count: number; accent: "amber" | "cyan" | "emerald"; students: Student[]; empty: string; action: (s: Student) => React.ReactNode }) {
  const c = { amber: "text-amber-300 border-amber-500/30", cyan: "text-cyan-500 dark:text-cyan-400 border-cyan-500/30", emerald: "text-emerald-300 border-emerald-500/30" }[accent];
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5"><span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted border", c)}>{title}</span><span className="text-[10px] text-muted-foreground">{count}</span></div>
      {students.length === 0 ? <div className="text-[11px] text-muted-foreground py-2 px-3 border border-border rounded-lg bg-muted/40">{empty}</div> : (
        <div className="border border-border rounded-lg max-h-48 overflow-y-auto">
          <table className="w-full text-sm"><tbody>
            {students.map(s => <tr key={s.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/40">
              <td className="px-2 py-1.5"><div className="font-medium text-foreground text-xs">{s.firstName} {s.lastName}</div><div className="text-[10px] text-muted-foreground">{s.degree} · {s.college}</div></td>
              <td className="px-2 py-1.5 hidden sm:table-cell text-xs text-foreground max-w-[140px] truncate" title={s.project}>{s.project}</td>
              <td className="px-2 py-1.5 text-right whitespace-nowrap">{action(s)}</td>
            </tr>)}
          </tbody></table>
        </div>
      )}
    </div>
  );
}

// ── User Management tab (reset password, lock/unlock, set expiry, history) ──
function UserManagementTab() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unlocked" | "locked" | "permanent" | "expiring">("all");
  const [actionDialog, setActionDialog] = useState<{ account: AccountRow; action: ActionType } | null>(null);
  const [historyDialog, setHistoryDialog] = useState<{ account: AccountRow; history: HistoryEntry[] } | null>(null);
  const [reason, setReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [expiryDays, setExpiryDays] = useState("");
  const [busy, setBusy] = useState(false);

  // Generate a random 12-char password (letters + digits + symbols).
  const generatePassword = useCallback(() => {
    const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pw = "";
    const arr = new Uint8Array(12);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 12; i++) pw += chars[arr[i] % chars.length];
    setNewPassword(pw);
    setShowPw(true); // show the generated password so the admin can copy it
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", { cache: "no-store" });
      const d = await res.json();
      if (d.ok) setAccounts(d.accounts);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  type AccountRow = {
    id: string; username: string; role: string; status: string; fullName: string | null;
    note: string | null; passwordSetAt: string | null; expiresAt: string | null; createdAt: string;
  };

  const filtered = accounts.filter((a) => {
    // Exclude admin accounts — they can't be managed here (no self-locking).
    if (a.role === "admin") return false;
    if (search && !a.username.toLowerCase().includes(search.toLowerCase()) && !(a.fullName || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === "unlocked" && a.status !== "unlocked") return false;
    if (statusFilter === "locked" && a.status !== "locked") return false;
    if (statusFilter === "permanent" && a.expiresAt !== null) return false;
    if (statusFilter === "expiring" && !(a.expiresAt && new Date(a.expiresAt).getTime() < Date.now() + 3 * 24 * 60 * 60 * 1000)) return false;
    return true;
  });

  async function performAction() {
    if (!actionDialog) return;
    if (!reason.trim()) { toast({ title: "Reason required", variant: "destructive" }); return; }
    if (actionDialog.action === "reset-password" && newPassword.length < 8) {
      toast({ title: "Password too short", description: "Min 8 characters.", variant: "destructive" }); return;
    }
    setBusy(true);
    try {
      const body: any = { accountId: actionDialog.account.id, action: actionDialog.action, reason: reason.trim() };
      if (actionDialog.action === "reset-password") body.newPassword = newPassword;
      if (actionDialog.action === "set-expiry" && expiryDays !== "") body.expiryDays = Number(expiryDays);
      if (actionDialog.action === "unlock" && expiryDays !== "") body.expiryDays = Number(expiryDays);

      const res = await fetch("/api/admin/user/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error || "Action failed");
      toast({ title: `✓ ${actionDialog.action} completed`, description: `Reason: ${reason.trim()}` });
      setActionDialog(null);
      setReason(""); setNewPassword(""); setShowPw(false); setExpiryDays("");
      load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally { setBusy(false); }
  }

  async function viewHistory(account: AccountRow) {
    try {
      const res = await fetch(`/api/admin/user/history?accountId=${account.id}`, { cache: "no-store" });
      const d = await res.json();
      if (d.ok) setHistoryDialog({ account, history: d.history });
      else toast({ title: "Failed to load history", description: d.error, variant: "destructive" });
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  if (loading) return <Loading />;

  return (
    <div>
      <h3 className="font-bold text-lg mb-1">User Management</h3>
      <p className="text-xs text-muted-foreground mb-4">Reset passwords, lock/unlock accounts, set expiry dates, and view the full action history. Every action requires a reason (logged for audit).</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input placeholder="Search by email or name…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-muted border-border h-9 max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="h-9 rounded-md border border-border bg-muted px-3 text-xs">
          <option value="all">All ({accounts.length})</option>
          <option value="unlocked">Unlocked</option>
          <option value="locked">Locked</option>
          <option value="permanent">Permanent (no expiry)</option>
          <option value="expiring">Expiring (≤3 days)</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Empty text="No accounts match your filter." />
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-popover z-10">
              <tr className="text-left text-[10px] text-muted-foreground border-b border-border">
                <th className="px-3 py-2">Student / Email</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 hidden md:table-cell">Expiry</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const expired = a.expiresAt && new Date(a.expiresAt).getTime() < Date.now();
                const permanent = a.expiresAt === null;
                const expiring = a.expiresAt && new Date(a.expiresAt).getTime() < Date.now() + 3 * 24 * 60 * 60 * 1000 && !expired;
                return (
                  <tr key={a.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/40">
                    <td className="px-3 py-2">
                      <div className="font-medium text-foreground">{a.fullName || a.username}</div>
                      <div className="text-[10px] text-muted-foreground">{a.username}</div>
                    </td>
                    <td className="px-3 py-2">
                      {a.status === "locked" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 dark:text-rose-400 text-[10px] font-semibold"><Lock className="size-2.5" /> Locked</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold"><CheckCircle2 className="size-2.5" /> Unlocked</span>
                      )}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-[10px]">
                      {permanent ? <span className="text-emerald-500">Permanent</span> :
                       expired ? <span className="text-rose-500">Expired</span> :
                       expiring ? <span className="text-amber-500">{new Date(a.expiresAt!).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span> :
                       <span className="text-muted-foreground">{new Date(a.expiresAt!).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button onClick={() => setActionDialog({ account: a, action: "reset-password" })} className="text-[10px] px-2 py-1 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 mr-1" title="Reset password">Reset PW</button>
                      {a.status === "locked" ? (
                        <button onClick={() => setActionDialog({ account: a, action: "unlock" })} className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 mr-1">Unlock</button>
                      ) : (
                        <button onClick={() => setActionDialog({ account: a, action: "lock" })} className="text-[10px] px-2 py-1 rounded bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 mr-1">Lock</button>
                      )}
                      <button onClick={() => setActionDialog({ account: a, action: "set-expiry" })} className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 mr-1">Expiry</button>
                      <button onClick={() => viewHistory(a)} className="text-[10px] px-2 py-1 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20" title="View action history"><History className="size-3 inline" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Action dialog */}
      {actionDialog && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 backdrop-blur-sm" onClick={() => !busy && setActionDialog(null)}>
          <div className="bg-popover border border-border rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-bold text-foreground mb-1 capitalize">
              {actionDialog.action.replace("-", " ")}: {actionDialog.account.fullName || actionDialog.account.username}
            </h4>
            <p className="text-xs text-muted-foreground mb-4">{actionDialog.account.username}</p>

            {actionDialog.action === "reset-password" && (
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">New Password</Label>
                  <div className="flex gap-1">
                    <button type="button" onClick={generatePassword} className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 font-semibold">Generate</button>
                    <button type="button" onClick={() => setShowPw(s => !s)} className="text-[10px] px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20">{showPw ? "Hide" : "Show"}</button>
                  </div>
                </div>
                <Input type={showPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters (or click Generate)" className="bg-muted border-border font-mono" />
                <p className="text-[10px] text-muted-foreground">The student will use this password to log in. This also <strong>unlocks</strong> the account + <strong>resets the expiry</strong> — the student can log in immediately. Share the password securely (call/SMS) — it is never shown again.</p>
              </div>
            )}

            {(actionDialog.action === "set-expiry" || actionDialog.action === "unlock") && (
              <div className="space-y-2 mb-3">
                <Label className="text-xs">Expiry (days from now)</Label>
                <Input type="number" value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} placeholder="2 (default), 0 = permanent" className="bg-muted border-border" />
                <p className="text-[10px] text-muted-foreground">Enter the number of days until the account expires. Use <strong>0</strong> for permanent access (no expiry).</p>
              </div>
            )}

            {actionDialog.action === "lock" && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 mb-3">
                The student will be immediately locked out — they cannot log in until you unlock them.
              </div>
            )}

            <div className="space-y-2 mb-4">
              <Label className="text-xs">Reason (required — logged for audit)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Student reported login issue / Payment confirmed / Misuse of account" className="bg-muted border-border min-h-[60px]" />
            </div>

            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => { setActionDialog(null); setReason(""); setNewPassword(""); setShowPw(false); setExpiryDays(""); }} disabled={busy}>Cancel</Button>
              <Button size="sm" onClick={performAction} disabled={busy} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                {busy ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
                Confirm {actionDialog.action.replace("-", " ")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History dialog */}
      {historyDialog && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 backdrop-blur-sm" onClick={() => setHistoryDialog(null)}>
          <div className="bg-popover border border-border rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-bold text-foreground mb-1 flex items-center gap-2"><History className="size-4" /> Activity History</h4>
            <p className="text-xs text-muted-foreground mb-4">{historyDialog.account.fullName || historyDialog.account.username} · {historyDialog.account.username}</p>
            {historyDialog.history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No actions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {historyDialog.history.map((h) => (
                  <div key={h.id} className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        h.action === "lock" ? "bg-rose-500/15 text-rose-500" :
                        h.action === "reset-password" ? "bg-violet-500/15 text-violet-600 dark:text-violet-400" :
                        h.action === "unlock" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                        "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                      )}>{h.action}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(h.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    </div>
                    {h.reason && <p className="text-xs text-foreground">{h.reason}</p>}
                    <div className="text-[10px] text-muted-foreground mt-1">By: {h.adminUser}{h.expiresAt ? ` · Expiry set to ${new Date(h.expiresAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button size="sm" variant="outline" onClick={() => setHistoryDialog(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ActionType = "reset-password" | "lock" | "unlock" | "set-expiry" | "renew";
type HistoryEntry = { id: string; adminUser: string; action: string; reason: string | null; expiresAt: string | null; createdAt: string };


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
      <p className="text-xs text-muted-foreground mb-4">Auto-issue verifiable certificates for completed students. Eligibility: project completed (6/6 stages) + mentor approved.</p>
      {loading ? <Loading /> : certs.length === 0 ? <Empty text="No certificates issued yet. Go to Students tab → find a completed student → click Generate Certificate." /> : (
        <div className="border border-border rounded-lg max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-popover z-10"><tr className="text-left text-[10px] text-muted-foreground border-b border-border"><th className="px-3 py-2">Certificate #</th><th className="px-3 py-2">Student</th><th className="px-3 py-2 hidden md:table-cell">Project</th><th className="px-3 py-2 text-right">Verify / Download</th></tr></thead>
            <tbody>
              {certs.map(c => (
                <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/40">
                  <td className="px-3 py-2"><div className="font-mono text-xs text-cyan-500 dark:text-cyan-400 font-semibold">{c.certificateNumber}</div><div className="text-[10px] text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div></td>
                  <td className="px-3 py-2"><div className="font-medium text-foreground text-xs">{c.student.firstName} {c.student.lastName}</div><div className="text-[10px] text-muted-foreground">{c.student.degree} · {c.student.college}</div></td>
                  <td className="px-3 py-2 hidden md:table-cell text-xs text-foreground max-w-[160px] truncate" title={c.student.project}>{c.student.project}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("view-certificate", { detail: c.certificateNumber }))} className="inline-flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400 hover:text-amber-300 font-semibold mr-2"><Award className="size-3" />View</button>
                    <a href={`/api/certificate/${c.certificateNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-cyan-500 dark:text-cyan-400 hover:text-cyan-200"><ExternalLink className="size-3" />Public</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[11px] text-muted-foreground mt-3"><Award className="size-3 inline text-cyan-400 mr-1" />Each certificate has a unique number (e.g. AP-2026-XXXXXX) — anyone can verify it at <code className="text-cyan-500 dark:text-cyan-400">/api/certificate/&lt;number&gt;</code>.</p>
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
  if (cert) return <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("view-certificate", { detail: cert.certificateNumber }))} className={cn("inline-flex items-center gap-1 text-[11px] text-cyan-500 dark:text-cyan-400 hover:text-cyan-200 font-semibold", small && "h-7")}><Award className="size-3" />{cert.certificateNumber}</button>;
  return <Button size="sm" onClick={gen} disabled={busy} className="h-7 text-[11px] bg-gradient-to-r from-amber-500 to-cyan-500 text-primary-foreground hover:opacity-90">{busy ? <Loader2 className="size-3 animate-spin" /> : <Award className="size-3.5" />}Generate Cert</Button>;
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
      <p className="text-xs text-muted-foreground mb-4">College-wise, branch-wise, technology-wise breakdowns.</p>
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
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold mb-3">{title}</div>
      <div className="space-y-1.5 max-h-56 overflow-y-auto">
        {data.length === 0 ? <div className="text-xs text-muted-foreground">No data.</div> : data.map(([k, n]) => (
          <div key={k} className="text-xs"><div className="flex justify-between mb-0.5"><span className="text-foreground truncate pr-2">{k}</span><span className="text-cyan-500 dark:text-cyan-400 font-semibold tabular-nums">{n}</span></div><div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${(n / max) * 100}%` }} /></div></div>
        ))}
      </div>
    </div>
  );
}

// ── Mentor Management ──
function MentorsTab() {
  const { students, loading } = useStudents();
  if (loading) return <Loading />;
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Mentor Management</h3>
      <p className="text-xs text-muted-foreground mb-4">{MENTORS.length} mentors · student counts by domain · workload.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {MENTORS.map((m) => {
          const assigned = students.filter(s => s.categoryLabel && s.categoryLabel.toLowerCase().includes(m.role.split(" — ")[0]?.toLowerCase() || "zzz"));
          const active = assigned.filter(s => s.internshipStatus === "in_progress");
          const completed = assigned.filter(s => s.internshipStatus === "completed");
          return (
            <div key={m.initials} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="size-10 rounded-full grid place-items-center text-primary-foreground font-bold text-sm" style={{ background: m.color }}>{m.initials}</span>
                <div><div className="font-semibold text-foreground text-sm">{m.name}</div><div className="text-[11px] text-cyan-500">{m.role}</div></div>
              </div>
              <div className="text-[11px] text-muted-foreground mb-2">{m.exp}</div>
              <div className="flex gap-3 text-xs">
                <span className="text-foreground">Assigned: <strong className="text-cyan-500">{assigned.length}</strong></span>
                <span className="text-foreground">Active: <strong className="text-cyan-500">{active.length}</strong></span>
                <span className="text-foreground">Done: <strong className="text-emerald-500">{completed.length}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Attendance ──
function AttendanceTab() {
  const { students, loading } = useStudents();
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  if (loading) return <Loading />;
  const activeStudents = students.filter(s => s.paymentStatus === "confirmed");
  function mark(id: string, status: string) { setAttendance(a => ({ ...a, [id]: status })); }
  const present = Object.values(attendance).filter(s => s === "present").length;
  const absent = Object.values(attendance).filter(s => s === "absent").length;
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Attendance Management</h3>
      <p className="text-xs text-muted-foreground mb-4">Daily tracking — {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
      <div className="flex gap-3 mb-3 text-xs">
        <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Present: {present}</span>
        <span className="px-2 py-1 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">Absent: {absent}</span>
      </div>
      {activeStudents.length === 0 ? <Empty text="No active students to track." /> : (
        <div className="border border-border rounded-lg max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm"><tbody>
            {activeStudents.map(s => (
              <tr key={s.id} className="border-b border-border/50 last:border-0">
                <td className="px-3 py-2"><div className="font-medium text-foreground text-xs">{s.firstName} {s.lastName}</div><div className="text-[10px] text-muted-foreground">Stage {s.currentStage}/6</div></td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {["present", "absent", "leave", "late"].map(st => (
                    <button key={st} onClick={() => mark(s.id, st)} className={cn("ml-1 text-[10px] px-2 py-0.5 rounded-full border capitalize transition-colors",
                      attendance[s.id] === st ? (st === "present" ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/40" : st === "absent" ? "bg-rose-500/20 text-rose-500 border-rose-500/40" : st === "leave" ? "bg-amber-500/20 text-amber-500 border-amber-500/40" : "bg-blue-500/20 text-blue-500 border-blue-500/40")
                      : "bg-muted/50 text-muted-foreground border-border hover:text-foreground")}>{st}</button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody></table>
        </div>
      )}
    </div>
  );
}

// ── Projects ──
function ProjectsTab() {
  const { students, loading } = useStudents();
  if (loading) return <Loading />;
  const totalProjects = CATEGORIES.reduce((sum, c) => sum + c.projects.length, 0);
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Project Management</h3>
      <p className="text-xs text-muted-foreground mb-4">{totalProjects} projects across {CATEGORIES.length} domains · {students.length} student assignments.</p>
      <div className="space-y-3 max-h-[65vh] overflow-y-auto">
        {CATEGORIES.map(cat => {
          const assigned = students.filter(s => s.category === cat.key);
          return (
            <div key={cat.key} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><span className="text-lg">{cat.icon}</span><span className="font-semibold text-foreground text-sm">{cat.label}</span></div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">{cat.projects.length} templates · {assigned.length} assigned</span>
              </div>
              {assigned.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">{assigned.map(s => <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 border border-border text-muted-foreground">{s.firstName} {s.lastName[0]}.</span>)}</div>
              ) : <div className="text-[10px] text-muted-foreground">No students assigned yet.</div>}
              <details className="mt-2"><summary className="text-[10px] text-cyan-500 cursor-pointer">View {cat.projects.length} projects</summary><ul className="mt-1 space-y-0.5">{cat.projects.slice(0, 5).map(p => <li key={p.id} className="text-[10px] text-muted-foreground">#{p.id} {p.name} <span className="text-muted-foreground">({p.tags})</span></li>)}{cat.projects.length > 5 && <li className="text-[10px] text-muted-foreground">… +{cat.projects.length - 5} more</li>}</ul></details>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AI Analytics ──
function AIAnalyticsTab() {
  const { toast } = useToast();
  const [insights, setInsights] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  async function generate() {
    setLoadingAI(true); setInsights("");
    try {
      const res = await fetch("/api/admin/ai-analytics", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);
      setInsights(data.insights);
      toast({ title: "AI insights generated" });
    } catch (e) { toast({ title: "AI analytics failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setLoadingAI(false); }
  }
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">AI Analytics Dashboard</h3>
      <p className="text-xs text-muted-foreground mb-4">ML-powered insights: dropout risk, performance forecast, certificate eligibility.</p>
      <Button onClick={generate} disabled={loadingAI} className="mb-4 bg-gradient-to-r from-violet-600 to-cyan-500 text-primary-foreground hover:opacity-90 h-9">
        {loadingAI ? <><Loader2 className="size-4 animate-spin mr-2" />Analyzing…</> : <><Brain className="size-4 mr-2" />Generate AI Insights</>}
      </Button>
      {insights ? (
        <div className="prose prose-sm max-w-none bg-muted/30 border border-border rounded-lg p-4 prose-h2:text-cyan-500 prose-h2:text-sm prose-strong:text-foreground prose-ul:my-2 prose-li:my-0.5 prose-p:my-1.5">
          <ReactMarkdown>{insights}</ReactMarkdown>
        </div>
      ) : !loadingAI && <p className="text-xs text-muted-foreground">Click "Generate AI Insights" to analyze student lifecycle data.</p>}
    </div>
  );
}

// ── Notifications ──
function NotificationsTab() {
  const { students, loading } = useStudents();
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const activeStudents = students.filter(s => s.paymentStatus === "confirmed");
  const student = students.find(s => s.id === selected);
  function sendWhatsApp() {
    if (!student || !message.trim()) return;
    window.open(`https://wa.me/${student.mobile.replace(/[\s+]/g, "").replace(/^91/, "91")}?text=${encodeURIComponent(`*AgileProjection NT-AI*\n\nHi ${student.firstName},\n\n${message}`)}`, "_blank");
  }
  function sendEmail() {
    if (!student || !message.trim()) return;
    window.open(`mailto:${student.email}?subject=${encodeURIComponent("AgileProjection — Notification")}&body=${encodeURIComponent(message)}`, "_blank");
  }
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Notification Center</h3>
      <p className="text-xs text-muted-foreground mb-4">Send WhatsApp / email notifications to students.</p>
      {loading ? <Loading /> : activeStudents.length === 0 ? <Empty text="No approved students to notify." /> : (
        <div className="space-y-3">
          <div><Label className="text-xs">Select Student</Label><select value={selected} onChange={e => setSelected(e.target.value)} className="w-full mt-1 bg-muted/50 border border-border rounded-md h-9 px-2 text-sm text-foreground"><option value="">— Select —</option>{activeStudents.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.email})</option>)}</select></div>
          <div><Label className="text-xs">Message</Label><textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="e.g. Your batch starts tomorrow at 6 PM IST." className="w-full mt-1 bg-muted/50 border border-border rounded-md p-2 text-sm text-foreground resize-none" /></div>
          <div className="flex gap-2">
            <Button onClick={sendWhatsApp} disabled={!student || !message.trim()} className="bg-gradient-to-r from-emerald-600 to-cyan-500 text-primary-foreground hover:opacity-90 h-9"><MessageCircle className="size-4 mr-2" />Send WhatsApp</Button>
            <Button onClick={sendEmail} disabled={!student || !message.trim()} variant="outline" className="bg-muted/50 border-border text-foreground hover:text-cyan-500 h-9"><Mail className="size-4 mr-2" />Send Email</Button>
          </div>
        </div>
      )}
      <div className="mt-4 rounded-lg border border-border bg-card p-3">
        <div className="text-[11px] uppercase tracking-wider text-cyan-500 font-semibold mb-2">Quick Templates</div>
        <div className="flex flex-wrap gap-1.5">{["Batch starts tomorrow at 6 PM IST","Your assignment is due in 2 days","Attendance warning: below 75%","Your certificate is ready!","Project submission deadline extended"].map(t => <button key={t} onClick={() => setMessage(t)} className="text-[10px] px-2 py-1 rounded-md bg-muted/50 border border-border text-muted-foreground hover:text-cyan-500 hover:border-cyan-500/30">{t}</button>)}</div>
      </div>
    </div>
  );
}

// ── Settings ──
function SettingsTab() {
  const lists = [
    { label: "Degrees", items: DEGREES }, { label: "Branches", items: BRANCHES },
    { label: "Plans", items: PLANS }, { label: "States", items: STATES },
    { label: "Sources", items: SOURCES }, { label: "Internship Tracks", items: PROGRAMS.map(p => p.title) },
    { label: "AI/ML Domains", items: CATEGORIES.map(c => c.label) }, { label: "Mentors", items: MENTORS.map(m => m.name) },
  ];
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Settings</h3>
      <p className="text-xs text-muted-foreground mb-4">Configurable lists · roles · permissions.</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {lists.map(l => (
          <div key={l.label} className="bg-card border border-border rounded-xl p-3">
            <div className="text-[11px] uppercase tracking-wider text-cyan-500 font-semibold mb-2">{l.label} ({l.items.length})</div>
            <div className="flex flex-wrap gap-1">{l.items.map(i => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 border border-border text-muted-foreground">{i}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="text-[11px] uppercase tracking-wider text-cyan-500 font-semibold mb-2">Roles & Permissions</div>
        <table className="w-full text-xs"><thead><tr className="text-left text-muted-foreground border-b border-border"><th className="py-1.5">Role</th><th>Access</th></tr></thead><tbody>
          {[{r:"Super Admin",a:"Full access — all modules + settings + roles"},{r:"Admin",a:"Students, Applications, Payments, Certificates, Reports, Notifications"},{r:"Mentor",a:"Assigned students, attendance, project reviews"},{r:"College Coordinator",a:"College-wise student reports"},{r:"Student",a:"Dashboard, track project, AI mentor, certificates"}].map(x => <tr key={x.r} className="border-b border-border/50 last:border-0"><td className="py-1.5 font-semibold text-foreground">{x.r}</td><td className="text-muted-foreground">{x.a}</td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}

// ── Payments ──
function PaymentsTab() {
  const { students, loading } = useStudents();
  if (loading) return <Loading />;
  const pending = students.filter(s => s.paymentStatus !== "confirmed");
  const confirmed = students.filter(s => s.paymentStatus === "confirmed");
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Payment Management</h3>
      <p className="text-xs text-muted-foreground mb-4">Track payment status · refunds · revenue.</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="font-bold text-xl text-amber-500">{pending.length}</div><div className="text-[10px] text-muted-foreground">Pending</div></div>
        <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="font-bold text-xl text-emerald-500">{confirmed.length}</div><div className="text-[10px] text-muted-foreground">Completed</div></div>
        <div className="bg-card border border-border rounded-xl p-3 text-center"><div className="font-bold text-xl text-cyan-500">₹{confirmed.length * 2499}</div><div className="text-[10px] text-muted-foreground">Est. Revenue</div></div>
      </div>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {students.slice(0, 20).map(s => (
          <div key={s.id} className="flex items-center justify-between bg-card border border-border rounded-lg p-2">
            <div><div className="text-xs font-medium text-foreground">{s.firstName} {s.lastName}</div><div className="text-[10px] text-muted-foreground">{s.plan}</div></div>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", s.paymentStatus === "confirmed" ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-amber-500/15 text-amber-500 border-amber-500/30")}>{s.paymentStatus === "confirmed" ? "✅ Paid" : "⏳ Pending"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Internships ──
function InternshipsTab() {
  return (
    <div>
      <h3 className="font-bold text-lg mb-1">Internship Management</h3>
      <p className="text-xs text-muted-foreground mb-4">{PROGRAMS.length} active tracks + AI/ML industry internship.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {PROGRAMS.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{p.icon}</span><div><div className="font-semibold text-foreground text-sm">{p.title}</div><div className="text-[10px] text-muted-foreground">{p.badge}</div></div></div>
            <p className="text-[11px] text-muted-foreground mb-2">{p.desc.slice(0, 100)}…</p>
            <div className="flex flex-wrap gap-1 mb-2">{p.tags.slice(0, 3).map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 border border-border text-muted-foreground">{t}</span>)}</div>
            <div className="flex gap-3 text-[10px] text-muted-foreground">{p.meta.map((m, i) => <span key={i}>{m.strong} {m.label}</span>)}</div>
          </div>
        ))}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🚀</span><div><div className="font-semibold text-foreground text-sm">AI/ML Industry Internship</div><div className="text-[10px] text-muted-foreground">6 Weeks · 80+ Projects</div></div></div>
          <p className="text-[11px] text-muted-foreground mb-2">End-to-end ML pipeline: {AIML_CURRICULUM.map(c => c.title.split(" ")[0]).join(" → ")}</p>
          <div className="text-[10px] text-muted-foreground">6 stages · LLM-generated training per week</div>
        </div>
      </div>
    </div>
  );
}

// ── Stub (fallback) ──
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
      <p className="text-xs text-muted-foreground mb-4">{info.desc}</p>
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
        <div className="size-12 rounded-xl bg-secondary border border-border grid place-items-center text-cyan-400 mx-auto mb-3"><Brain className="size-6" /></div>
        <div className="font-semibold text-foreground text-sm">Part of the NT-AI enterprise admin suite</div>
        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">This module is scaffolded in the sidebar. Planned features:</p>
        <ul className="text-xs text-muted-foreground mt-3 max-w-md mx-auto space-y-1 text-left">
          {info.features.map(f => <li key={f} className="flex items-start gap-1.5"><CheckCircle2 className="size-3 text-cyan-400 mt-0.5 shrink-0" />{f}</li>)}
        </ul>
      </div>
    </div>
  );
}

function Loading() { return <div className="py-10 text-center text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin mx-auto mb-2" /> Loading…</div>; }
function Empty({ text }: { text: string }) { return <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">{text}</div>; }
function Badge({ color, icon, children }: { color: "amber" | "cyan" | "emerald"; icon: React.ReactNode; children: React.ReactNode }) {
  const c = { amber: "bg-amber-500/15 text-amber-300 border-amber-500/30", cyan: "bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border-cyan-500/30", emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" }[color];
  return <span className={cn("inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border", c)}>{icon}{children}</span>;
}
