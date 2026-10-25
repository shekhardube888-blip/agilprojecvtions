"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  FolderKanban, Download, FileText, CheckCircle2, Loader2, X, Send,
  ExternalLink, Sparkles, ArrowRight, Star, Github, Video, Award, AlertTriangle, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn, safeJson } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type ProjectItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  techStack: string;
  difficulty: string;
  category: string;
  features: string; // JSON string
  accessLevel: string;
  featured: boolean;
  createdAt: string;
};

type ProjectDetail = ProjectItem & {
  starterFiles: string; // JSON string
};

type Submission = {
  id: string;
  status: string;
  mentorFeedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

type StarterFile = {
  label?: string;
  fileName?: string;
  language?: string;
  content?: string;
};

const DIFFICULTY_STYLE: Record<string, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Intermediate: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Advanced: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const STATUS_STYLE: Record<string, string> = {
  submitted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  under_review: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function ProjectLibrary() {
  const { toast } = useToast();
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [downloadedProjectId, setDownloadedProjectId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Map<string, Submission>>(new Map());
  const [assignedProjectId, setAssignedProjectId] = useState<string | null>(null);
  const [assignedProjectTitle, setAssignedProjectTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSub, setDetailSub] = useState<Submission | null>(null);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState<StarterFile | null>(null);

  // Submit form state
  const [githubLink, setGithubLink] = useState("");
  const [reportText, setReportText] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [notes, setNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/project-library", { cache: "no-store" });
      const d = await safeJson(res);
      if (d.ok) {
        setItems(d.items || []);
        setDownloadedProjectId(d.downloadedProjectId);
        setSubmissions(new Map(Object.entries(d.submissions || {})));
        setAssignedProjectId(d.assignedProjectId || null);
        setAssignedProjectTitle(d.assignedProjectTitle || null);
      } else {
        toast({ title: "Failed to load projects", description: d.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Network error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const openDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    setDetailSub(null);
    try {
      const res = await fetch(`/api/student/project-library/${id}`, { cache: "no-store" });
      const d = await safeJson(res);
      if (d.ok) {
        setDetail(d.item);
        setDetailSub(d.submission || null);
      } else {
        toast({ title: "Failed to load project", description: d.error, variant: "destructive" });
      }
    } finally {
      setDetailLoading(false);
    }
  }, [toast]);

  const downloadFile = useCallback(async (file: StarterFile) => {
    if (!detail || !file.fileName) return;
    // Admin-controlled rule: student can only download their assigned project
    if (!assignedProjectId) {
      toast({
        title: "No project assigned",
        description: "Your admin has not assigned a project to you yet. Please contact your mentor.",
        variant: "destructive",
      });
      return;
    }
    if (assignedProjectId !== detail.id) {
      toast({
        title: "Download blocked",
        description: `You can only download your admin-assigned project: "${assignedProjectTitle || "another project"}".`,
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        `/api/student/project-library/${detail.id}/download?file=${encodeURIComponent(file.fileName)}`,
        { cache: "no-store" }
      );
      if (res.status === 403) {
        const d = await safeJson(res);
        toast({
          title: "Download blocked",
          description: d.error || "You don't have permission to download this project.",
          variant: "destructive",
        });
        return;
      }
      if (!res.ok) {
        const d = await safeJson(res);
        toast({ title: "Download failed", description: d.error, variant: "destructive" });
        return;
      }
      // Stream → blob → trigger save-as
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "✓ Downloaded",
        description: file.fileName,
      });
      // Refresh state — student is now marked as having downloaded
      if (!downloadedProjectId) {
        setDownloadedProjectId(detail.id);
        await load();
      }
    } catch (e) {
      toast({ title: "Download error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }, [detail, assignedProjectId, assignedProjectTitle, downloadedProjectId, toast, load]);

  const submitWork = useCallback(async () => {
    if (!detail) return;
    if (!githubLink.trim() && !reportText.trim()) {
      toast({ title: "Missing content", description: "Add a GitHub link or report text.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/student/project-library/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: detail.id,
          sourceCodeUrl: githubLink,
          reportText,
          demoVideoUrl,
          notes,
        }),
      });
      const d = await safeJson(res);
      if (!d.ok) {
        toast({ title: "Submit failed", description: d.error, variant: "destructive" });
        return;
      }
      toast({ title: "✓ Submitted for review", description: detail.title });
      setSubmitDialog(false);
      setGithubLink(""); setReportText(""); setDemoVideoUrl(""); setNotes("");
      await openDetail(detail.id);
      await load();
    } catch (e) {
      toast({ title: "Submit error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }, [detail, githubLink, reportText, demoVideoUrl, notes, toast, openDetail, load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-cyan-400" />
        <span className="ml-2 text-sm text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-violet-600/40 via-cyan-500/40 to-violet-600/40">
        <div className="rounded-2xl bg-popover p-5">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FolderKanban className="size-5 text-cyan-400" />
              <h2 className="text-xl font-bold">Project Library</h2>
            </div>
            <p className="text-xs text-muted-foreground w-full mt-1">
              Browse curated internship starter projects. Each project ships with source code, schema, and docs.
              Only your <strong className="text-cyan-300">admin-assigned</strong> project can be downloaded — contact your mentor if you don't see one assigned.
            </p>
          </div>
        </div>
      </div>

      {/* Admin-assignment banner */}
      {assignedProjectId ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-3">
          <CheckCircle2 className="size-4 text-emerald-400 mt-0.5" />
          <div className="text-xs">
            <p className="text-emerald-300 font-semibold">Admin assigned you: {assignedProjectTitle}</p>
            <p className="text-muted-foreground mt-0.5">
              You can download starter files from this project only. Other projects are view-only.
              {downloadedProjectId === assignedProjectId && (
                <span className="text-emerald-300"> ✓ You've downloaded the starter code.</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-3">
          <AlertTriangle className="size-4 text-amber-400 mt-0.5" />
          <div className="text-xs">
            <p className="text-amber-300 font-semibold">No project assigned yet</p>
            <p className="text-muted-foreground mt-0.5">
              Your admin/mentor will assign you a project from the User Management tab. You can browse the library below, but downloads are blocked until then.
            </p>
          </div>
        </div>
      )}

      {/* Project grid */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No projects published yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((p) => {
            const isDownloaded = downloadedProjectId === p.id;
            const sub = submissions.get(p.id) as Submission | undefined;
            const isAssigned = assignedProjectId === p.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border p-4 transition-all hover:border-cyan-500/50 cursor-pointer",
                  isAssigned
                    ? "border-cyan-500/50 bg-card shadow-[0_0_24px_-6px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/30"
                    : p.featured ? "border-cyan-500/40 bg-card" : "border-border bg-card/50"
                )}
                onClick={() => openDetail(p.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    {p.featured && <Star className="size-3.5 text-amber-400 fill-amber-400" />}
                    {p.title}
                  </h3>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border", DIFFICULTY_STYLE[p.difficulty] || "")}>
                    {p.difficulty}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-300/80 mt-2">
                  <span className="font-mono">{p.techStack}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {isAssigned && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      <Star className="size-3 fill-cyan-300" /> Admin-assigned
                    </span>
                  )}
                  {isDownloaded && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="size-3" /> Downloaded
                    </span>
                  )}
                  {sub && (
                    <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border", STATUS_STYLE[sub.status] || "")}>
                      <Send className="size-3" /> {sub.status.replace("_", " ")}
                    </span>
                  )}
                  {!isAssigned && assignedProjectId && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-600/20 text-muted-foreground border border-slate-500/30">
                      <Lock className="size-3" /> Locked
                    </span>
                  )}
                  {!assignedProjectId && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-600/20 text-muted-foreground border border-slate-500/30">
                      <Lock className="size-3" /> Awaiting assignment
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail dialog */}
      {(detail || detailLoading) && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { if (!busy) { setDetail(null); setShowFilePreview(null); } }}
        >
          <div
            className="bg-popover border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-6 animate-spin text-cyan-400" />
              </div>
            ) : detail ? (
              <>
                {/* Detail header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {detail.featured && <Star className="size-4 text-amber-400 fill-amber-400" />}
                      {detail.title}
                    </h3>
                    <button
                      onClick={() => { if (!busy) { setDetail(null); setShowFilePreview(null); } }}
                      className="text-muted-foreground hover:text-rose-300"
                      aria-label="Close"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{detail.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-cyan-300">{detail.techStack}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border", DIFFICULTY_STYLE[detail.difficulty] || "")}>
                      {detail.difficulty}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{detail.category}</span>
                  </div>
                  {(() => {
                    let feats: string[] = [];
                    try { feats = JSON.parse(detail.features || "[]"); } catch {}
                    if (!feats.length) return null;
                    return (
                      <ul className="mt-3 space-y-1">
                        {feats.map((f, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <Sparkles className="size-3 text-cyan-400 mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>

                {/* Starter files */}
                <div className="p-5 overflow-y-auto">
                  <div className="text-xs font-semibold text-cyan-300 mb-2 flex items-center gap-1.5">
                    <FileText className="size-3.5" /> Starter Files ({(() => {
                      try { return JSON.parse(detail.starterFiles || "[]").length; } catch { return 0; }
                    })()})
                  </div>
                  {(() => {
                    let files: StarterFile[] = [];
                    try { files = JSON.parse(detail.starterFiles || "[]"); } catch {}
                    if (!files.length) {
                      return <p className="text-xs text-muted-foreground">No starter files for this project.</p>;
                    }
                    return (
                      <div className="space-y-2">
                        {files.map((f, i) => (
                          <div key={i} className="rounded-lg border border-border bg-card/50 p-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-mono truncate">{f.fileName}</p>
                              {f.label && f.label !== f.fileName && (
                                <p className="text-[10px] text-muted-foreground">{f.label}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                size="sm" variant="ghost"
                                onClick={() => setShowFilePreview(showFilePreview?.fileName === f.fileName ? null : f)}
                                className="h-7 text-[11px] px-2"
                              >
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => downloadFile(f)}
                                disabled={busy || !assignedProjectId || assignedProjectId !== detail.id}
                                title={!assignedProjectId ? "No project assigned by admin" : assignedProjectId !== detail.id ? "This project is not assigned to you" : undefined}
                                className={cn(
                                  "h-7 text-[11px] px-2",
                                  isDownloadedOrLocked(detail.id, downloadedProjectId)
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : assignedProjectId === detail.id
                                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                              >
                                {busy ? <Loader2 className="size-3 animate-spin mr-1" /> : <Download className="size-3 mr-1" />}
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                        {showFilePreview && (
                          <div className="rounded-lg border border-cyan-500/30 bg-[#0B1929] p-3 mt-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono text-cyan-300">{showFilePreview.fileName}</span>
                              <button onClick={() => setShowFilePreview(null)} className="text-muted-foreground hover:text-rose-300">
                                <X className="size-3" />
                              </button>
                            </div>
                            <pre className="text-[10px] leading-relaxed text-slate-200 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-words font-mono">
                              {showFilePreview.content || "(empty file)"}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Existing submission */}
                  {detailSub && (
                    <div className="mt-4 rounded-lg border border-border bg-card/30 p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-cyan-300">Your Submission</span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", STATUS_STYLE[detailSub.status] || "")}>
                          {detailSub.status.replace("_", " ")}
                        </span>
                      </div>
                      {detailSub.mentorFeedback && (
                        <div className="mt-2 text-xs">
                          <p className="text-muted-foreground font-semibold mb-1">Mentor feedback:</p>
                          <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
                            <ReactMarkdown>{detailSub.mentorFeedback}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Submitted {new Date(detailSub.submittedAt).toLocaleString()}
                        {detailSub.reviewedAt && ` · Reviewed ${new Date(detailSub.reviewedAt).toLocaleString()}`}
                      </p>
                    </div>
                  )}

                  {/* Submit / Resubmit */}
                  {downloadedProjectId === detail.id ? (
                    <Button
                      onClick={() => setSubmitDialog(true)}
                      className="mt-4 w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                    >
                      <Send className="size-4 mr-2" />
                      {detailSub ? "Resubmit Work" : "Submit Completed Work"}
                    </Button>
                  ) : !assignedProjectId ? (
                    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                      <span>Your admin has not assigned a project to you yet. Please contact your mentor to get one assigned.</span>
                    </div>
                  ) : assignedProjectId !== detail.id ? (
                    <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2">
                      <Lock className="size-4 mt-0.5 shrink-0" />
                      <span>This project is not assigned to you. You can only download/submit work for your admin-assigned project.</span>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-border bg-card/30 p-3 text-xs text-muted-foreground flex items-start gap-2">
                      <Download className="size-4 mt-0.5 shrink-0 text-cyan-400" />
                      <span>Download any starter file to confirm your project choice. You'll then be able to submit your completed work for mentor review.</span>
                    </div>
                  )}
                </div>

                {/* Inline submit dialog (when toggled) */}
                {submitDialog && (
                  <div className="border-t border-border p-5 bg-muted/30">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Send className="size-4 text-cyan-400" /> Submit Completed Work
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-[11px]">GitHub / Source Code URL</Label>
                        <Input
                          value={githubLink}
                          onChange={(e) => setGithubLink(e.target.value)}
                          placeholder="https://github.com/username/project"
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Demo Video URL (optional)</Label>
                        <Input
                          value={demoVideoUrl}
                          onChange={(e) => setDemoVideoUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Project Report (Markdown)</Label>
                        <Textarea
                          value={reportText}
                          onChange={(e) => setReportText(e.target.value)}
                          placeholder="## Overview&#10;Describe what you built..."
                          rows={5}
                          className="text-xs mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]">Notes for Mentor (optional)</Label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Anything specific you want the mentor to know..."
                          rows={2}
                          className="text-xs mt-1"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => setSubmitDialog(false)} disabled={busy}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={submitWork} disabled={busy} className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
                          {busy ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Send className="size-3.5 mr-1.5" />}
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function isDownloadedOrLocked(projectId: string, downloadedProjectId: string | null): boolean {
  return downloadedProjectId === projectId;
}
