"use client";

import * as React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  LogIn,
  LogOut,
  UserCircle2,
  ShieldCheck,
  Lock,
  Unlock,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Search,
  Rocket,
  LayoutDashboard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AdminDashboard } from "@/components/agile/admin-dashboard";
import { StudentDashboard } from "@/components/agile/student-dashboard";
import Link from "next/link";

type Role = "admin" | "guest";
type User = {
  username: string;
  role: Role;
  status: string;
  fullName: string | null;
  expiresAt: string | null;
  expired?: boolean;
};
type AccountRow = {
  id: string;
  username: string;
  role: Role;
  status: string;
  fullName: string | null;
  note: string | null;
  passwordSetAt: string | null;
  expiresAt: string | null;
  expired: boolean;
};

export function AuthMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const { toast } = useToast();

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.ok ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (o) refreshMe();
    }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={user ? "Account" : "Login"}
          className={cn(
            "gap-1.5 text-slate-200 hover:text-cyan-300",
            "lg:px-2 lg:py-2"
          )}
        >
          {bootstrapping ? (
            <Loader2 className="size-4 animate-spin" />
          ) : user ? (
            <>
              {user.role === "admin" ? (
                <ShieldCheck className="size-4 text-cyan-400" />
              ) : (
                <UserCircle2 className="size-4 text-cyan-400" />
              )}
              <span className="hidden sm:inline">{user.username}</span>
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              <span className="hidden sm:inline">Login</span>
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0e1b2e] border-[rgba(6,182,212,0.25)] text-foreground sm:max-w-md lg:sm:max-w-2xl">
        {user ? (
          user.role === "admin" ? (
            <AdminPanel user={user} onLogout={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              setUser(null);
              setOpen(false);
              toast({ title: "Logged out" });
            }} onAccountsChanged={refreshMe} />
          ) : (
            <GuestPanel user={user} onLogout={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              setUser(null);
              setOpen(false);
              toast({ title: "Logged out" });
            }} />
          )
        ) : (
          <LoginForm
            onLoggedIn={(u) => {
              setUser(u);
              toast({ title: `Welcome, ${u.username}!`, description: u.role === "admin" ? "Admin access granted." : "Access granted." });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Login form ──
function LoginForm({ onLoggedIn }: { onLoggedIn: (u: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed");
        return;
      }
      onLoggedIn(data.user);
    } catch (err) {
      setError((err as Error).message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  function fill(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError(null);
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <LogIn className="size-5 text-cyan-400" /> Portal Login
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          Sign in with your account. <strong className="text-slate-200">Students:</strong> use your registration email + mobile number. Admin: admin / admin123.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4 mt-5">
        <div className="space-y-1.5">
          <Label htmlFor="lu">Username</Label>
          <Input
            id="lu"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your email  /  admin"
            className="bg-[#0a1422] border-[rgba(6,182,212,0.18)]"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lp">Password</Label>
          <Input
            id="lp"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-[#0a1422] border-[rgba(6,182,212,0.18)]"
            required
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md p-3">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 h-10"
        >
          {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <LogIn className="size-4 mr-2" />}
          Sign In
        </Button>
      </form>

      {/* Demo credentials helper */}
      <div className="mt-5 rounded-xl border border-[rgba(6,182,212,0.18)] bg-[#0a1422]/70 p-4">
        <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold mb-2 flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> Demo accounts (click to autofill)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CredentialButton label="admin" sub="admin123" onClick={() => fill("admin", "admin123")} onCopy={() => copy("admin123", "admin")} copied={copied === "admin"} role="admin" />
          <CredentialButton label="guest1" sub="guest1" onClick={() => fill("guest1", "guest1")} onCopy={() => copy("guest1", "guest1")} copied={copied === "guest1"} />
          <CredentialButton label="guest2" sub="guest2" onClick={() => fill("guest2", "guest2")} onCopy={() => copy("guest2", "guest2")} copied={copied === "guest2"} />
          <CredentialButton label="guest3" sub="guest3" onClick={() => fill("guest3", "guest3")} onCopy={() => copy("guest3", "guest3")} copied={copied === "guest3"} />
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
          Students start <span className="text-amber-300">locked</span> (demo accounts). <strong className="text-slate-200">Registered students</strong> log in with their email + mobile (auto-created at registration). Sign in as <span className="text-cyan-300 font-semibold">admin</span> to unlock demo accounts or manage students.
        </p>
      </div>
    </div>
  );
}

function CredentialButton({
  label,
  sub,
  onClick,
  onCopy,
  copied,
  role,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  onCopy: () => void;
  copied: boolean;
  role?: "admin";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-[#0F2340] border border-[rgba(6,182,212,0.18)] hover:border-cyan-500/40 transition-colors text-left"
    >
      <div>
        <div className="text-xs font-semibold text-foreground flex items-center gap-1">
          {role === "admin" && <ShieldCheck className="size-3 text-cyan-400" />}
          {label}
        </div>
        <div className="text-[10px] text-slate-500">pass: {sub}</div>
      </div>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); onCopy(); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); onCopy(); } }}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-slate-400 hover:text-cyan-300"
        title="Copy password"
      >
        {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
      </span>
    </button>
  );
}

// ── Student panel (was "Guest panel"; role=guest is labeled "Student" in the UI) ──
function GuestPanel({ user, onLogout }: { user: User; onLogout: () => void }) {
  // Registered students have expiresAt=null (permanent access). Demo accounts
  // have expiresAt set by the admin (2-day window). Only treat as expired if
  // the server said so OR there's an expiry date that has passed.
  const expired = user.expired || (!!user.expiresAt && Date.now() > new Date(user.expiresAt).getTime());
  const hasExpiry = !!user.expiresAt;
  const remaining = useMemo(() => msRemaining(user.expiresAt), [user.expiresAt]);
  const [, force] = useState(0);
  useEffect(() => {
    if (expired || !hasExpiry) return;
    const t = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [expired, hasExpiry]);

  const live = msRemaining(user.expiresAt);

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <UserCircle2 className="size-5 text-cyan-400" />
          Welcome, {user.fullName || user.username}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          You are signed in as <span className="text-cyan-300 font-semibold">{user.username}</span> (Student).
        </DialogDescription>
      </DialogHeader>

      {/* Quick-access links — professional portal entry */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="col-span-1"><StudentDashboard /></div>
        <Button asChild variant="outline" className="bg-[#0F2340] border-[rgba(6,182,212,0.22)] text-slate-100 hover:text-cyan-300 h-12">
          <Link href="#project-tracker"><Search className="size-4 mr-1.5" />Track Project</Link>
        </Button>
      </div>
      <div className="mt-2">
        <Button asChild variant="outline" className="w-full bg-[#0F2340] border-[rgba(6,182,212,0.22)] text-slate-100 hover:text-cyan-300 h-10">
          <Link href="#register"><Rocket className="size-4 mr-1.5" />Register for another project</Link>
        </Button>
      </div>

      {/* Access status */}
      <div className="mt-5 rounded-xl border border-[rgba(6,182,212,0.22)] bg-[#0a1422]/70 p-5">
        {expired ? (
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-rose-300">Access expired</div>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Your 2-day access window has ended. Please contact the admin to renew —
                email <a className="text-cyan-300 underline underline-offset-4" href="mailto:hr@agileprojection.com">hr@agileprojection.com</a>{" "}
                or WhatsApp <a className="text-cyan-300 underline underline-offset-4" href="https://wa.me/918319985622">+91 83199 85622</a>.
              </p>
            </div>
          </div>
        ) : hasExpiry ? (
          <div className="flex items-start gap-3">
            <Clock className="size-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-emerald-300">Access active (demo)</div>
              <p className="text-sm text-slate-400 mt-1">Your password expires in:</p>
              <div className="mt-2 font-mono text-2xl font-bold text-foreground tabular-nums">
                {live.days > 0 && <span>{live.days}d </span>}
                {String(live.hours).padStart(2, "0")}h {String(live.minutes).padStart(2, "0")}m {String(live.seconds).padStart(2, "0")}s
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Expires {new Date(user.expiresAt!).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-emerald-300">Access active ✓</div>
              <p className="text-sm text-slate-400 mt-1">
                Your student account is active. Open the Student Dashboard to register, track your project, ask the AI mentor, and view the schedule.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button variant="outline" onClick={onLogout} className="bg-[#0F2340] border-[rgba(6,182,212,0.22)] text-slate-200 hover:text-cyan-300">
          <LogOut className="size-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}

// ── Admin panel ──
function AdminPanel({
  user,
  onLogout,
  onAccountsChanged,
}: {
  user: User;
  onLogout: () => void;
  onAccountsChanged: () => void;
}) {
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setAccounts(data.accounts);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function unlock(username: string) {
    setUnlocking(username);
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, reason: "Payment received — access renewed for 2 days" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast({ title: "Unlock failed", description: data.error, variant: "destructive" });
        return;
      }
      toast({ title: `Unlocked ${username}`, description: "Access renewed for 2 days (payment confirmed)." });
      await load();
      onAccountsChanged();
    } catch (err) {
      toast({ title: "Unlock failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUnlocking(null);
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <ShieldCheck className="size-5 text-cyan-400" />
          Admin Console · {user.username}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          Unlock a guest account to grant 2 days of access. Confirm payment was received before unlocking.
        </DialogDescription>
      </DialogHeader>
      {/* Open the full enterprise Admin Dashboard (KPIs / Students / Applications / Certificates / Reports…) */}
      <div className="mt-4 mb-4 rounded-xl border border-[rgba(6,182,212,0.22)] bg-gradient-to-r from-violet-600/10 to-cyan-500/10 p-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">Enterprise Admin Dashboard</div>
          <div className="text-[11px] text-slate-400">KPIs · Students · Applications · Payments · Certificates · Reports · AI Analytics · Settings</div>
        </div>
        <AdminDashboard />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-cyan-400 font-semibold">
          Accounts ({accounts.length})
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-slate-300 hover:text-cyan-300 h-8">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          Refresh
        </Button>
      </div>

      <div className="mt-2 max-h-80 overflow-y-auto -mx-1 px-1">
        {loading && accounts.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            <Loader2 className="size-5 animate-spin mx-auto mb-2" />
            Loading accounts…
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">No accounts found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#0e1b2e] z-10">
              <tr className="text-left text-xs text-slate-400 border-b border-[rgba(6,182,212,0.18)]">
                <th className="px-2 py-2 font-semibold">User</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold hidden sm:table-cell">Expires</th>
                <th className="px-2 py-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const isExpired = a.expired;
                const isLocked = a.role === "guest" && (a.status !== "unlocked" || isExpired);
                const isExpiringSoon = a.role === "guest" && !isLocked && a.expiresAt && msRemaining(a.expiresAt).total < 12 * 3600 * 1000;
                return (
                  <tr key={a.id} className="border-b border-[rgba(6,182,212,0.08)] hover:bg-[#0F2340]/40">
                    <td className="px-2 py-2.5">
                      <div className="font-medium text-foreground flex items-center gap-1.5">
                        {a.role === "admin" ? (
                          <ShieldCheck className="size-3.5 text-cyan-400" />
                        ) : (
                          <UserCircle2 className="size-3.5 text-slate-400" />
                        )}
                        {a.username}
                      </div>
                      <div className="text-[11px] text-slate-500">{a.fullName}</div>
                    </td>
                    <td className="px-2 py-2.5">
                      {a.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          <CheckCircle2 className="size-3" /> Active
                        </span>
                      ) : isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <Lock className="size-3" /> {isExpired && a.status === "unlocked" ? "Expired" : "Locked"}
                        </span>
                      ) : (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border",
                          isExpiringSoon
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        )}>
                          <Unlock className="size-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 hidden sm:table-cell text-xs text-slate-400">
                      {a.role === "admin" ? (
                        <span className="text-slate-500">Never expires</span>
                      ) : isLocked ? (
                        <span className="text-slate-500">—</span>
                      ) : (
                        <span className="tabular-nums">
                          {msRemaining(a.expiresAt).days > 0 ? `${msRemaining(a.expiresAt).days}d ` : ""}
                          {String(msRemaining(a.expiresAt).hours).padStart(2, "0")}h{" "}
                          {String(msRemaining(a.expiresAt).minutes).padStart(2, "0")}m
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      {a.role === "admin" ? (
                        <span className="text-[11px] text-slate-500">—</span>
                      ) : (
                        <Button
                          size="sm"
                          variant={isLocked ? "default" : "outline"}
                          onClick={() => unlock(a.username)}
                          disabled={unlocking === a.username}
                          className={cn(
                            "h-7 text-xs px-2.5",
                            isLocked
                              ? "bg-gradient-to-r from-emerald-600 to-cyan-500 text-white hover:opacity-90"
                              : "bg-[#0F2340] border-[rgba(6,182,212,0.22)] text-slate-200 hover:text-cyan-300"
                          )}
                        >
                          {unlocking === a.username ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : isLocked ? (
                            <Unlock className="size-3.5" />
                          ) : (
                            <RefreshCw className="size-3.5" />
                          )}
                          {isLocked ? "Unlock" : "Renew"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-slate-500 flex-1 min-w-[200px]">
          <ShieldCheck className="size-3.5 inline text-cyan-400 mr-1" />
          Unlocking confirms payment was received. An audit entry is logged for each unlock.
        </p>
        <Button variant="outline" onClick={onLogout} className="bg-[#0F2340] border-[rgba(6,182,212,0.22)] text-slate-200 hover:text-cyan-300">
          <LogOut className="size-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}

// ── helpers ──
function msRemaining(iso: string | null): { total: number; days: number; hours: number; minutes: number; seconds: number } {
  const zero = { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (!iso) return zero;
  const total = Math.max(0, new Date(iso).getTime() - Date.now());
  const days = Math.floor(total / (24 * 3600 * 1000));
  const hours = Math.floor((total % (24 * 3600 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((total % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((total % (60 * 1000)) / 1000);
  return { total, days, hours, minutes, seconds };
}
