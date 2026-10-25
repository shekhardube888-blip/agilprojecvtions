"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  FolderKanban, Plus, Pencil, Trash2, Star, Send, Loader2, X,
  CheckCircle2, AlertTriangle, ExternalLink, FileText, RefreshCw, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn, safeJson } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type AdminItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  techStack: string;
  difficulty: string;
  category: string;
  features: string;
  starterFiles: string;
  status: string;
  accessLevel: string;
  featured: boolean;
  createdAt: string;
  _count: { downloads: number; submissions: number };
};

type AdminSubmission = {
  id: string;
  projectId: string;
  studentEmail: string;
  studentName: string | null;
  sourceCodeUrl: string | null;
  reportText: string | null;
  demoVideoUrl: string | null;
  notes: string | null;
  status: string;
  mentorFeedback: string | null;
  reviewedBy: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  project: { title: string; techStack: string };
};

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  under_review: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const DIFFICULTY_STYLE: Record<string, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Intermediate: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Advanced: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function AdminProjectLibrary() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminItem[]>([]);
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [subStats, setSubStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"projects" | "submissions">("projects");
  const [editDialog, setEditDialog] = useState<AdminItem | null | "new">(null);
  const [reviewDialog, setReviewDialog] = useState<AdminSubmission | null>(null);
  const [busy, setBusy] = useState(false);

  // Edit-form state
  const [form, setForm] = useState({
    id: "",
    title: "", description: "", techStack: "",
    difficulty: "Intermediate", category: "AI",
    features: "", starterFiles: "",
    status: "published", accessLevel: "public", featured: false,
  });

  // Review form state
  const [mentorFeedback, setMentorFeedback] = useState("");
  const [reviewStatus, setReviewStatus] = useState("under_review");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch("/api/admin/project-library", { cache: "no-store" }),
        fetch("/api/admin/project-library/submission", { cache: "no-store" }),
      ]);
      const [p, s] = await Promise.all([safeJson(pRes), safeJson(sRes)]);
      if (p.ok) setItems(p.items || []);
      if (s.ok) {
        setSubmissions(s.submissions || []);
        setSubStats(s.stats || {});
      }
    } catch (e) {
      toast({ title: "Load failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setForm({
      id: "", title: "", description: "", techStack: "",
      difficulty: "Intermediate", category: "AI",
      features: "[]", starterFiles: "[]",
      status: "published", accessLevel: "public", featured: false,
    });
    setEditDialog("new");
  };

  const startEdit = (item: AdminItem) => {
    setForm({
      id: item.id,
      title: item.title,
      description: item.description,
      techStack: item.techStack,
      difficulty: item.difficulty,
      category: item.category,
      features: item.features,
      starterFiles: item.starterFiles,
      status: item.status,
      accessLevel: item.accessLevel,
      featured: item.featured,
    });
    setEditDialog(item);
  };

  const saveProject = useCallback(async () => {
    if (!form.title.trim() || !form.description.trim() || !form.techStack.trim()) {
      toast({ title: "Missing fields", description: "Title, description, techStack are required.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      // Parse JSON fields (accept either JSON string or array text)
      const parseJsonField = (v: string) => {
        if (!v) return [];
        try { return JSON.parse(v); } catch { return v.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean); }
      };
      const features = parseJsonField(form.features);
      const starterFiles = parseJsonField(form.starterFiles);

      const payload = {
        title: form.title,
        description: form.description,
        techStack: form.techStack,
        difficulty: form.difficulty,
        category: form.category,
        features,
        starterFiles,
        status: form.status,
        accessLevel: form.accessLevel,
        featured: form.featured,
      };

      const res = form.id
        ? await fetch(`/api/admin/project-library/${form.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/project-library", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const d = await safeJson(res);
      if (!d.ok) {
        toast({ title: "Save failed", description: d.error, variant: "destructive" });
        return;
      }
      toast({ title: `✓ ${form.id ? "Updated" : "Created"}`, description: form.title });
      setEditDialog(null);
      await load();
    } catch (e) {
      toast({ title: "Save error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }, [form, toast, load]);

  const deleteProject = useCallback(async (item: AdminItem) => {
    if (!window.confirm(`Delete "${item.title}"? All downloads + submissions for this project will be removed.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/project-library/${item.id}`, { method: "DELETE" });
      const d = await safeJson(res);
      if (!d.ok) {
        toast({ title: "Delete failed", description: d.error, variant: "destructive" });
        return;
      }
      toast({ title: "✓ Deleted", description: item.title });
      await load();
    } catch (e) {
      toast({ title: "Delete error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }, [toast, load]);

  const toggleFeatured = useCallback(async (item: AdminItem) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/project-library/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !item.featured }),
      });
      const d = await safeJson(res);
      if (!d.ok) {
        toast({ title: "Update failed", description: d.error, variant: "destructive" });
        return;
      }
      await load();
    } catch (e) {
      toast({ title: "Update error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }, [toast, load]);

  const toggleStatus = useCallback(async (item: AdminItem) => {
    setBusy(true);
    try {
      const next = item.status === "published" ? "archived" : "published";
      const res = await fetch(`/api/admin/project-library/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const d = await safeJson(res);
      if (!d.ok) {
        toast({ title: "Update failed", description: d.error, variant: "destructive" });
        return;
      }
      toast({ title: `✓ ${next === "published" ? "Published" : "Archived"}`, description: item.title });
      await load();
    } catch (e) {
      toast({ title: "Update error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }, [toast, load]);

  const startReview = (sub: AdminSubmission) => {
    setReviewDialog(sub);
    setMentorFeedback(sub.mentorFeedback || "");
    setReviewStatus(sub.status === "submitted" ? "under_review" : sub.status);
  };

  const submitReview = useCallback(async () => {
    if (!reviewDialog) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/project-library/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: reviewDialog.id,
          status: reviewStatus,
          mentorFeedback,
        }),
      });
      const d = await safeJson(res);
      if (!d.ok) {
        toast({ title: "Review failed", description: d.error, variant: "destructive" });
        return;
      }
      toast({ title: `✓ ${reviewStatus === "approved" ? "Approved" : reviewStatus === "rejected" ? "Rejected" : "Updated"}` });
      setReviewDialog(null);
      await load();
    } catch (e) {
      toast({ title: "Review error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }, [reviewDialog, reviewStatus, mentorFeedback, toast, load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-cyan-400" />
        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-violet-600/40 via-cyan-500/40 to-violet-600/40">
        <div className="rounded-2xl bg-popover p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FolderKanban className="size-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Project Library</h2>
            </div>
            <Button onClick={startNew} size="sm" className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
              <Plus className="size-4 mr-1.5" /> New Project
            </Button>
          </div>
          {/* Sub-tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setTab("projects")}
              className={cn("text-xs px-3 py-1 rounded-md", tab === "projects" ? "bg-cyan-500/20 text-cyan-300" : "text-muted-foreground hover:text-foreground")}
            >
              Projects ({items.length})
            </button>
            <button
              onClick={() => setTab("submissions")}
              className={cn("text-xs px-3 py-1 rounded-md", tab === "submissions" ? "bg-cyan-500/20 text-cyan-300" : "text-muted-foreground hover:text-foreground")}
            >
              Submissions ({subStats.total || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Projects tab */}
      {tab === "projects" && (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No projects yet. Click "New Project" to add the first one.
            </div>
          ) : (
            items.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card/50 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        {p.featured && <Star className="size-3.5 text-amber-400 fill-amber-400" />}
                        {p.title}
                      </h3>
                      <span className="text-[10px] font-mono text-cyan-300">{p.techStack}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border", DIFFICULTY_STYLE[p.difficulty] || "")}>
                        {p.difficulty}
                      </span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full",
                        p.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-600/20 text-muted-foreground"
                      )}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-2">
                      <span>{p._count.downloads} downloads</span>
                      <span>{p._count.submissions} submissions</span>
                      <span>slug: <code className="text-cyan-300/70">{p.slug}</code></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => toggleFeatured(p)} disabled={busy} className="h-7 px-2">
                      <Star className={cn("size-3.5", p.featured ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleStatus(p)} disabled={busy} className="h-7 px-2 text-[10px]">
                      {p.status === "published" ? "Archive" : "Publish"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(p)} disabled={busy} className="h-7 px-2">
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteProject(p)} disabled={busy} className="h-7 px-2 text-rose-400 hover:text-rose-300">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Submissions tab */}
      {tab === "submissions" && (
        <div className="space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { k: "submitted", label: "New", v: subStats.submitted || 0 },
              { k: "under_review", label: "Reviewing", v: subStats.under_review || 0 },
              { k: "approved", label: "Approved", v: subStats.approved || 0 },
              { k: "rejected", label: "Rejected", v: subStats.rejected || 0 },
            ].map((s) => (
              <div key={s.k} className="rounded-lg border border-border bg-card/50 p-3 text-center">
                <p className="text-lg font-bold">{s.v}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No student submissions yet.
            </div>
          ) : (
            submissions.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-card/50 p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-semibold text-sm">{s.project.title}</h4>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", STATUS_STYLE[s.status] || "")}>
                        {s.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.studentName || s.studentEmail} · <a href={`mailto:${s.studentEmail}`} className="text-cyan-300 hover:underline">{s.studentEmail}</a>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Submitted {new Date(s.submittedAt).toLocaleString()}
                    </p>
                    {s.sourceCodeUrl && (
                      <a href={s.sourceCodeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:underline mt-1.5">
                        <ExternalLink className="size-3" /> {s.sourceCodeUrl}
                      </a>
                    )}
                  </div>
                  <Button size="sm" onClick={() => startReview(s)} disabled={busy} className="h-7 px-3 text-[11px] bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
                    Review
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit dialog */}
      {editDialog && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { if (!busy) setEditDialog(null); }}>
          <div className="bg-popover border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-popover border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FolderKanban className="size-4 text-cyan-400" />
                {editDialog === "new" ? "New Project" : "Edit Project"}
              </h3>
              <button onClick={() => { if (!busy) setEditDialog(null); }} className="text-muted-foreground hover:text-rose-300">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <Label className="text-[11px]">Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-8 text-sm mt-1" />
              </div>
              <div>
                <Label className="text-[11px]">Description *</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="text-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px]">Tech Stack *</Label>
                  <Input value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="Python / FastAPI / PostgreSQL" className="h-8 text-sm mt-1" />
                </div>
                <div>
                  <Label className="text-[11px]">Category</Label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-8 text-sm mt-1 rounded-md border border-input bg-background px-2">
                    <option>AI</option><option>Web</option><option>Enterprise</option><option>Mobile</option><option>DevOps</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-[11px]">Difficulty</Label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full h-8 text-sm mt-1 rounded-md border border-input bg-background px-2">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[11px]">Status</Label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-8 text-sm mt-1 rounded-md border border-input bg-background px-2">
                    <option>published</option><option>draft</option><option>archived</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[11px]">Access</Label>
                  <select value={form.accessLevel} onChange={(e) => setForm({ ...form, accessLevel: e.target.value })} className="w-full h-8 text-sm mt-1 rounded-md border border-input bg-background px-2">
                    <option value="public">public</option><option value="enrolled">enrolled</option><option value="assigned">assigned</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-[11px]">Features (JSON array or one-per-line)</Label>
                <Textarea
                  value={(() => {
                    try { return JSON.stringify(JSON.parse(form.features), null, 2); } catch { return form.features; } })()}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  rows={4}
                  className="text-xs mt-1 font-mono"
                  placeholder='["Supplier scoring","REST API","PostgreSQL"]'
                />
              </div>
              <div>
                <Label className="text-[11px]">Starter Files (JSON array of {`{ label, fileName, language, content }`})</Label>
                <Textarea
                  value={(() => {
                    try { return JSON.stringify(JSON.parse(form.starterFiles), null, 2); } catch { return form.starterFiles; } })()}
                  onChange={(e) => setForm({ ...form, starterFiles: e.target.value })}
                  rows={6}
                  className="text-[11px] mt-1 font-mono"
                  placeholder={'[{"label":"README","fileName":"README.md","language":"markdown","content":"# Hello"}]'}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Tip: run the seed script (<code>node scripts/seed-project-library.mjs</code>) for 5 ready-made projects.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured (shown at top of student list)
              </label>
            </div>
            <div className="sticky bottom-0 bg-popover border-t border-border p-4 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setEditDialog(null)} disabled={busy}>Cancel</Button>
              <Button size="sm" onClick={saveProject} disabled={busy} className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
                {busy ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="size-3.5 mr-1.5" />}
                {editDialog === "new" ? "Create" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Review dialog */}
      {reviewDialog && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { if (!busy) setReviewDialog(null); }}>
          <div className="bg-popover border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-popover border-b border-border p-4 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Send className="size-4 text-cyan-400" />
                Review Submission
              </h3>
              <button onClick={() => { if (!busy) setReviewDialog(null); }} className="text-muted-foreground hover:text-rose-300">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <h4 className="font-semibold text-sm mb-1">{reviewDialog.project.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {reviewDialog.studentName || reviewDialog.studentEmail} · <a href={`mailto:${reviewDialog.studentEmail}`} className="text-cyan-300">{reviewDialog.studentEmail}</a>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Submitted {new Date(reviewDialog.submittedAt).toLocaleString()}
                </p>
              </div>

              {reviewDialog.sourceCodeUrl && (
                <div>
                  <Label className="text-[11px]">Source Code</Label>
                  <a href={reviewDialog.sourceCodeUrl} target="_blank" rel="noreferrer" className="block mt-1 text-xs text-cyan-300 hover:underline truncate">
                    <ExternalLink className="size-3 inline mr-1" /> {reviewDialog.sourceCodeUrl}
                  </a>
                </div>
              )}
              {reviewDialog.demoVideoUrl && (
                <div>
                  <Label className="text-[11px]">Demo Video</Label>
                  <a href={reviewDialog.demoVideoUrl} target="_blank" rel="noreferrer" className="block mt-1 text-xs text-cyan-300 hover:underline truncate">
                    <ExternalLink className="size-3 inline mr-1" /> {reviewDialog.demoVideoUrl}
                  </a>
                </div>
              )}
              {reviewDialog.reportText && (
                <div>
                  <Label className="text-[11px]">Project Report</Label>
                  <div className="prose prose-sm prose-invert max-w-none mt-1 rounded-md border border-border bg-[#0B1929] p-3 text-xs">
                    <ReactMarkdown>{reviewDialog.reportText}</ReactMarkdown>
                  </div>
                </div>
              )}
              {reviewDialog.notes && (
                <div>
                  <Label className="text-[11px]">Student Notes</Label>
                  <p className="text-xs text-muted-foreground mt-1 rounded-md border border-border bg-muted/30 p-2">{reviewDialog.notes}</p>
                </div>
              )}

              <div>
                <Label className="text-[11px]">Status</Label>
                <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} className="w-full h-8 text-sm mt-1 rounded-md border border-input bg-background px-2">
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="submitted">Reset to New</option>
                </select>
              </div>
              <div>
                <Label className="text-[11px]">Mentor Feedback (Markdown)</Label>
                <Textarea
                  value={mentorFeedback}
                  onChange={(e) => setMentorFeedback(e.target.value)}
                  rows={4}
                  className="text-xs mt-1"
                  placeholder="Great work on... For improvement, consider..."
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-popover border-t border-border p-4 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setReviewDialog(null)} disabled={busy}>Cancel</Button>
              <Button size="sm" onClick={submitReview} disabled={busy} className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
                {busy ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Award className="size-3.5 mr-1.5" />}
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
