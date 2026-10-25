"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb, Send, Loader2, CheckCircle2, XCircle, Mail, Clock, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn, safeJson } from "@/lib/utils";

const SUBJECTS = [
  { key: "ai-ml", label: "AI / Machine Learning" },
  { key: "cs", label: "Computer Science" },
  { key: "ece", label: "Electronics & Communication" },
  { key: "mech", label: "Mechanical Engineering" },
  { key: "mba", label: "MBA / Management" },
  { key: "bba", label: "BBA / Business" },
  { key: "civil", label: "Civil Engineering" },
  { key: "other", label: "Other" },
];

type DemoRequest = {
  id: string; subject: string; project: string | null; requirements: string;
  status: string; mentorReply: string | null; requestedAt: string;
  reviewedAt: string | null; emailedAt: string | null;
};

export function DemoProjectRequest() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/demo-project/request", { cache: "no-store" });
      const data = await safeJson(res);
      if (data.ok) {
        setRequests(data.requests);
        // Pre-fill the subject from the student's registration (from localStorage or the most recent request)
        if (data.requests.length > 0) {
          setSubject(data.requests[0].subject);
        } else {
          try {
            const stored = localStorage.getItem("selected-subject");
            if (stored) setSubject(stored);
          } catch { /* ignore */ }
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (!subject) { toast({ title: "Subject required", description: "Select your subject first.", variant: "destructive" }); return; }
    if (!requirements.trim()) { toast({ title: "Requirements required", description: "Describe what kind of demo project you need.", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/demo-project/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, requirements: requirements.trim() }),
      });
      const data = await safeJson(res);
      if (!res.ok || !data.ok) throw new Error(data.error);
      toast({ title: "Request submitted!", description: "Your mentor will review it and provide a demo project. You'll see the reply here + receive it via email." });
      setRequirements("");
      await load();
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    } finally { setSubmitting(false); }
  }

  const hasPending = requests.some((r) => r.status === "pending");

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="size-5 text-amber-500 dark:text-amber-400" />
        <h3 className="font-bold text-sm text-foreground">Request a Demo Project</h3>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
        Need a custom demo project for your subject? Describe your requirements — your mentor will create a project description tailored to your needs and send it to your email.
      </p>

      {/* Subject selector */}
      <div className="space-y-1.5 mb-3">
        <Label className="text-xs">Your Subject</Label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full h-9 rounded-lg border border-border bg-muted px-3 text-xs text-foreground"
        >
          <option value="">Select your subject…</option>
          {SUBJECTS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Requirements textarea */}
      <div className="space-y-1.5 mb-3">
        <Label className="text-xs">Describe Your Requirements</Label>
        <Textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="e.g. I need a demo project that demonstrates RAG-based chatbot development using LangChain + FastAPI. I want to show this in my college tech fest. The project should be beginner-friendly with step-by-step code…"
          className="bg-muted border-border min-h-[100px] text-xs"
          disabled={submitting || hasPending}
        />
        <p className="text-[9px] text-muted-foreground">{requirements.length}/2000 chars {hasPending && "· You have a pending request — wait for the mentor to review it."}</p>
      </div>

      <Button
        onClick={submit}
        disabled={submitting || hasPending || !requirements.trim()}
        className="w-full h-9 text-xs bg-gradient-to-r from-amber-500 to-cyan-500 text-white hover:opacity-90"
      >
        {submitting ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Send className="size-3.5 mr-1" />}
        {hasPending ? "Pending Review" : "Request Demo Project"}
      </Button>

      {/* Previous requests + mentor replies */}
      {requests.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Your Requests</div>
          {requests.map((r) => (
            <div key={r.id} className={cn(
              "rounded-lg border p-3",
              r.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5" :
              r.status === "rejected" ? "border-rose-500/30 bg-rose-500/5" :
              "border-amber-500/30 bg-amber-500/5"
            )}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-foreground">{SUBJECTS.find(s => s.key === r.subject)?.label || r.subject}</span>
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full font-semibold",
                  r.status === "approved" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                  r.status === "rejected" ? "bg-rose-500/15 text-rose-500 dark:text-rose-400" :
                  "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}>
                  {r.status === "approved" ? "✓ Approved" : r.status === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{r.requirements}</p>

              {/* Mentor reply */}
              {r.mentorReply && (
                <div className="mt-2 p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <div className="flex items-center gap-1 text-cyan-500 dark:text-cyan-400 text-[10px] font-semibold mb-1">
                    {r.status === "approved" ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                    {r.status === "approved" ? "Demo Project from Mentor" : "Mentor Feedback"}
                  </div>
                  <p className="text-[10px] text-foreground whitespace-pre-wrap leading-relaxed">{r.mentorReply}</p>
                  {r.emailedAt && (
                    <div className="flex items-center gap-1 mt-2 text-[9px] text-emerald-600 dark:text-emerald-400">
                      <Mail className="size-3" /> Sent to your email on {new Date(r.emailedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </div>
                  )}
                </div>
              )}

              <div className="text-[9px] text-muted-foreground mt-2 flex items-center gap-1">
                <Clock className="size-2.5" /> Requested {new Date(r.requestedAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                {r.reviewedAt && ` · Reviewed ${new Date(r.reviewedAt).toLocaleDateString("en-IN", { dateStyle: "short" })}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
