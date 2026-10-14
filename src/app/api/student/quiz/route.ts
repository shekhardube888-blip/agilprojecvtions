import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { QUIZ_QUESTIONS, QUIZ_PASS_THRESHOLD } from "@/lib/data";

export const runtime = "nodejs";

// GET /api/student/quiz?stage=1
// Returns the MCQ questions for a module + the student's best score so far.
// The correct answers are NOT sent — the client submits answers + the server scores.

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }
    const studentEmail = session.username.toLowerCase().trim();
    const url = new URL(req.url);
    const stage = Number(url.searchParams.get("stage"));

    if (!stage || stage < 1 || stage > 6) {
      return NextResponse.json({ ok: false, error: "stage must be 1-6" }, { status: 400 });
    }

    // Get questions for this stage (without the correct answer)
    const questions = QUIZ_QUESTIONS
      .filter((q) => q.stage === stage)
      .map((q) => ({ id: q.id, question: q.question, options: q.options }));

    // Get the student's best attempt for this stage
    const attempts = await db.assessmentAttempt.findMany({
      where: { studentEmail, stage },
      orderBy: { score: "desc" },
      take: 1,
      select: { score: true, passed: true, attemptedAt: true },
    });
    const bestAttempt = attempts[0] || null;
    const attemptCount = await db.assessmentAttempt.count({ where: { studentEmail, stage } });

    return NextResponse.json({
      ok: true,
      questions,
      passThreshold: QUIZ_PASS_THRESHOLD,
      bestScore: bestAttempt?.score || null,
      passed: bestAttempt?.passed || false,
      attemptCount,
    });
  } catch (err) {
    console.error("[student/quiz] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load quiz." }, { status: 500 });
  }
}
