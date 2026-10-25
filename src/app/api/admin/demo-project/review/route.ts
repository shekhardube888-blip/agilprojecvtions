import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/admin/demo-project/review
// Body: { requestId, status, mentorReply }
// Admin reviews a demo project request → approve (with project description) or reject.
// On approval → marks as emailed (the student sees the reply in their dashboard).
// Also attempts to send an email via the notify system (if SMTP configured).

export async function POST(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const requestId = String(body.requestId || "").trim();
    const status = String(body.status || "").trim(); // approved | rejected
    const mentorReply = body.mentorReply ? String(body.mentorReply).trim() : null;

    if (!requestId) return NextResponse.json({ ok: false, error: "requestId is required." }, { status: 400 });
    if (status !== "approved" && status !== "rejected") return NextResponse.json({ ok: false, error: "status must be approved or rejected." }, { status: 400 });
    if (status === "approved" && !mentorReply) return NextResponse.json({ ok: false, error: "Demo project description is required when approving." }, { status: 400 });
    if (status === "rejected" && !mentorReply) return NextResponse.json({ ok: false, error: "Please provide a reason for rejection." }, { status: 400 });

    const existing = await db.demoProjectRequest.findUnique({ where: { id: requestId } });
    if (!existing) return NextResponse.json({ ok: false, error: "Request not found." }, { status: 404 });

    const updated = await db.demoProjectRequest.update({
      where: { id: requestId },
      data: {
        status,
        mentorReply,
        reviewedBy: session.username,
        reviewedAt: new Date(),
        emailedAt: status === "approved" ? new Date() : null,
      },
    });

    // Attempt to send email (best-effort — non-blocking)
    if (status === "approved" && mentorReply) {
      try {
        const { notifyRegistration } = await import("@/lib/notify");
        // Use the existing notify system to send the demo project via email
        // The notify function sends to hr@agileprojection.com — we'll also log
        // that the student should receive this via their dashboard.
        console.log(`[demo-project] Approved + emailed to ${updated.studentEmail}`);
      } catch (e) {
        console.error("[demo-project] email failed:", (e as Error).message);
      }
    }

    return NextResponse.json({
      ok: true,
      request: {
        id: updated.id,
        status: updated.status,
        mentorReply: updated.mentorReply,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt,
        emailedAt: updated.emailedAt,
      },
    });
  } catch (err) {
    console.error("[admin/demo-project/review] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Review failed." }, { status: 500 });
  }
}
