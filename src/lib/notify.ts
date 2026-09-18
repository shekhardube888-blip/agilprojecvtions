// Notification helper: composes + persists email & WhatsApp payloads
// destined for hr@agileprojection.com and WhatsApp 8319985622.
//
// In a sandboxed environment we cannot rely on a live SMTP relay being
// configured, so this module:
//   1. Composes a full HTML + plain-text email body
//   2. Persists it to /home/z/my-project/notifications/emails.log (audit trail)
//   3. Logs it to stdout (visible in dev.log)
//   4. Returns a mailto: link and a wa.me link so the portal can surface
//      "Send now" buttons to the user, AND a flag indicating whether a real
//      SMTP send was attempted.
//
// If SMTP_HOST / SMTP_USER / SMTP_PASS env vars are present in production,
// nodemailer is used to actually send the email. Otherwise we fall back to
// the mailto:/log approach so the app always works, even without SMTP.

import { promises as fs } from "fs";
import path from "path";
import nodemailer from "nodemailer";

export type StudentRecord = {
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
  source?: string;
  notes?: string;
  category: string;
  categoryLabel: string;
  project: string;
  projectId?: number | null;
};

const NOTIFICATIONS_DIR = "/home/z/my-project/notifications";

function ensureDir() {
  // Best-effort directory creation
  try {
    fs.mkdir(NOTIFICATIONS_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
}

export function buildEmailSubject(s: StudentRecord): string {
  return `New Student Registration — ${s.firstName} ${s.lastName} · ${s.categoryLabel} · ${s.degree}`;
}

export function buildEmailText(s: StudentRecord): string {
  return [
    `New student registration received on AgileProjection (NT-AI Network).`,
    ``,
    `Student Details:`,
    `  Name        : ${s.firstName} ${s.lastName}`,
    `  Email       : ${s.email}`,
    `  Mobile      : ${s.mobile}`,
    `  Degree      : ${s.degree}`,
    `  Branch      : ${s.branch}`,
    `  Semester    : ${s.semester}`,
    `  College     : ${s.college}`,
    `  State       : ${s.state}`,
    `  Plan        : ${s.plan}`,
    `  Source      : ${s.source || "—"}`,
    `  Notes       : ${s.notes || "—"}`,
    ``,
    `Selected Project:`,
    `  Category : ${s.categoryLabel} (${s.category})`,
    `  Project  : ${s.project}`,
    `  Project ID: ${s.projectId ?? "—"}`,
    ``,
    `--`,
    `AgileProjection · NT-AI Network auto-notification`,
  ].join("\n");
}

export function buildEmailHtml(s: StudentRecord): string {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 14px;color:#94a3b8;font-weight:600;white-space:nowrap;font-size:13px;">${k}</td><td style="padding:6px 14px;color:#f8fafc;font-size:13px;">${v}</td></tr>`;
  return `<!doctype html><html><body style="margin:0;background:#0B1929;font-family:Inter,Arial,sans-serif;color:#F8FAFC;">
  <div style="max-width:620px;margin:24px auto;background:#111f35;border:1px solid rgba(6,182,212,.18);border-radius:14px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#2563EB,#06B6D4);padding:20px 24px;">
      <div style="font-size:18px;font-weight:700;">⚡ AgileProjection · NT-AI Network</div>
      <div style="font-size:13px;opacity:.9;margin-top:2px;">New Student Registration</div>
    </div>
    <div style="padding:20px 8px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row("Name", `${s.firstName} ${s.lastName}`)}
        ${row("Email", s.email)}
        ${row("Mobile", s.mobile)}
        ${row("Degree", s.degree)}
        ${row("Branch", s.branch)}
        ${row("Semester", s.semester)}
        ${row("College", s.college)}
        ${row("State", s.state)}
        ${row("Plan", s.plan)}
        ${row("Source", s.source || "—")}
        ${row("Notes", s.notes || "—")}
      </table>
    </div>
    <div style="margin:8px 24px 0;padding:14px 16px;background:rgba(6,182,212,.07);border-left:3px solid #06B6D4;border-radius:0 8px 8px 0;">
      <div style="font-size:11px;color:#06B6D4;font-weight:700;letter-spacing:.5px;">SELECTED PROJECT</div>
      <div style="font-size:14px;color:#F8FAFC;font-weight:600;margin-top:4px;">${s.project}</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:2px;">${s.categoryLabel}</div>
    </div>
    <div style="padding:16px 24px;color:#64748b;font-size:11px;">— AgileProjection · NT-AI Network auto-notification</div>
  </div></body></html>`;
}

// Build a wa.me URL with a pre-filled message for the staff WhatsApp (8319985622).
export function buildWhatsAppUrl(s: StudentRecord, whatsappNumber: string): string {
  const msg =
    `*New AgileProjection Registration*\n\n` +
    `*Name:* ${s.firstName} ${s.lastName}\n` +
    `*Email:* ${s.email}\n` +
    `*Mobile:* ${s.mobile}\n` +
    `*Degree:* ${s.degree} — ${s.branch}\n` +
    `*Semester:* ${s.semester}\n` +
    `*College:* ${s.college}, ${s.state}\n` +
    `*Plan:* ${s.plan}\n\n` +
    `*Project:* ${s.project}\n` +
    `*Domain:* ${s.categoryLabel}\n\n` +
    `Please confirm onboarding within 24 hours.`;
  const base = `https://wa.me/${whatsappNumber}`;
  return `${base}?text=${encodeURIComponent(msg)}`;
}

// Build a mailto: URL pre-addressed to hr@agileprojection.com.
export function buildMailtoUrl(to: string, subject: string, text: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}

export type NotifyResult = {
  to: string;
  subject: string;
  text: string;
  html: string;
  whatsappNumber: string;
  whatsappUrl: string;
  mailtoUrl: string;
  smtpSent: boolean;
  logPersisted: boolean;
};

export async function notifyRegistration(s: StudentRecord, opts: { to: string; whatsapp: string }): Promise<NotifyResult> {
  const subject = buildEmailSubject(s);
  const text = buildEmailText(s);
  const html = buildEmailHtml(s);
  const whatsappUrl = buildWhatsAppUrl(s, opts.whatsapp);
  const mailtoUrl = buildMailtoUrl(opts.to, subject, text);

  let smtpSent = false;
  // Real SMTP send only if credentials are configured.
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `AgileProjection <${process.env.SMTP_USER}>`,
        to: opts.to,
        subject,
        text,
        html,
      });
      smtpSent = true;
    } catch (err) {
      console.error("[notify] SMTP send failed, falling back to mailto:", (err as Error).message);
    }
  }

  // Persist a persistent audit log entry regardless of SMTP outcome.
  let logPersisted = false;
  try {
    ensureDir();
    const stamp = new Date().toISOString();
    const entry = [
      `==================================================`,
      `[${stamp}] REGISTRATION NOTIFICATION`,
      `To: ${opts.to}`,
      `WhatsApp: ${opts.whatsapp}`,
      `SMTP sent: ${smtpSent}`,
      `Subject: ${subject}`,
      `---- TEXT BODY ----`,
      text,
      ``,
    ].join("\n");
    await fs.appendFile(path.join(NOTIFICATIONS_DIR, "emails.log"), entry + "\n");
    logPersisted = true;
  } catch (err) {
    console.error("[notify] failed to persist log:", (err as Error).message);
  }

  // Also surface on stdout so it's visible in dev.log.
  console.log(`\n========== AGILEPROJECTION REGISTRATION ==========`);
  console.log(`To: ${opts.to} | WhatsApp: ${opts.whatsapp}`);
  console.log(`Subject: ${subject}`);
  console.log(text);
  console.log(`==================================================\n`);

  return { to: opts.to, subject, text, html, whatsappNumber: opts.whatsapp, whatsappUrl, mailtoUrl, smtpSent, logPersisted };
}
