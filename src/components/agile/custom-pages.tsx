"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { FileText, Loader2, X, LayoutGrid, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type PageMeta = { id: string; slug: string; title: string; order: number; updatedAt: string };

export function CustomPages() {
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [html, setHtml] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/pages", { cache: "no-store" }); const data = await res.json(); if (data.ok) setPages(data.pages || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openPage(slug: string) {
    setActiveSlug(slug); setPageLoading(true); setHtml("");
    try { const res = await fetch(`/api/pages/${slug}`, { cache: "no-store" }); const data = await res.json(); if (!res.ok || !data.ok) throw new Error(data.error); setHtml(data.page.html); }
    catch (e) { toast({ title: "Page load failed", description: (e as Error).message, variant: "destructive" }); setActiveSlug(null); }
    finally { setPageLoading(false); }
  }

  const active = pages.find((p) => p.slug === activeSlug) || null;

  return (
    <>
      <Button onClick={() => { setOpen(true); load(); }} variant="outline" size="lg" className="bg-popover border-border text-foreground hover:text-cyan-300 hover:border-cyan-500/50 h-12 px-6">
        <LayoutGrid className="size-5 mr-2" /> Pages
        {pages.length > 0 && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">{pages.length}</span>}
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setActiveSlug(null); }}>
        <DialogContent className="bg-popover border-border text-foreground sm:max-w-3xl lg:sm:max-w-4xl max-h-[88vh] overflow-y-auto">
          <div className="sticky top-0 -mx-6 -mt-6 mb-2 px-6 py-3 bg-popover/95 backdrop-blur border-b border-border flex items-center gap-3 z-10">
            <span className="size-8 rounded-lg bg-secondary grid place-items-center text-cyan-400 border border-border"><LayoutGrid className="size-4" /></span>
            <div className="flex-1"><DialogTitle className="font-bold text-base">{active ? active.title : "Custom Pages"}</DialogTitle><DialogDescription className="text-[11px] text-muted-foreground">{active ? `/${active.slug}` : "Open any page in a popup"}</DialogDescription></div>
            {active && <Button variant="ghost" size="sm" onClick={() => setActiveSlug(null)} className="text-muted-foreground hover:text-cyan-300 h-8"><ArrowLeft className="size-3.5 mr-1" /> All pages</Button>}
            <button onClick={() => setOpen(false)} aria-label="Close" className="size-8 rounded-md grid place-items-center text-muted-foreground hover:text-cyan-300 hover:bg-secondary"><X className="size-4" /></button>
          </div>
          <div className="px-1 pb-2">
            {!active ? (
              loading ? <div className="py-10 text-center text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin mx-auto mb-2" /> Loading…</div> :
              pages.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No pages yet.</div> :
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pages.map((p) => (
                  <button key={p.id} type="button" onClick={() => openPage(p.slug)} className="group text-left bg-card border border-border rounded-xl p-4 ap-lift">
                    <span className="size-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 grid place-items-center text-white mb-2"><FileText className="size-4" /></span>
                    <div className="font-semibold text-foreground text-sm">{p.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">/{p.slug}</div>
                    <div className="text-[10px] text-cyan-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Open</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="min-h-[300px]">
                {pageLoading ? <div className="py-10 text-center text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin mx-auto mb-2" /> Loading…</div> :
                  <div className="prose prose-sm prose-invert max-w-none prose-h1:text-2xl prose-h1:text-foreground prose-h2:text-lg prose-h2:text-cyan-300 prose-a:text-cyan-300 prose-strong:text-slate-100 prose-ul:my-3 prose-li:my-1 prose-table:my-3 prose-th:text-foreground prose-th:bg-[#0a1422] prose-td:text-slate-300 prose-td:border-[rgba(6,182,212,0.18)]" dangerouslySetInnerHTML={{ __html: html }} />}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
