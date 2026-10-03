"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Search,
  PartyPopper,
  MessageCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  IdCard,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PaymentPage } from "@/components/agile/payment-page";
import { GoogleSignInButton } from "@/components/agile/google-sign-in-button";
import {
  CATEGORIES,
  DEGREES,
  BRANCHES,
  SEMESTERS,
  PLANS,
  STATES,
  SOURCES,
} from "@/lib/data";
import type { Category, Project } from "@/lib/data";
import { cn } from "@/lib/utils";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  degree: string;
  branch: string;
  semester: string;
  plan: string;
  college: string;
  state: string;
  source: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  degree: "",
  branch: "",
  semester: "",
  plan: "",
  college: "",
  state: "",
  source: "",
  notes: "",
};

type SubmitResult = {
  id: number;
  student: { name: string; email: string; project: string; categoryLabel: string };
  notification: {
    whatsappUrl: string;
    mailtoUrl: string;
    smtpSent: boolean;
  };
};

const STEPS_META = [
  { n: 1, label: "Category" },
  { n: 2, label: "Project" },
  { n: 3, label: "Details" },
  { n: 4, label: "Confirm" },
];

export function RegisterForm() {
  const { data: session, status } = useSession();
  // Email is sourced from the active Google session (read-only). Empty when
  // unauthenticated. The same email is sent to /api/register on submit, so
  // the backend can guarantee the registration email matches the Google login.
  const googleEmail = session?.user?.email?.toLowerCase().trim() || "";
  const authLoading = status === "loading";
  const isSignedIn = !!googleEmail && status === "authenticated";
  // Set by /api/register when it detects a duplicate registration for the
  // same Google email. Renders an inline "already registered" banner with a
  // link to log in.
  const [duplicateEmail, setDuplicateEmail] = React.useState<string | null>(null);

  const [step, setStep] = React.useState(1);
  const [category, setCategory] = React.useState<Category | null>(null);
  const [project, setProject] = React.useState<Project | null>(null);
  const [search, setSearch] = React.useState("");
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [consentWa, setConsentWa] = React.useState(true);
  const [consentEm, setConsentEm] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<SubmitResult | null>(null);
  const { toast } = useToast();

  // Filtered projects in current category
  const filteredProjects = React.useMemo(() => {
    if (!category) return [];
    const q = search.trim().toLowerCase();
    if (!q) return category.projects;
    return category.projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.tags.toLowerCase().includes(q)
    );
  }, [category, search]);

  function pickCategory(c: Category) {
    setCategory(c);
    setProject(null); // reset project selection when category changes
    setSearch("");
  }

  function canNext(): boolean {
    if (step === 1) return !!category;
    if (step === 2) return !!project;
    if (step === 3) return Object.keys(errors).length === 0 && validateStep3();
    return true;
  }

  function validateStep3(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    // Email is sourced from the active Google session — it is guaranteed
    // valid and read-only on the client. Backend re-validates the email
    // against the Google session, so we don't re-check the format here.
    if (!/^[+\d][\d\s-]{8,}$/.test(form.mobile))
      e.mobile = "Valid mobile number required";
    if (!form.degree) e.degree = "Select your degree";
    if (!form.branch) e.branch = "Select your branch";
    if (!form.semester) e.semester = "Select semester";
    if (!form.plan) e.plan = "Select a plan";
    if (!form.college.trim()) e.college = "College name required";
    if (!form.state) e.state = "Select your state";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 3 && !validateStep3()) {
      toast({ title: "Please fix the errors", description: "Some required fields are missing or invalid.", variant: "destructive" });
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!category || !project) return;
    // Email is owned by the active Google session — we refuse to submit a
    // registration without one. Backend re-validates this same check.
    if (!googleEmail) {
      toast({
        title: "Sign in with Google first",
        description: "Your registration email is taken from your Google account. Click the Google Sign-In banner above to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!consentWa && !consentEm) {
      toast({
        title: "Consent required",
        description: "Please allow at least one contact channel (WhatsApp/phone or email) so our team can reach you.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    setDuplicateEmail(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          // Email is read-only and pulled from the Google session so a
          // logged-in student can never register a different email.
          email: googleEmail,
          mobile: form.mobile,
          degree: form.degree,
          branch: form.branch,
          semester: form.semester,
          plan: form.plan,
          college: form.college,
          state: form.state,
          source: form.source || undefined,
          notes: form.notes || undefined,
          category: category.key,
          categoryLabel: category.label,
          project: project.name,
          projectId: project.id,
          consentWa,
          consentEm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        // Backend signals a duplicate registration for the same Google email
        // with `code: "DUPLICATE"` (see backend agent /api/register update).
        // Show an inline "already registered" banner with a login link
        // instead of the generic error toast.
        if (data.code === "DUPLICATE" || /duplicate/i.test(data.error || "")) {
          setDuplicateEmail(googleEmail);
          toast({
            title: "Already registered",
            description: "You are already registered with this Google account.",
          });
          return;
        }
        throw new Error(data.error || "Submission failed");
      }
      setResult({
        id: data.id,
        student: data.student,
        notification: data.notification,
      });
      toast({
        title: "🎉 Enrolment Submitted!",
        description: `Your registration for "${project.name}" was saved. Open WhatsApp or email to confirm with Shekhar's team.`,
      });
    } catch (err) {
      toast({
        title: "Submission failed",
        description: (err as Error).message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setResult(null);
    setStep(1);
    setCategory(null);
    setProject(null);
    setSearch("");
    setForm(EMPTY_FORM);
    setErrors({});
    setConsentWa(true);
    setConsentEm(true);
    setDuplicateEmail(null);
  }

  return (
    <section
      id="register"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="register-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Free Enrolment · 4 Steps
        </div>
        <h2 id="register-h2" className="font-bold text-3xl md:text-4xl">
          Register for your <span className="ap-gradient-text">free internship</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
          Pick a track, choose a project, enter your details, and confirm. No fee, no documents, no friction — your seat is reserved the moment you submit.
        </p>
      </div>

      <div className="bg-popover border border-border rounded-2xl p-5 md:p-8">
        {result ? (
          <SuccessPanel result={result} onReset={resetAll} />
        ) : (
          <>
            {/* Duplicate-registration banner — backend signals `code: "DUPLICATE"`
                when the Google email already has a student record. */}
            {duplicateEmail && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                <AlertTriangle className="size-5 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-amber-700 dark:text-amber-300 text-sm">
                    You are already registered with this Google account.
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Email <span className="font-mono text-foreground">{duplicateEmail}</span> already has a
                    student record. Log in to continue and track your project, or use a different Google
                    account to register a new student.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href="/?google=1"
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-semibold hover:opacity-90"
                    >
                      <Mail className="size-3.5" /> Log in with Google
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDuplicateEmail(null)}
                      className="bg-secondary border-border text-foreground hover:text-cyan-300 h-9"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Not-signed-in banner — Google session is required because the
                registration email is sourced from it (read-only). */}
            {!isSignedIn && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 flex flex-col sm:flex-row sm:items-start gap-3"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="size-5 text-cyan-400 mt-0.5 shrink-0 animate-spin" />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground text-sm">Checking your Google session…</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hang on a moment while we look up your signed-in Google account.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="size-5 text-cyan-500 dark:text-cyan-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground text-sm">
                        ⚠ Sign in with Google to register.
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Your Google email will be used for registration and cannot be changed. This
                        guarantees every registration is tied to a verified Google identity and prevents
                        duplicate sign-ups.
                      </p>
                      <div className="mt-3 max-w-sm">
                        <GoogleSignInButton label="Sign in with Google to register" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* When not signed in, the wizard below is greyed out + non-interactive
                so the student has to complete Google Sign-In before picking a
                category / project / entering details. */}
            <div
              aria-disabled={!isSignedIn}
              className={cn(
                "transition-all",
                !isSignedIn && "pointer-events-none opacity-50 select-none"
              )}
            >
              {/* Step indicators */}
              <StepIndicator current={step} />

              {/* STEP 1 — Category */}
              {step === 1 && (
                <div className="mt-8">
                  <StepHeader
                    num={1}
                    title="Select your internship category"
                    desc="Pick the AI/ML domain or classic track you want to intern in. You can change this any time before submitting."
                  />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mt-6">
                  {CATEGORIES.map((c) => {
                    const active = category?.key === c.key;
                    return (
                      <button
                        type="button"
                        key={c.key}
                        onClick={() => pickCategory(c)}
                        aria-pressed={active}
                        className={cn(
                          "ap-lift text-left p-4 rounded-xl border transition-all relative",
                          active
                            ? "border-cyan-400 bg-secondary ring-2 ring-cyan-500/40"
                            : "border-border bg-card hover:border-cyan-500/40"
                        )}
                      >
                        <div className="text-2xl mb-2" aria-hidden>{c.icon}</div>
                        <div className="text-sm font-semibold text-foreground leading-tight">
                          {c.label}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">{c.sub}</div>
                        {active && (
                          <span className="absolute top-3 right-3 size-5 rounded-full ap-gradient-cyan grid place-items-center text-navy">
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <WizardNav
                  back={null}
                  next={category ? () => next() : undefined}
                  nextLabel="Next: Choose Project"
                />
              </div>
            )}

            {/* STEP 2 — Project */}
            {step === 2 && category && (
              <div className="mt-8">
                <StepHeader
                  num={2}
                  title={`Choose a project in ${category.label}`}
                  desc={`${category.projects.length} projects available. Search by name or tag, then select one to continue.`}
                />
                <div className="relative mt-4 mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects by name or tag (e.g. RAG, YOLO, churn, ESP32…)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-muted border-border"
                    aria-label="Search projects"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto pr-1 grid gap-2">
                  {filteredProjects.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-6">
                      No projects match &ldquo;{search}&rdquo;. Try a different keyword.
                    </div>
                  )}
                  {filteredProjects.map((p) => {
                    const active = project?.id === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setProject(p)}
                        aria-pressed={active}
                        className={cn(
                          "text-left p-3 rounded-lg border transition-all flex items-start gap-3",
                          active
                            ? "border-cyan-400 bg-secondary ring-2 ring-cyan-500/40"
                            : "border-border bg-card hover:border-cyan-500/40"
                        )}
                      >
                        <span className="size-6 shrink-0 rounded-md bg-muted border border-border grid place-items-center text-[10px] font-bold text-muted-foreground mt-0.5">
                          {p.id}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {p.name}
                          </span>
                          <span className="block text-[11px] text-muted-foreground mt-0.5">
                            {p.tags}
                          </span>
                          {active && (
                            <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-cyan-300 font-medium">
                              <Check className="size-3" /> Selected
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {project && (
                  <div className="mt-4 p-3 rounded-lg border border-cyan-500/30 bg-secondary text-sm text-cyan-200 flex items-center gap-2">
                    <Check className="size-4" /> Selected project:{" "}
                    <strong className="font-semibold">{project.name}</strong>
                  </div>
                )}
                <WizardNav
                  back={() => back()}
                  next={project ? () => next() : undefined}
                  nextLabel="Next: Your Details"
                />
              </div>
            )}

            {/* STEP 3 — Details */}
            {step === 3 && (
              <div className="mt-8">
                <StepHeader
                  num={3}
                  title="Your details"
                  desc="We need your basic info to register you on the program and issue your certificate. We never sell your data — see our privacy notes below."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Field label="First Name" error={errors.firstName} required>
                    <Input
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="e.g. Aditya"
                      aria-invalid={!!errors.firstName}
                    />
                  </Field>
                  <Field label="Last Name" error={errors.lastName} required>
                    <Input
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="e.g. Sharma"
                      aria-invalid={!!errors.lastName}
                    />
                  </Field>
                  <Field label="Email (from Google)" error={errors.email} required>
                    <Input
                      type="email"
                      value={googleEmail}
                      readOnly
                      placeholder="Sign in with Google first"
                      aria-invalid={!!errors.email}
                      aria-describedby="email-from-google-help"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/60 cursor-not-allowed"
                    />
                    <span id="email-from-google-help" className="text-[11px] text-muted-foreground">
                      Read-only — taken from your Google session. Sign out & back in with another Google account to change it.
                    </span>
                  </Field>
                  <Field label="Mobile / WhatsApp" error={errors.mobile} required>
                    <Input
                      inputMode="tel"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      placeholder="+91 98765 43210"
                      aria-invalid={!!errors.mobile}
                    />
                  </Field>

                  <Field label="Degree" error={errors.degree} required>
                    <SelectField
                      value={form.degree}
                      onChange={(v) => setForm({ ...form, degree: v })}
                      placeholder="Select degree"
                      options={DEGREES}
                    />
                  </Field>
                  <Field label="Branch" error={errors.branch} required>
                    <SelectField
                      value={form.branch}
                      onChange={(v) => setForm({ ...form, branch: v })}
                      placeholder="Select branch"
                      options={BRANCHES}
                    />
                  </Field>
                  <Field label="Semester" error={errors.semester} required>
                    <SelectField
                      value={form.semester}
                      onChange={(v) => setForm({ ...form, semester: v })}
                      placeholder="Select semester"
                      options={SEMESTERS}
                    />
                  </Field>
                  <Field label="Plan" error={errors.plan} required>
                    <SelectField
                      value={form.plan}
                      onChange={(v) => setForm({ ...form, plan: v })}
                      placeholder="Select plan"
                      options={PLANS}
                    />
                  </Field>
                  <Field label="College Name" error={errors.college} required>
                    <Input
                      value={form.college}
                      onChange={(e) => setForm({ ...form, college: e.target.value })}
                      placeholder="e.g. VIT Vellore"
                      aria-invalid={!!errors.college}
                    />
                  </Field>
                  <Field label="State" error={errors.state} required>
                    <SelectField
                      value={form.state}
                      onChange={(v) => setForm({ ...form, state: v })}
                      placeholder="Select state"
                      options={STATES}
                    />
                  </Field>
                  <Field label="How did you hear about us? (optional)">
                    <SelectField
                      value={form.source || "__none__"}
                      onChange={(v) => setForm({ ...form, source: v === "__none__" ? "" : v })}
                      placeholder="Select source"
                      options={SOURCES}
                      allowEmpty
                    />
                  </Field>
                  <Field label="Notes / Questions (optional)" full>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Anything you'd like the team to know? Batch preferences, doubt-clearing timings, etc."
                      rows={3}
                    />
                  </Field>
                </div>
                <WizardNav
                  back={() => back()}
                  next={() => next()}
                  nextLabel="Next: Confirm & Submit"
                />
              </div>
            )}

            {/* STEP 4 — Confirm & Submit */}
            {step === 4 && (
              <div className="mt-8">
                <StepHeader
                  num={4}
                  title="Confirm &amp; submit"
                  desc="Review your enrolment details below. Once you submit, your seat is reserved and our team will reach out within 24 hours."
                />

                <div className="grid lg:grid-cols-2 gap-4 mt-6">
                  <SummaryCard
                    title="Selected Track"
                    icon={<Sparkles className="size-4" />}
                    rows={[
                      ["Category", category?.label ?? "—"],
                      ["Project", project?.name ?? "—"],
                      ["Project ID", String(project?.id ?? "—")],
                      ["Tags", project?.tags ?? "—"],
                    ]}
                  />
                  <SummaryCard
                    title="Personal & Academic"
                    icon={<IdCard className="size-4" />}
                    rows={[
                      ["Name", `${form.firstName} ${form.lastName}`.trim()],
                      ["Email", googleEmail || form.email],
                      ["Mobile", form.mobile],
                      ["Degree", form.degree],
                      ["Branch", form.branch],
                      ["Semester", form.semester],
                      ["College", form.college],
                      ["State", form.state],
                      ["Plan", form.plan],
                      ...(form.source ? [["Source", form.source] as [string, string]] : []),
                    ]}
                  />
                </div>

                {form.notes && (
                  <div className="mt-4 p-3 rounded-lg bg-muted border border-border text-sm text-muted-foreground">
                    <span className="text-muted-foreground text-xs mr-2">Notes:</span>
                    {form.notes}
                  </div>
                )}

                <div className="mt-6 grid gap-3">
                  <ConsentRow
                    checked={consentWa}
                    onChange={setConsentWa}
                    title="I agree to be contacted on WhatsApp / phone by the AgileProjection team."
                    desc="We'll confirm your enrolment, share batch links, and send reminders. No promotional spam — ever."
                  />
                  <ConsentRow
                    checked={consentEm}
                    onChange={setConsentEm}
                    title="I agree to receive enrolment confirmation & certificate via email."
                    desc="Operational emails only. You can opt out any time."
                  />
                </div>

                <div className="mt-6 p-3 rounded-lg border border-cyan-500/20 bg-secondary/50 flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>
                    Your data is stored securely and used only for internship communication. We never sell or share your details with third parties. By submitting you agree to AgileProjection&apos;s privacy policy.
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  <Button
                    type="button"
                    onClick={() => submit()}
                    disabled={submitting || (!consentWa && !consentEm)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 h-12 px-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>🚀 Submit Enrolment — It's Free →</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => back()}
                    className="text-muted-foreground hover:text-cyan-300"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                </div>

                {/* Online payment section */}
                <div className="mt-8 border-t border-border pt-5">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="size-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-foreground">Pay Online (Optional)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">Test Mode</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">Pay your plan fee via UPI, Card, Net Banking, or International Card. The internship starts after the admin confirms your payment.</p>
                  <PaymentPage
                    planName={form.plan.split(" — ")[0]?.trim() || "Standard"}
                    studentName={`${form.firstName} ${form.lastName}`.trim()}
                    onPaid={(m, t) => {
                      toast({ title: "Payment confirmed!", description: `${form.plan} via ${m} · ${t}` });
                    }}
                  />
                </div>
              </div>
            )}
            </div>
          </>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Need help choosing? Ask{" "}
        <Link href="#ai-assistant" className="text-cyan-300 underline underline-offset-4">
          AP-AI Mentor
        </Link>{" "}
        or WhatsApp{" "}
        <a href="https://wa.me/918095557334" className="text-cyan-300 underline underline-offset-4">
          +91 80955 57334
        </a>
        .
      </p>
    </section>
  );
}

/* ── Sub-components ── */

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-center gap-1 sm:gap-3" aria-label="Wizard progress">
      {STEPS_META.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <li key={s.n} className="flex items-center gap-1 sm:gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "size-8 rounded-full grid place-items-center text-xs font-bold transition-all",
                  active
                    ? "ap-gradient-cyan text-navy ring-2 ring-cyan-500/40"
                    : done
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-secondary text-muted-foreground border border-border"
                )}
              >
                {done ? <Check className="size-4" /> : s.n}
              </div>
              <span
                className={cn(
                  "text-xs hidden sm:block",
                  active ? "text-cyan-300 font-semibold" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS_META.length - 1 && (
              <div
                className={cn(
                  "w-8 sm:w-12 h-px",
                  done ? "bg-cyan-500/40" : "bg-[rgba(6,182,212,0.18)]"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepHeader({
  num,
  title,
  desc,
}: {
  num: number;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-2">
        Step {num}
      </div>
      <h3
        className="text-xl md:text-2xl font-bold text-foreground"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="text-sm text-muted-foreground mt-2 max-w-3xl">{desc}</p>
    </div>
  );
}

function WizardNav({
  back,
  next,
  nextLabel,
}: {
  back: null | (() => void);
  next: undefined | (() => void);
  nextLabel: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-3 flex-wrap">
      <Button
        type="button"
        onClick={() => next?.()}
        disabled={!next}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
      >
        {nextLabel} <ArrowRight className="size-4" />
      </Button>
      {back && (
        <Button type="button" variant="ghost" onClick={back} className="text-muted-foreground hover:text-cyan-300">
          <ArrowLeft className="size-4" /> Back
        </Button>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  required,
  full,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", full && "md:col-span-2")}>
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-cyan-400">*</span>}
      </Label>
      {children}
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  placeholder,
  options,
  allowEmpty,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  allowEmpty?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-muted border-border w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border max-h-72 overflow-y-auto">
        {allowEmpty && (
          <SelectItem value="__none__">— None —</SelectItem>
        )}
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SummaryCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: [string, string][];
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="size-7 rounded-md bg-cyan-500/15 text-cyan-300 grid place-items-center">
          {icon}
        </span>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <dl className="grid grid-cols-1 gap-1.5 text-sm">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-start justify-between gap-3 py-1 border-b border-border last:border-b-0"
          >
            <dt className="text-xs text-muted-foreground uppercase tracking-wide shrink-0">{k}</dt>
            <dd className="text-right text-foreground break-words">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ConsentRow({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border cursor-pointer hover:border-cyan-500/30">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} className="mt-0.5" />
      <span className="flex-1">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
      </span>
    </label>
  );
}

function SuccessPanel({
  result,
  onReset,
}: {
  result: SubmitResult;
  onReset: () => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="size-16 mx-auto rounded-full ap-gradient-cyan grid place-items-center text-navy mb-4">
        <PartyPopper className="size-8" />
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-foreground">
        🎉 Enrolment Submitted!
      </h3>
      <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-3">
        Welcome aboard, <strong className="text-foreground">{result.student.name}</strong>! Your registration for{" "}
        <strong className="text-cyan-300">{result.student.project}</strong>{" "}
        ({result.student.categoryLabel}) has been logged. Use the buttons below to instantly confirm with
        Shekhar&apos;s team on WhatsApp or email — they&apos;ll reach out within 24 hours.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={result.notification.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium text-sm hover:opacity-90"
        >
          <MessageCircle className="size-4" /> Send WhatsApp to AgileProjection
        </a>
        <a
          href={result.notification.mailtoUrl}
          className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-sm hover:opacity-90"
        >
          <Mail className="size-4" /> Email AgileProjection Team
        </a>
      </div>

      <p className="mt-6 text-xs text-muted-foreground max-w-xl mx-auto">
        We&apos;ve also logged your registration for our team. Shekhar&apos;s team will reach out within 24 hours.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-sm text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
      >
        Register another student →
      </button>
    </div>
  );
}
