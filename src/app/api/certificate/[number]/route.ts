import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/certificate/[number]
// PUBLIC — anyone can verify a certificate by its number.
// Returns a beautiful HTML page (the visual certificate) so employers / colleges
// can verify it visually AND print it to PDF.
//
// Query params:
//   ?print=1  → auto-triggers window.print() on load (for the "Download PDF" button)
//   ?json=1   → returns JSON instead of HTML (for programmatic verification)

export async function GET(req: Request, { params }: { params: Promise<{ number: string }> }) {
  try {
    const { number } = await params;
    const url = new URL(req.url);
    const wantJson = url.searchParams.get("json") === "1";
    const print = url.searchParams.get("print") === "1";

    const cert = await db.certificate.findUnique({
      where: { certificateNumber: number.toUpperCase() },
      include: {
        student: {
          select: {
            firstName: true, lastName: true, email: true, degree: true, branch: true,
            college: true, project: true, categoryLabel: true, completedAt: true,
          },
        },
      },
    });

    if (!cert) {
      if (wantJson) {
        return NextResponse.json({ ok: false, error: "Certificate not found." }, { status: 404 });
      }
      return new NextResponse(notFoundHtml(number), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    if (wantJson) {
      return NextResponse.json({
        ok: true,
        certificate: {
          certificateNumber: cert.certificateNumber,
          type: cert.type,
          eligibility: cert.eligibility,
          issuedAt: cert.issuedAt,
          student: cert.student,
        },
      });
    }

    // Return a beautiful HTML certificate page
    const html = buildCertificateHtml(cert, print);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[certificate/[number]] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}

// ── Build the full HTML certificate page (for public viewing + printing) ──
function buildCertificateHtml(cert: any, print: boolean): string {
  const s = cert.student;
  const studentName = `${s.firstName} ${s.lastName}`.trim();
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const completedDate = s.completedAt
    ? new Date(s.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Certificate ${escapeHtml(cert.certificateNumber)} · AgileProjection</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    background: #0a1422;
    color: #fff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
  }
  .toolbar {
    width: 100%;
    max-width: 1100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .toolbar .brand { display: flex; align-items: center; gap: 0.6rem; }
  .toolbar .brand .logo {
    width: 40px; height: 40px; border-radius: 8px;
    background: linear-gradient(135deg, #fbbf24, #d97706);
    display: grid; place-items: center; font-weight: 900; color: #0a1422; font-size: 1.1rem;
  }
  .toolbar .brand .name { color: #fbbf24; font-weight: 700; }
  .toolbar .brand .sub { color: #67e8f9; font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase; }
  .toolbar .actions { display: flex; gap: 0.5rem; }
  .toolbar .actions button {
    background: #fbbf24; color: #0a1422; border: none; padding: 0.5rem 1rem;
    border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.85rem;
  }
  .toolbar .actions a {
    color: #67e8f9; text-decoration: none; font-size: 0.8rem; padding: 0.5rem 0.8rem;
    border: 1px solid rgba(103,232,249,0.3); border-radius: 6px;
  }
  .cert-wrap {
    width: 100%;
    max-width: 1100px;
    aspect-ratio: 1.414 / 1;
    position: relative;
    background: linear-gradient(135deg, #0a1422 0%, #0f2340 50%, #0a1422 100%);
    border: 3px solid #d4af37;
    box-shadow: 0 0 0 1px #d4af37, 0 20px 60px rgba(0,0,0,0.5);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .cert-inner { position: absolute; inset: 12px; border: 2px solid rgba(251,191,36,0.4); border-radius: 4px; }
  .cert-content {
    position: relative; height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: space-between;
    padding: 2.5rem 3rem; text-align: center;
  }
  .header { display: flex; align-items: center; gap: 0.75rem; }
  .seal {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, #fcd34d, #d97706);
    display: grid; place-items: center; font-weight: 900; color: #0a1422;
    font-size: 1.3rem; border: 2px solid #fde68a;
  }
  .header .brand-name { color: #fbbf24; font-weight: 700; font-size: 1.1rem; }
  .header .brand-sub { color: rgba(103,232,249,0.8); font-size: 0.6rem; letter-spacing: 0.3em; text-transform: uppercase; }
  .title-block { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
  .title-kicker { color: #fbbf24; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.4em; text-transform: uppercase; }
  .title { font-size: 2.8rem; font-weight: 900; color: #fff; font-family: Georgia, serif; }
  .title-line { margin-top: 0.5rem; height: 1px; width: 120px; background: linear-gradient(90deg, transparent, #fbbf24, transparent); }
  .body { max-width: 600px; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .body .pre { color: #cbd5e1; font-size: 0.9rem; }
  .body .name { font-size: 2.2rem; font-weight: 700; color: #fcd34d; font-family: Georgia, serif; }
  .body .desc { color: #e2e8f0; font-size: 0.9rem; line-height: 1.5; }
  .body .desc .accent { color: #67e8f9; font-weight: 600; }
  .body .project { color: #fff; font-size: 1.1rem; font-weight: 600; padding: 0.25rem 1rem; border-bottom: 1px solid rgba(251,191,36,0.3); }
  .body .meta { color: #94a3b8; font-size: 0.75rem; margin-top: 0.25rem; }
  .footer { width: 100%; display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; }
  .footer .col { display: flex; flex-direction: column; gap: 0.25rem; }
  .footer .col.right { align-items: flex-end; }
  .footer .label { color: #94a3b8; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; }
  .footer .value { color: #fff; font-size: 0.9rem; font-weight: 600; }
  .footer .line { height: 1px; width: 100px; background: #64748b; }
  .footer .center { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
  .footer .center .num { font-family: monospace; color: #fcd34d; font-weight: 700; font-size: 0.95rem; letter-spacing: 0.1em; }
  .footer .center .verify { color: #64748b; font-size: 0.55rem; }
  .footer .sig { color: #fcd34d; font-size: 1.1rem; font-style: italic; font-family: Georgia, serif; }
  .corner { position: absolute; width: 48px; height: 48px; pointer-events: none; color: rgba(251,191,36,0.5); }
  .corner.tl { top: 8px; left: 8px; }
  .corner.tr { top: 8px; right: 8px; transform: rotate(90deg); }
  .corner.bl { bottom: 8px; left: 8px; transform: rotate(-90deg); }
  .corner.br { bottom: 8px; right: 8px; transform: rotate(180deg); }
  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none; }
    .cert-wrap { box-shadow: none; border: 3px solid #d4af37; max-width: 100%; aspect-ratio: 1.414 / 1; }
    @page { size: landscape; margin: 0; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <div class="brand">
      <div class="logo">AP</div>
      <div>
        <div class="name">AgileProjection</div>
        <div class="sub">NT-AI Network</div>
      </div>
    </div>
    <div class="actions">
      <a href="/api/certificate/${encodeURIComponent(cert.certificateNumber)}?json=1" target="_blank">View JSON</a>
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>

  <div class="cert-wrap">
    <div class="cert-inner"></div>
    <svg class="corner tl" viewBox="0 0 48 48" fill="none"><path d="M2 2 L2 18 M2 2 L18 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.4"/></svg>
    <svg class="corner tr" viewBox="0 0 48 48" fill="none"><path d="M2 2 L2 18 M2 2 L18 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.4"/></svg>
    <svg class="corner bl" viewBox="0 0 48 48" fill="none"><path d="M2 2 L2 18 M2 2 L18 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.4"/></svg>
    <svg class="corner br" viewBox="0 0 48 48" fill="none"><path d="M2 2 L2 18 M2 2 L18 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.4"/></svg>

    <div class="cert-content">
      <div class="header">
        <div class="seal">AP</div>
        <div style="text-align:left">
          <div class="brand-name">AgileProjection</div>
          <div class="brand-sub">NT-AI Network</div>
        </div>
      </div>

      <div class="title-block">
        <div class="title-kicker">Certificate of</div>
        <div class="title">${escapeHtml(cert.type || "Internship Completion")}</div>
        <div class="title-line"></div>
      </div>

      <div class="body">
        <div class="pre">This is to certify that</div>
        <div class="name">${escapeHtml(studentName)}</div>
        <div class="desc">
          has successfully completed the industry-grade internship program in
          <span class="accent">${escapeHtml(s.categoryLabel || "")}</span>
          with the project titled
        </div>
        <div class="project">&ldquo;${escapeHtml(s.project || "")}&rdquo;</div>
        <div class="meta">${escapeHtml(s.degree)} · ${escapeHtml(s.branch)} · ${escapeHtml(s.college)}</div>
      </div>

      <div class="footer">
        <div class="col">
          <div class="label">Completed</div>
          <div class="value">${escapeHtml(completedDate)}</div>
          <div class="line"></div>
        </div>
        <div class="center">
          <div class="label">Certificate No.</div>
          <div class="num">${escapeHtml(cert.certificateNumber)}</div>
          <div class="verify">Verify at agileprojection.com</div>
        </div>
        <div class="col right">
          <div class="sig">Shekhar Dube</div>
          <div class="line"></div>
          <div class="label">Director, NT-AI Network</div>
          <div class="verify">Issued: ${escapeHtml(issuedDate)}</div>
        </div>
      </div>
    </div>
  </div>

  ${print ? "<script>window.addEventListener('load',function(){setTimeout(function(){window.print()},300)})</script>" : ""}
</body>
</html>`;
}

function notFoundHtml(number: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Certificate not found</title>
<style>
body{font-family:system-ui,sans-serif;background:#0a1422;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{text-align:center;padding:3rem;max-width:500px}
h1{color:#f87171;font-size:1.5rem;margin-bottom:1rem}
p{color:#94a3b8;line-height:1.6}
code{background:#1e293b;color:#fcd34d;padding:0.2rem 0.5rem;border-radius:4px;font-family:monospace}
a{color:#67e8f9}
</style></head>
<body><div class="box">
<h1>✗ Certificate not found</h1>
<p>No certificate was found with number <code>${escapeHtml(number)}</code>.</p>
<p>Please check the number and try again, or <a href="/">return to the portal</a>.</p>
</div></body></html>`;
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
