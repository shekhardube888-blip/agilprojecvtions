"use client";

import { useState } from "react";
import { Loader2, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  onSignedUp: (user: { username: string; role: string; status: string; fullName: string | null }) => void;
  onSwitchToLogin: () => void;
};

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  mobile?: string;
};

function validateEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function SignupForm({ onSignedUp, onSwitchToLogin }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const { toast } = useToast();

  function validate(): boolean {
    const e: FieldErrors = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!validateEmail(email.trim())) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!mobile.trim()) e.mobile = "Mobile number is required";
    else {
      const digits = mobile.replace(/[\s\-()+]/g, "");
      if (!/^\d{7,15}$/.test(digits)) e.mobile = "Enter a valid mobile (7-15 digits)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, mobile }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setServerError(data.error || "Signup failed");
        if (data.code === "DUPLICATE") {
          setErrors((prev) => ({ ...prev, email: data.error }));
        }
        return;
      }
      toast({
        title: `Welcome, ${data.user.fullName || data.user.username}!`,
        description: "Your student account is ready. Complete your registration to choose a project.",
      });
      onSignedUp(data.user);
    } catch (err) {
      setServerError((err as Error).message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="su-name">Full Name</Label>
        <Input
          id="su-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="bg-background border-border"
          aria-invalid={!!errors.fullName}
        />
        {errors.fullName && <p className="text-[11px] text-rose-500">{errors.fullName}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="su-email">Email (Mail ID)</Label>
        <Input
          id="su-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="bg-background border-border"
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-[11px] text-rose-500">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="su-mobile">Mobile Number</Label>
        <Input
          id="su-mobile"
          type="tel"
          autoComplete="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="e.g. +91 98765 43210"
          className="bg-background border-border"
          aria-invalid={!!errors.mobile}
        />
        {errors.mobile && <p className="text-[11px] text-rose-500">{errors.mobile}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="su-pass">Password</Label>
          <Input
            id="su-pass"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="bg-background border-border"
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-[11px] text-rose-500">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="su-pass2">Confirm</Label>
          <Input
            id="su-pass2"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="bg-background border-border"
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <p className="text-[11px] text-rose-500">{errors.confirmPassword}</p>}
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-xs text-muted-foreground">
        <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-cyan-500 dark:text-cyan-400" />
        <span>
          By signing up you get a <strong className="text-foreground">student account</strong> — permanent access, no expiry.
          Complete your project registration from the dashboard after login.
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full h-12 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all",
          "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20",
          "hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        {loading ? "Creating account…" : "Create Student Account"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} className="text-cyan-500 dark:text-cyan-400 font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
}
