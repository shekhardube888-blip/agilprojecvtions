import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { makeSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/student/lookup-and-login  { email, mobile }
//
// A combined "lookup + sign-in" endpoint for the Project Tracker's manual
// form. The student enters their registration email + mobile; this endpoint:
//   1. Verifies the email + mobile match a Student record (mobile = proof of
//      identity — NOT used as a password).
//   2. If matched, finds (or creates) the linked Account by email.
//   3. Sets the local session cookie → the student is now signed in.
//   4. Returns the full student record so the tracker can render immediately.
//
// This works for ALL student types:
//   - Old-flow registered students (Account password = mobile) → just sets cookie
//   - Password-signup students (Account password = chosen) → mobile verifies identity, cookie set
//   - Google students (no password) → mobile verifies identity, cookie set
//
// SECURITY: the mobile is a verification token, not a password. An attacker
// would need to know BOTH the student's email AND their registered mobile to
// log in — which is the same security level as the old "email + mobile lookup".

export async function POST(req: Request) {
  try {
    const { email: emailRaw, mobile: mobileRaw } = await req.json();
    const email = String(emailRaw || "").trim().toLowerCase();
    const mobile = String(mobileRaw || "").trim();

    if (!email || !mobile) {
      return NextResponse.json(
        { ok: false, error: "Email and mobile number are required." },
        { status: 400 }
      );
    }

    // Normalize mobile the same way the registration form does: strip spaces/+, strip leading 91
    const mobileNorm = mobile.replace(/[\s+]/g, "").replace(/^91/, "");

    // Find the Student by email (case-insensitive) + mobile (normalized match)
    // SQLite doesn't support mode:"insensitive", so fetch candidates + filter in JS.
    const candidates = await db.student.findMany({
      where: { email: { startsWith: email.split("@")[0].slice(0, 3) } },
      take: 100,
    });
    let student = candidates.find((s) => s.email.toLowerCase() === email);
    if (!student) {
      const all = await db.student.findMany({ take: 500 });
      student = all.find((s) => s.email.toLowerCase() === email) || null;
    }

    if (!student) {
      return NextResponse.json(
        { ok: false, error: "No registration found for that email. Please register first.", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Verify the mobile matches (proof of identity)
    const studentMobileNorm = student.mobile.replace(/[\s+]/g, "").replace(/^91/, "");
    if (studentMobileNorm !== mobileNorm) {
      return NextResponse.json(
        { ok: false, error: "The mobile number doesn't match our records. Please check and try again.", code: "MOBILE_MISMATCH" },
        { status: 401 }
      );
    }

    // Mobile verified → find (or create) the linked Account + set session cookie
    let account = await db.account.findUnique({ where: { username: email } });
    if (!account) {
      // Student exists but no Account yet (e.g. admin-created student record).
      // Create a permanent, unlocked Account linked to this email.
      const { randomBytes } = await import("crypto");
      const unusableHash = randomBytes(48).toString("hex") + ":" + randomBytes(64).toString("hex");
      account = await db.account.create({
        data: {
          username: email,
          passwordHash: unusableHash, // no password — login via this lookup-and-login flow or Google
          role: "guest",
          status: "unlocked",
          expiresAt: null,
          passwordSetAt: null,
          fullName: `${student.firstName} ${student.lastName}`.trim(),
          note: "Auto-created at lookup-and-login (mobile-verified)",
        },
      });
    } else {
      // Ensure the account is unlocked + permanent when re-verified via mobile
      if (account.status !== "unlocked" || account.expiresAt !== null) {
        account = await db.account.update({
          where: { id: account.id },
          data: { status: "unlocked", expiresAt: null, passwordSetAt: null },
        });
      }
    }

    // Set the session cookie → student is now signed in
    const cookie = makeSessionCookie({
      username: account.username,
      role: "guest",
      scope: "agileprojection-portal",
    });

    const res = NextResponse.json({
      ok: true,
      loggedIn: true,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        mobile: student.mobile,
        degree: student.degree,
        branch: student.branch,
        college: student.college,
        plan: student.plan,
        category: student.category,
        categoryLabel: student.categoryLabel,
        project: student.project,
        projectId: student.projectId,
        paymentStatus: student.paymentStatus,
        internshipStatus: student.internshipStatus,
        currentStage: student.currentStage,
        startedAt: student.startedAt,
        completedAt: student.completedAt,
        createdAt: student.createdAt,
      },
      account: {
        id: account.id,
        username: account.username,
        role: account.role,
        status: account.status,
        fullName: account.fullName,
      },
    });
    res.headers.append("Set-Cookie", cookie);
    return res;
  } catch (err) {
    console.error("[lookup-and-login] error:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: "Lookup failed. Please try again." },
      { status: 500 }
    );
  }
}
