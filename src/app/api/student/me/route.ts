import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/student/me
// Returns the logged-in student's full record — user ID, email, mobile, and
// all project-tracking fields. Uses the session cookie to identify the student
// (no manual email+mobile lookup needed).
//
// This is what powers the auto-populated Project Tracker: when a logged-in
// student opens the tracker, it calls this endpoint and immediately shows
// their project status without any form entry.

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json(
        { ok: false, error: "Not logged in.", code: "NO_SESSION" },
        { status: 401 }
      );
    }

    const email = session.username.toLowerCase().trim();

    // Find the Account (user ID + linked info)
    const account = await db.account.findUnique({
      where: { username: email },
      select: {
        id: true,
        username: true,
        role: true,
        status: true,
        fullName: true,
        expiresAt: true,
      },
    });

    // Find the Student record by email (case-insensitive match)
    // SQLite doesn't support mode:"insensitive", so we fetch candidates and filter.
    const candidates = await db.student.findMany({
      where: { email: { contains: email.split("@")[0].slice(0, 3) } },
      take: 100,
    });
    let student = candidates.find((s) => s.email.toLowerCase() === email);
    if (!student) {
      // Fallback: scan a broader set
      const all = await db.student.findMany({ take: 500 });
      student = all.find((s) => s.email.toLowerCase() === email) || null;
    }

    if (!student) {
      // Logged in but no Student record → they signed up but haven't completed
      // the project registration form yet.
      return NextResponse.json({
        ok: false,
        error: "You haven't completed your project registration yet. Open the Student Dashboard → Register tab to choose your project.",
        code: "NO_REGISTRATION",
        account: account ? {
          id: account.id,
          username: account.username,
          fullName: account.fullName,
        } : null,
      }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
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
      account: account ? {
        id: account.id,
        username: account.username,
        role: account.role,
        status: account.status,
        fullName: account.fullName,
      } : null,
    });
  } catch (err) {
    console.error("[student/me] error:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: "Failed to load your profile." },
      { status: 500 }
    );
  }
}
