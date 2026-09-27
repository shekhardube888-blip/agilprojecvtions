import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyRegistration, type StudentRecord } from "@/lib/notify";
import { hashPassword } from "@/lib/auth";
import { SITE } from "@/lib/data";

export const runtime = "nodejs";

// POST /api/register
// Body: StudentRecord (matches src/lib/data.ts form fields)
// Returns: { ok, id, whatsappUrl, mailtoUrl, smtpSent }
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const required = ["firstName", "lastName", "email", "mobile", "degree", "branch", "semester", "plan", "college", "state", "category", "categoryLabel", "project"];
    for (const k of required) {
      if (!body[k] || String(body[k]).trim() === "") {
        return NextResponse.json({ ok: false, error: `Missing field: ${k}` }, { status: 400 });
      }
    }

    const record: StudentRecord = {
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      email: String(body.email).trim(),
      mobile: String(body.mobile).trim(),
      degree: String(body.degree),
      branch: String(body.branch),
      semester: String(body.semester),
      plan: String(body.plan),
      college: String(body.college).trim(),
      state: String(body.state),
      source: body.source ? String(body.source) : null,
      notes: body.notes ? String(body.notes) : null,
      category: String(body.category),
      categoryLabel: String(body.categoryLabel),
      project: String(body.project),
      projectId: body.projectId ? Number(body.projectId) : null,
    };

    // 1) Persist to the database.
    const student = await db.student.create({
      data: {
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        mobile: record.mobile,
        degree: record.degree,
        branch: record.branch,
        semester: record.semester,
        plan: record.plan,
        college: record.college,
        state: record.state,
        source: record.source,
        notes: record.notes,
        category: record.category,
        categoryLabel: record.categoryLabel,
        project: record.project,
        projectId: record.projectId,
        consentWa: body.consentWa !== false,
        consentEm: body.consentEm !== false,
      },
    });

    // 2) Compose + persist + (optionally) send email & WhatsApp notifications
    //    destined for hr@agileprojection.com and WhatsApp 8319985622.
    const notify = await notifyRegistration(record, { to: SITE.email, whatsapp: SITE.whatsapp });

    // Mark the DB row with whether notifications were dispatched.
    await db.student.update({
      where: { id: student.id },
      data: { emailSent: notify.smtpSent, waSent: notify.smtpSent },
    });

    // 3) Auto-create a STUDENT LOGIN account so the student can log in with
    //    their registration email + mobile number. Idempotent (upsert by
    //    username = email). No expiry — the student keeps permanent portal
    //    access; the 2-day expiry is only for admin-unlocked demo accounts.
    try {
      await db.account.upsert({
        where: { username: record.email.toLowerCase() },
        update: {
          // refresh the password hash + name on re-registration
          passwordHash: hashPassword(record.mobile.replace(/[\s+]/g, "").replace(/^91/, "")),
          fullName: `${record.firstName} ${record.lastName}`,
          note: "Auto-created at registration — login with email + mobile",
        },
        create: {
          username: record.email.toLowerCase(),
          passwordHash: hashPassword(record.mobile.replace(/[\s+]/g, "").replace(/^91/, "")),
          role: "guest", // labeled "Student" in the UI
          status: "unlocked",
          fullName: `${record.firstName} ${record.lastName}`,
          note: "Auto-created at registration — login with email + mobile",
        },
      });
    } catch (acctErr) {
      // Non-fatal — the registration + notification already succeeded.
      console.error("[register] auto-account creation failed:", (acctErr as Error).message);
    }

    return NextResponse.json({
      ok: true,
      id: student.id,
      student: {
        name: `${record.firstName} ${record.lastName}`,
        email: record.email,
        project: record.project,
        categoryLabel: record.categoryLabel,
      },
      notification: {
        to: notify.to,
        whatsappNumber: notify.whatsappNumber,
        whatsappUrl: notify.whatsappUrl,
        mailtoUrl: notify.mailtoUrl,
        smtpSent: notify.smtpSent,
        logPersisted: notify.logPersisted,
      },
    });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/register  → list recent registrations (admin / staff overview)
export async function GET() {
  try {
    const students = await db.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        degree: true,
        branch: true,
        semester: true,
        college: true,
        state: true,
        plan: true,
        category: true,
        categoryLabel: true,
        project: true,
        emailSent: true,
        waSent: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ok: true, count: students.length, students });
  } catch (err) {
    console.error("[register GET] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
