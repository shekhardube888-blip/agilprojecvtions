"use client";

import { useEffect, useState } from "react";
import { Award, Download, Loader2, ShieldCheck, X, Printer, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type CertData = {
  certificateNumber: string;
  type: string;
  eligibility: string;
  issuedAt: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    degree: string;
    branch: string;
    college: string;
    project: string;
    categoryLabel: string;
    completedAt: string | null;
  };
};

export function CertificateView({
  certificate,
  open,
  onOpenChange,
}: {
  certificate: CertData | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!certificate) return null;

  const s = certificate.student;
  const studentName = `${s.firstName} ${s.lastName}`.trim();
  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const completedDate = s.completedAt
    ? new Date(s.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  function downloadPdf() {
    setLoading(true);
    // Open the public certificate URL (returns a print-ready HTML page) in a new tab
    // with ?print=1 → the page auto-triggers window.print() so the user can Save as PDF.
    const url = `/api/certificate/${certificate!.certificateNumber}?print=1`;
    window.open(url, "_blank");
    setTimeout(() => setLoading(false), 800);
    toast({ title: "Certificate opened", description: "Use your browser's 'Save as PDF' in the print dialog." });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border text-foreground sm:max-w-4xl lg:sm:max-w-5xl max-h-[94vh] p-0 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted">
          <div className="flex items-center gap-2.5">
            <span className="size-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center text-white">
              <Award className="size-4" />
            </span>
            <div>
              <DialogTitle className="font-bold text-base">Certificate of Completion</DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground">
                {certificate.certificateNumber} · Issued {issuedDate}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={downloadPdf} disabled={loading} className="h-8 text-xs">
              {loading ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Download className="size-3.5 mr-1" />}
              Download PDF
            </Button>
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="h-8 text-xs"
            >
              <a href={`/api/certificate/${certificate.certificateNumber}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5 mr-1" /> Public link
              </a>
            </Button>
            <button onClick={() => onOpenChange(false)} aria-label="Close" className="size-8 rounded-md grid place-items-center text-muted-foreground hover:bg-secondary">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* The certificate canvas */}
        <div className="overflow-y-auto p-5 bg-muted/30" style={{ maxHeight: "calc(94vh - 64px)" }}>
          <CertificateCanvas
            certificateNumber={certificate.certificateNumber}
            type={certificate.type}
            studentName={studentName}
            project={s.project}
            categoryLabel={s.categoryLabel}
            college={s.college}
            degree={s.degree}
            branch={s.branch}
            completedDate={completedDate}
            issuedDate={issuedDate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── The visual certificate (printable) ──
export function CertificateCanvas({
  certificateNumber,
  type,
  studentName,
  project,
  categoryLabel,
  college,
  degree,
  branch,
  completedDate,
  issuedDate,
}: {
  certificateNumber: string;
  type: string;
  studentName: string;
  project: string;
  categoryLabel: string;
  college: string;
  degree: string;
  branch: string;
  completedDate: string;
  issuedDate: string;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto" style={{ aspectRatio: "1.414 / 1" }}>
      <div
        className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #0a1422 0%, #0f2340 50%, #0a1422 100%)",
          border: "3px solid #d4af37",
          boxShadow: "0 0 0 1px #d4af37, 0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Decorative corner flourishes */}
        <CornerFlourish className="top-2 left-2" />
        <CornerFlourish className="top-2 right-2 rotate-90" />
        <CornerFlourish className="bottom-2 left-2 -rotate-90" />
        <CornerFlourish className="bottom-2 right-2 rotate-180" />

        {/* Inner border */}
        <div className="absolute inset-3 border-2 border-amber-400/40 rounded" />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-between px-8 py-8 text-center">
          {/* Header */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              {/* Logo seal */}
              <div className="size-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 grid place-items-center text-2xl font-black text-[#0a1422] shadow-lg border-2 border-amber-200">
                AP
              </div>
              <div className="text-left">
                <div className="text-amber-300 text-lg font-bold tracking-wide">AgileProjection</div>
                <div className="text-cyan-300/80 text-[10px] tracking-[0.3em] uppercase">NT-AI Network</div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-1">
            <div className="text-amber-400 text-[11px] font-semibold tracking-[0.4em] uppercase">Certificate of</div>
            <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: "Georgia, serif" }}>
              {type || "Internship Completion"}
            </h1>
            <div className="mt-2 h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          </div>

          {/* Body */}
          <div className="flex flex-col items-center gap-2 max-w-2xl">
            <p className="text-slate-300 text-sm">This is to certify that</p>
            <h2 className="text-3xl md:text-4xl font-bold text-amber-300" style={{ fontFamily: "Georgia, serif" }}>
              {studentName}
            </h2>
            <p className="text-slate-200 text-sm leading-relaxed">
              has successfully completed the industry-grade internship program in
              <span className="text-cyan-300 font-semibold"> {categoryLabel}</span>
              {" "}with the project titled
            </p>
            <p className="text-white text-lg font-semibold px-4 py-1 border-b border-amber-400/30">
              &ldquo;{project}&rdquo;
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {degree} · {branch} · {college}
            </p>
          </div>

          {/* Footer with dates + signature */}
          <div className="w-full flex items-end justify-between gap-6 text-left">
            {/* Completed date */}
            <div className="flex flex-col gap-1">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider">Completed</div>
              <div className="text-white text-sm font-semibold">{completedDate}</div>
              <div className="h-px w-24 bg-slate-500" />
            </div>

            {/* Center: certificate number + verify */}
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="size-5 text-emerald-400" />
              <div className="text-slate-400 text-[9px] uppercase tracking-wider">Certificate No.</div>
              <div className="font-mono text-amber-300 text-sm font-bold tracking-wider">{certificateNumber}</div>
              <div className="text-slate-500 text-[9px]">Verify at agileprojection.com</div>
            </div>

            {/* Signature */}
            <div className="flex flex-col gap-1 items-end">
              <div className="text-amber-300 text-lg italic" style={{ fontFamily: "Georgia, serif" }}>
                Shekhar Dube
              </div>
              <div className="h-px w-28 bg-slate-500" />
              <div className="text-slate-400 text-[10px] uppercase tracking-wider">Director, NT-AI Network</div>
              <div className="text-slate-300 text-[10px]">Issued: {issuedDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerFlourish({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute size-12 pointer-events-none text-amber-400/50 ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <path d="M2 2 L2 18 M2 2 L18 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 10 L10 10 M10 2 L10 10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
