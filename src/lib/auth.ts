// Server-side auth helpers for the AgileProjection portal login.
// - scrypt-based password hashing (built-in `crypto`, no extra deps)
// - HMAC-signed session cookie (no external sessions table needed)
// - auto-seed of admin + guest1..guest5 accounts

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

export type Role = "admin" | "guest";
export type SessionPayload = {
  username: string;
  role: Role;
  // discriminator so the cookie is only valid for this feature
  scope: "agileprojection-portal";
};

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "agileprojection-portal-dev-secret-change-in-production";
const COOKIE_NAME = "ap_session";
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

// ── Password hashing ──
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const testBuf = scryptSync(password, salt, 64);
  if (hashBuf.length !== testBuf.length) return false;
  return timingSafeEqual(hashBuf, testBuf);
}

// ── Session cookie (HMAC-signed JSON) ──
function sign(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = hmac(body);
  return `${body}.${sig}`;
}

function hmac(data: string): string {
  return createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
}

export function makeSessionCookie(payload: SessionPayload): string {
  const token = sign(payload);
  // 30 days so "remember me" is comfortable; admin actions re-check DB status.
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSession(cookieHeader: string | null): SessionPayload | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(/;\s*/)
    .map((c) => c.split("="))
    .find(([k]) => k === COOKIE_NAME);
  if (!match || !match[1]) return null;
  const token = match[1];
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (hmac(body) !== sig) return null; // tampered
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (payload.scope !== "agileprojection-portal") return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Account helpers ──
export function isExpired(expiresAt: Date | null): boolean {
  // null = no expiry set → never expires (used for registered students + admin).
  // The 2-day expiry only applies to demo accounts the admin explicitly unlocks.
  if (!expiresAt) return false;
  return Date.now() > expiresAt.getTime();
}

export function msToExpiry(expiresAt: Date | null): number {
  if (!expiresAt) return -1;
  return expiresAt.getTime() - Date.now();
}

export function expiryAfterUnlock(): Date {
  return new Date(Date.now() + TWO_DAYS_MS);
}

// ── Auto-seed ──
// Ensures the demo accounts exist: admin + guest1..guest5 + student demo. Idempotent.
// Called lazily by API routes so the portal works on a fresh DB.
type SeedSpec = {
  username: string;
  password: string;
  role: Role;
  fullName: string;
  status?: "locked" | "unlocked"; // override; default "locked" for guests
  permanent?: boolean; // if true → expiresAt = null (never expires)
};

const SEED_ACCOUNTS: SeedSpec[] = [
  { username: "admin", password: "admin123", role: "admin", fullName: "AgileProjection Admin" },
  // Demo guest accounts — unlocked + 2-day expiry so the credential buttons work immediately
  // and the expiry countdown is demonstrable. Admin can re-unlock to reset the 2-day window.
  { username: "guest1", password: "guest1", role: "guest", fullName: "Guest User 1", status: "unlocked" },
  { username: "guest2", password: "guest2", role: "guest", fullName: "Guest User 2", status: "unlocked" },
  { username: "guest3", password: "guest3", role: "guest", fullName: "Guest User 3", status: "unlocked" },
  { username: "guest4", password: "guest4", role: "guest", fullName: "Guest User 4", status: "unlocked" },
  { username: "guest5", password: "guest5", role: "guest", fullName: "Guest User 5", status: "unlocked" },
  // Permanent demo student — matches the "student demo" button on the login page.
  { username: "student@agileprojection.com", password: "1234567890", role: "guest", fullName: "Demo Student", status: "unlocked", permanent: true },
];

let seedPromise: Promise<void> | null = null;

export async function ensureAccountsSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const existing = await db.account.count();
      if (existing >= SEED_ACCOUNTS.length) return;
      for (const s of SEED_ACCOUNTS) {
        const found = await db.account.findUnique({ where: { username: s.username } });
        if (found) continue;
        if (s.role === "admin") {
          await db.account.create({
            data: {
              username: s.username,
              passwordHash: hashPassword(s.password),
              role: "admin",
              status: "unlocked", // admin is always active
              fullName: s.fullName,
              note: "Built-in administrator (never expires)",
            },
          });
        } else {
          const isPermanent = s.permanent === true;
          const guestStatus = s.status === "unlocked" ? "unlocked" : "locked";
          await db.account.create({
            data: {
              username: s.username,
              passwordHash: hashPassword(s.password),
              role: "guest",
              status: guestStatus,
              // permanent demo accounts never expire; unlocked demo accounts get the 2-day window
              expiresAt: isPermanent ? null : (guestStatus === "unlocked" ? expiryAfterUnlock() : null),
              passwordSetAt: isPermanent ? null : (guestStatus === "unlocked" ? new Date() : null),
              fullName: s.fullName,
              note: isPermanent
                ? "Permanent demo student (auto-seeded, never expires)"
                : (guestStatus === "unlocked"
                    ? "Demo account — auto-unlocked (2-day window). Admin can re-unlock to reset."
                    : "Awaiting payment — contact admin to unlock"),
            },
          });
        }
      }
    } catch (e) {
      // reset so a later request can retry
      seedPromise = null;
      console.error("[auth] seed failed:", (e as Error).message);
    }
  })();
  return seedPromise;
}

export { COOKIE_NAME };
