import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ensureAccountsSeeded,
  expiryAfterUnlock,
  hashPassword,
  isExpired,
  readSession,
} from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/admin/user/manage
// Admin-only. Performs a user-management action on a student account:
//   action: "reset-password" | "lock" | "unlock" | "set-expiry" | "renew"
//
// Body:
//   { accountId, action, reason, newPassword?, expiryDate?, expiryDays? }
//
// Each action is logged to the UnlockLog audit trail with the admin's username,
// the action type, the reason, and the resulting expiry (if any).
//
// SECURITY:
// - Admin-only (session.role === "admin").
// - The new password (for reset-password) is hashed via scrypt before storage;
//   it is NEVER logged, NEVER returned in the response, NEVER shown in the UI.
// - The reason field is saved to the audit log so there's a full history of
//   why each action was taken (e.g. "Student reported login issue").

type Action = "reset-password" | "lock" | "unlock" | "set-expiry" | "renew";

const VALID_ACTIONS: Action[] = ["reset-password", "lock", "unlock", "set-expiry", "renew"];

export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const accountId = String(body.accountId || "").trim();
    const action = String(body.action || "").trim() as Action;
    const reason = body.reason ? String(body.reason).trim() : null;
    const newPassword = body.newPassword ? String(body.newPassword) : null;
    const expiryDate = body.expiryDate ? String(body.expiryDate) : null; // ISO string
    const expiryDays = body.expiryDays != null ? Number(body.expiryDays) : null;

    if (!accountId) {
      return NextResponse.json({ ok: false, error: "accountId is required." }, { status: 400 });
    }
    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ ok: false, error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}` }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ ok: false, error: "A reason is required for audit logging." }, { status: 400 });
    }

    const account = await db.account.findUnique({ where: { id: accountId } });
    if (!account) {
      return NextResponse.json({ ok: false, error: "Account not found." }, { status: 404 });
    }
    if (account.role === "admin") {
      return NextResponse.json({ ok: false, error: "Admin accounts cannot be managed here." }, { status: 400 });
    }

    let updateData: any = {};
    let logExpiry: Date | null = null;

    switch (action) {
      case "reset-password": {
        if (!newPassword) {
          return NextResponse.json({ ok: false, error: "newPassword is required for reset-password." }, { status: 400 });
        }
        if (newPassword.length < 8) {
          return NextResponse.json({ ok: false, error: "New password must be at least 8 characters." }, { status: 400 });
        }
        // SECURITY: hash the new password — never store or log the plaintext.
        updateData.passwordHash = hashPassword(newPassword);
        updateData.passwordSetAt = new Date();
        // When the admin resets the password, ALSO unlock the account + reset
        // the expiry. The admin expects "reset password" to mean "the student
        // can now log in" — keeping a locked/expired status would make the new
        // password useless.
        // If the account was permanent (expiresAt === null, e.g. Google student
        // or registered student), keep it permanent. Otherwise, give a fresh
        // 2-day window.
        updateData.status = "unlocked";
        if (account.expiresAt === null) {
          // Permanent account → stays permanent
          logExpiry = null;
          updateData.expiresAt = null;
        } else {
          // Was a finite-expiry account (2-day demo) → give a fresh 2-day window
          const freshExpiry = expiryAfterUnlock();
          logExpiry = freshExpiry;
          updateData.expiresAt = freshExpiry;
        }
        break;
      }

      case "lock": {
        updateData.status = "locked";
        updateData.expiresAt = null; // locked accounts have no active expiry
        updateData.passwordSetAt = null;
        logExpiry = null;
        break;
      }

      case "unlock": {
        // Default to 2-day expiry, OR a custom expiry if provided
        let newExpiry: Date;
        if (expiryDate) {
          newExpiry = new Date(expiryDate);
          if (isNaN(newExpiry.getTime())) {
            return NextResponse.json({ ok: false, error: "Invalid expiryDate. Use ISO format." }, { status: 400 });
          }
        } else if (expiryDays != null && !isNaN(expiryDays)) {
          newExpiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        } else {
          newExpiry = expiryAfterUnlock(); // default 2 days
        }
        updateData.status = "unlocked";
        updateData.expiresAt = newExpiry;
        updateData.passwordSetAt = new Date();
        logExpiry = newExpiry;
        break;
      }

      case "set-expiry": {
        // Set a custom expiry without changing the lock status
        if (expiryDate) {
          const newExpiry = new Date(expiryDate);
          if (isNaN(newExpiry.getTime())) {
            return NextResponse.json({ ok: false, error: "Invalid expiryDate. Use ISO format." }, { status: 400 });
          }
          updateData.expiresAt = newExpiry;
          logExpiry = newExpiry;
        } else if (expiryDays != null && !isNaN(expiryDays)) {
          // expiryDays=0 or negative → permanent (null)
          if (expiryDays <= 0) {
            updateData.expiresAt = null;
            logExpiry = null;
          } else {
            const newExpiry = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
            updateData.expiresAt = newExpiry;
            logExpiry = newExpiry;
          }
        } else {
          return NextResponse.json({ ok: false, error: "expiryDate or expiryDays is required for set-expiry." }, { status: 400 });
        }
        // If setting to null (permanent), ensure the account is unlocked
        if (updateData.expiresAt === null) {
          updateData.status = "unlocked";
          updateData.passwordSetAt = null;
        }
        break;
      }

      case "renew": {
        // Renew = unlock + reset the 2-day window (alias for unlock with default expiry)
        const newExpiry = expiryAfterUnlock();
        updateData.status = "unlocked";
        updateData.expiresAt = newExpiry;
        updateData.passwordSetAt = new Date();
        logExpiry = newExpiry;
        break;
      }
    }

    updateData.note = `[${action}] ${reason}`;

    const updated = await db.account.update({
      where: { id: account.id },
      data: updateData,
    });

    // Log the action to the audit trail
    await db.unlockLog.create({
      data: {
        accountId: account.id,
        adminUser: session.username,
        action,
        reason,
        expiresAt: logExpiry,
      },
    });

    return NextResponse.json({
      ok: true,
      account: {
        id: updated.id,
        username: updated.username,
        role: updated.role,
        status: updated.status,
        fullName: updated.fullName,
        expiresAt: updated.expiresAt,
        note: updated.note,
        expired: isExpired(updated.expiresAt),
      },
    });
  } catch (err) {
    console.error("[admin/user/manage] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Action failed." }, { status: 500 });
  }
}
