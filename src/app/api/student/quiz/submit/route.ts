import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { QUIZ_QUESTIONS, QUIZ_PASS_THRESHOLD, PROJECT_STAGES, LESSONS } from "@/lib/data";

export const runtime = "nodejs";

// POST /api/student/quiz/submit  { stage, answers: [{questionId, selectedOption}] }
// Scores the quiz, saves the attempt, returns: score, passed, correct answers.
// The student can retake — all attempts are saved; the best score counts.

export async function POST(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }
    const studentEmail = session.username.toLowerCase().trim();

    const body = await req.json();
    const stage = Number(body.stage);
    const answers: { questionId: string; selectedOption: number }[] = body.answers || [];

    if (!stage || stage < 1 || stage > 6) {
      return NextResponse.json({ ok: false, error: "stage must be 1-6" }, { status: 400 });
    }

    // Score the answers
    const stageQuestions = QUIZ_QUESTIONS.filter((q) => q.stage === stage);
    const results = stageQuestions.map((q) => {
      const studentAnswer = answers.find((a) => a.questionId === q.id);
      const selected = studentAnswer?.selectedOption ?? -1;
      const correct = selected === q.correct;
      return { questionId: q.id, selected, correctOption: q.correct, correct };
    });

    const correctCount = results.filter((r) => r.correct).length;
    const totalQuestions = stageQuestions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= QUIZ_PASS_THRESHOLD;

    // Save the attempt
    await db.assessmentAttempt.create({
      data: {
        studentEmail,
        stage,
        score,
        passed,
        answers: JSON.stringify(results),
      },
    });

    return NextResponse.json({
      ok: true,
      score,
      passed,
      correctCount,
      totalQuestions,
      passThreshold: QUIZ_PASS_THRESHOLD,
      results: results.map((r) => ({
        questionId: r.questionId,
        selected: r.selected,
        correctOption: r.correctOption,
        correct: r.correct,
      })),
    });
  } catch (err) {
    console.error("[student/quiz/submit] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Quiz submission failed." }, { status: 500 });
  }
}
