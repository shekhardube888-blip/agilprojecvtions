import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ensureAccountsSeeded,
  hashPassword,
  isExpired,
  makeSessionCookie,
} from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/auth/signup  { email, password, fullName, mobile }
// Creates a STUDENT account (role = "guest") + a basic Student record.
//
// SECURITY:
// - The role is HARDCODED to "guest" (student). This endpoint can NEVER create
//   an admin account, even if the client sends role="admin" in the body — the
//   field is ignored.
// - The password is hashed via scrypt (same as the existing system) and never
//   logged or returned in the response.
// - Email is the unique key; duplicates are rejected (409).
// - New student accounts are permanent + unlocked so students can log in
//   immediately after signup.

type SignupBody = {
  email?: string;
  password?: string;
  fullName?: string;
  mobile?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const body = (await req.json()) as SignupBody;

    const emailRaw = String(body.email || "").trim();
    const password = String(body.password || "");
    const fullNameRaw = String(body.fullName || "").trim();
    const mobileRaw = String(body.mobile || "").trim();

    // ── Validation ──
    if (!emailRaw) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }
    if (!isValidEmail(emailRaw)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ ok: false, error: "Password is required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters long." }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ ok: false, error: "Password is too long (max 128 characters)." }, { status: 400 });
    }
    if (!fullNameRaw) {
      return NextResponse.json({ ok: false, error: "Full name is required." }, { status: 400 });
    }
    if (!mobileRaw) {
      return NextResponse.json({ ok: false, error: "Mobile number is required." }, { status: 400 });
    }
    // Basic mobile sanity check: 7-15 digits after stripping spaces/dashes/+.
    const mobileDigits = mobileRaw.replace(/[\s\-()+]/g, "");
    if (!/^\d{7,15}$/.test(mobileDigits)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid mobile number (7-15 digits)." }, { status: 400 });
    }

    const email = normalizeEmail(emailRaw);
    const { firstName, lastName } = splitName(fullNameRaw);

    // ── Duplicate check: reject if an Account OR Student already exists with this email ──
    const existingAccount = await db.account.findUnique({ where: { username: email } });
    if (existingAccount) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists. Please sign in instead.", code: "DUPLICATE" },
        { status: 409 }
      );
    }
    const existingStudent = await db.student.findFirst({ where: { email } });
    if (existingStudent) {
      return NextResponse.json(
        { ok: false, error: "A student record with this email already exists. Please sign in instead.", code: "DUPLICATE" },
        { status: 409 }
      );
    }

    // ── Create the student Account ──
    // SECURITY: role is hardcoded to "guest" (student). NEVER "admin".
    // The request body's "role" field (if any) is completely ignored.
    const account = await db.account.create({
      data: {
        username: email,
        passwordHash: hashPassword(password),
        role: "guest", // ← HARDCODED. This endpoint can ONLY create student accounts.
        status: "unlocked", // students can log in immediately after signup
        expiresAt: null, // permanent — student accounts never expire
        passwordSetAt: null,
        fullName: fullNameRaw,
        note: "Self-registered student (email + password signup)",
      },
    });

    // ── Create a basic Student record (academic details filled later via registration form) ──
    await db.student.create({
      data: {
        firstName,
        lastName,
        email,
        mobile: mobileRaw,
        degree: "Not specified", // student completes this in the registration form
        branch: "Not specified",
        semester: "Not specified",
        plan: "Not selected",
        college: "Not specified",
        state: "Not specified",
        source: "self-signup",
        notes: "Self-registered via /api/auth/signup — academic details pending",
        category: "undecided",
        categoryLabel: "Undecided",
        project: "Not selected yet",
        projectId: null,
        consentWa: true,
        consentEm: true,
        emailSent: false,
        waSent: false,
        paymentStatus: "pending",
        internshipStatus: "not_started",
        currentStage: 0,
      },
    });

    // ── Set the session cookie so the student is logged in immediately ──
    const cookie = makeSessionCookie({
      username: account.username,
      role: "guest", // always "guest" from signup — never "admin"
      scope: "agileprojection-portal",
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        username: account.username,
        role: account.role,
        status: account.status,
        fullName: account.fullName,
        expiresAt: account.expiresAt,
        expired: isExpired(account.expiresAt),
      },
    });
    res.headers.append("Set-Cookie", cookie);
    return res;
  } catch (err) {
    // SECURITY: never log the password or email in error messages.
    console.error("[signup] error:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}
