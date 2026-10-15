import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { LESSONS } from "@/lib/data";

export const runtime = "nodejs";

// POST /api/student/lesson/complete  { lessonId }
// Marks a lesson as completed for the student. Checks:
// 1. Student is logged in
// 2. The lesson exists
// 3. The prerequisite (previous lesson in the same module) is completed
// Idempotent — if already completed, returns success.

export async function POST(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }

    const studentEmail = session.username.toLowerCase().trim();
    const body = await req.json();
    const lessonId = String(body.lessonId || "").trim();

    if (!lessonId) {
      return NextResponse.json({ ok: false, error: "lessonId is required." }, { status: 400 });
    }

    // Find the lesson
    const lesson = LESSONS.find((l) => l.id === lessonId);
    if (!lesson) {
      return NextResponse.json({ ok: false, error: "Lesson not found." }, { status: 404 });
    }

    // Check prerequisite: the previous lesson in the same stage must be completed
    const stageLessons = LESSONS.filter((l) => l.stage === lesson.stage);
    const lessonIndex = stageLessons.findIndex((l) => l.id === lessonId);
    if (lessonIndex > 0) {
      const prevLessonId = stageLessons[lessonIndex - 1].id;
      const prevCompleted = await db.lessonProgress.findUnique({
        where: { studentEmail_lessonId: { studentEmail, lessonId: prevLessonId } },
      });
      if (!prevCompleted) {
        return NextResponse.json({
          ok: false,
          error: "Complete the previous lesson first.",
          code: "PREREQUISITE_NOT_MET",
          prerequisiteLessonId: prevLessonId,
        }, { status: 403 });
      }
    }

    // Mark as completed (idempotent via upsert)
    await db.lessonProgress.upsert({
      where: { studentEmail_lessonId: { studentEmail, lessonId } },
      create: { studentEmail, stage: lesson.stage, lessonId },
      update: {}, // already completed — no update needed
    });

    // Check if this completes the module
    const moduleLessons = LESSONS.filter((l) => l.stage === lesson.stage);
    const completedInModule = await db.lessonProgress.count({
      where: { studentEmail, stage: lesson.stage },
    });
    const moduleComplete = completedInModule >= moduleLessons.length;

    // Find the next lesson (for auto-resume)
    const nextLesson = LESSONS.find((l) => !l.id.startsWith(lesson.stage + "-")) ||
      LESSONS.find((l) => l.id === `${lesson.stage}-${lessonIndex + 2}`) || null;

    return NextResponse.json({
      ok: true,
      lessonId,
      completed: true,
      moduleComplete,
      moduleStage: lesson.stage,
      completedInModule,
      totalInModule: moduleLessons.length,
      nextLessonId: nextLesson?.id || null,
    });
  } catch (err) {
    console.error("[student/lesson/complete] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to mark lesson complete." }, { status: 500 });
  }
}
