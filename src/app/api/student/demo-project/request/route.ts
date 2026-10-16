import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/student/demo-project/request
// Body: { subject, requirements }
// Student submits a request for a custom demo project based on their subject
// + current requirements. The mentor will review + provide a project description.

export async function POST(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }
    const studentEmail = session.username.toLowerCase().trim();
    const body = await req.json();
    const subject = String(body.subject || "").trim();
    const requirements = String(body.requirements || "").trim();

    if (!subject) return NextResponse.json({ ok: false, error: "Subject is required." }, { status: 400 });
    if (!requirements) return NextResponse.json({ ok: false, error: "Please describe your requirements." }, { status: 400 });
    if (requirements.length > 2000) return NextResponse.json({ ok: false, error: "Requirements too long (max 2000 chars)." }, { status: 400 });

    // Get student name + current project
    const students = await db.student.findMany({ where: { email: { contains: studentEmail.split("@")[0].slice(0, 3) } }, take: 50 });
    const student = students.find((s) => s.email.toLowerCase() === studentEmail);

    // Check if they already have a pending request
    const existing = await db.demoProjectRequest.findFirst({
      where: { studentEmail, status: "pending" },
    });
    if (existing) {
      return NextResponse.json({ ok: false, error: "You already have a pending demo project request. The mentor will review it soon.", code: "PENDING_EXISTS" }, { status: 409 });
    }

    const request = await db.demoProjectRequest.create({
      data: {
        studentEmail,
        studentName: student ? `${student.firstName} ${student.lastName}`.trim() : studentEmail,
        subject,
        project: student?.project || null,
        requirements,
      },
    });

    return NextResponse.json({
      ok: true,
      request: { id: request.id, status: request.status, requestedAt: request.requestedAt },
    });
  } catch (err) {
    console.error("[demo-project/request] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Request failed." }, { status: 500 });
  }
}

// GET /api/student/demo-project/request
// Returns the student's demo project requests + their status + mentor replies.

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }
    const studentEmail = session.username.toLowerCase().trim();

    const requests = await db.demoProjectRequest.findMany({
      where: { studentEmail },
      orderBy: { requestedAt: "desc" },
      take: 20,
      select: {
        id: true, subject: true, project: true, requirements: true,
        status: true, mentorReply: true, requestedAt: true, reviewedAt: true, emailedAt: true,
      },
    });

    return NextResponse.json({ ok: true, requests });
  } catch (err) {
    console.error("[demo-project/request] GET error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load requests." }, { status: 500 });
  }
}
