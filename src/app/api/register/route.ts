import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { notifyRegistration, type StudentRecord } from "@/lib/notify";
import { makeSessionCookie, readSession } from "@/lib/auth";
import { SITE } from "@/lib/data";

export const runtime = "nodejs";

// POST /api/register
// Body: StudentRecord (matches src/lib/data.ts form fields) — the `email` field
// in the body is IGNORED. The email is taken from the verified Google session
// (session.user.email) so the student cannot register with a different email.
// Returns: { ok, id, whatsappUrl, mailtoUrl, smtpSent }
export async function POST(req: Request) {
  try {
    // 1) Require a verified session — either a Google (NextAuth) session OR a
    //    local login session (ap_session cookie from email+password signup or
    //    the tracker lookup-and-login flow). The email is taken from whichever
    //    session is active — NEVER from the request body.
    const googleSession = await getServerSession(authOptions);
    const localSession = readSession(req.headers.get("cookie"));
    const activeEmail = (
      googleSession?.user?.email ||
      localSession?.username ||
      ""
    ).toLowerCase().trim();

    if (!activeEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: "You must sign in before registering. Use Google Sign-In or your email+password.",
          code: "NO_SESSION",
        },
        { status: 401 }
      );
    }

    // 2) The student's email is ALWAYS the session email — never trust the body.
    const googleEmail = activeEmail;

    const body = await req.json();

    // 3) Validate required fields (email is NOT in this list — it comes from
    //    the Google session, not the request body).
    const required = [
      "firstName",
      "lastName",
      "mobile",
      "degree",
      "branch",
      "semester",
      "plan",
      "college",
      "state",
      "category",
      "categoryLabel",
      "project",
    ];
    for (const k of required) {
      if (!body[k] || String(body[k]).trim() === "") {
        return NextResponse.json(
          { ok: false, error: `Missing field: ${k}` },
          { status: 400 }
        );
      }
    }

    const record: StudentRecord = {
      firstName: String(body.firstName).trim(),
      lastName: String(body.lastName).trim(),
      email: googleEmail, // ← from Google session, NEVER from body
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

    // 4) Duplicate check — a Student with this Google email already exists.
    //    This is how we "link the student profile to the Google account to
    //    avoid duplicate registrations".
    const existingStudent = await db.student.findFirst({
      where: { email: googleEmail },
      select: { id: true },
    });
    if (existingStudent) {
      return NextResponse.json(
        {
          ok: false,
          error: "You are already registered. Log in with your Google account to continue.",
          code: "DUPLICATE",
        },
        { status: 409 }
      );
    }

    // 5) Persist the student record.
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

    // 6) Compose + persist + (optionally) send email & WhatsApp notifications
    //    destined for hr@agileprojection.com and WhatsApp 8319985622.
    const notify = await notifyRegistration(record, {
      to: SITE.email,
      whatsapp: SITE.whatsapp,
    });

    // Mark the DB row with whether notifications were dispatched.
    await db.student.update({
      where: { id: student.id },
      data: { emailSent: notify.smtpSent, waSent: notify.smtpSent },
    });

    // 7) Find or create the local Account linked to this Google email — same
    //    logic as /api/auth/google-link. Google handles authentication; the
    //    Account has no usable password. Permanent (never expires).
    //    SECURITY: the passwordHash is a random unusable value — never loggable
    //    via /api/auth/login, never returned to the client.
    try {
      const { randomBytes } = await import("crypto");
      const unusableHash =
        randomBytes(48).toString("hex") + ":" + randomBytes(64).toString("hex");

      const existingAccount = await db.account.findUnique({
        where: { username: googleEmail },
      });
      if (!existingAccount) {
        await db.account.create({
          data: {
            username: googleEmail,
            passwordHash: unusableHash, // never usable — Google handles auth
            role: "guest", // labeled "Student" in the UI
            status: "unlocked",
            expiresAt: null, // permanent — Google students never expire
            passwordSetAt: null,
            fullName: `${record.firstName} ${record.lastName}`,
            note: "Auto-created at registration — login via Google OAuth",
          },
        });
      } else if (
        existingAccount.status !== "unlocked" ||
        existingAccount.expiresAt !== null
      ) {
        // Re-link: make sure the account is unlocked + permanent.
        await db.account.update({
          where: { id: existingAccount.id },
          data: {
            status: "unlocked",
            expiresAt: null,
            passwordSetAt: null,
            fullName: `${record.firstName} ${record.lastName}`,
          },
        });
      }
    } catch (acctErr) {
      // Non-fatal — the registration + notification already succeeded.
      console.error(
        "[register] auto-account creation failed:",
        (acctErr as Error).message
      );
    }

    // 8) Return the same success response as before, plus a fresh ap_session
    //    cookie (in case the user landed here without going through
    //    /api/auth/google-link first). Idempotent + harmless if already set.
    const res = NextResponse.json({
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
    res.headers.append(
      "Set-Cookie",
      makeSessionCookie({
        username: googleEmail,
        role: "guest",
        scope: "agileprojection-portal",
      })
    );
    return res;
  } catch (err) {
    // SECURITY: never log credentials. The error message is generic.
    console.error("[register] error:", (err as Error).message);
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
    console.error("[register GET] error:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
