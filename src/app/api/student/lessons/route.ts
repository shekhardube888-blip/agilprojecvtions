import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { LESSONS, PROJECT_STAGES } from "@/lib/data";

export const runtime = "nodejs";

// GET /api/student/lessons
// Returns all 21 structured lessons (across 6 modules) + the student's
// progress (which lessons are completed). The client uses this to render
// the learning path with auto-resume + prerequisite-based unlocking.

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }

    const studentEmail = session.username.toLowerCase().trim();

    // Fetch all completed lesson IDs for this student
    const completed = await db.lessonProgress.findMany({
      where: { studentEmail },
      select: { lessonId: true, completedAt: true },
    });
    const completedIds = new Set(completed.map((c) => c.lessonId));

    // Group lessons by stage → module
    const modules = PROJECT_STAGES.map((stage) => {
      const lessons = LESSONS.filter((l) => l.stage === stage.step).map((l, idx, arr) => {
        const isCompleted = completedIds.has(l.id);
        // Prerequisite: the PREVIOUS lesson in the same module must be completed
        // (or this is the first lesson + the module is unlocked)
        const prevLesson = idx > 0 ? arr[idx - 1] : null;
        const prerequisiteMet = !prevLesson || completedIds.has(prevLesson.id);
        return {
          ...l,
          completed: isCompleted,
          locked: !prerequisiteMet,
          completedAt: completed.find((c) => c.lessonId === l.id)?.completedAt || null,
        };
      });
      const completedCount = lessons.filter((l) => l.completed).length;
      return {
        stage: stage.step,
        week: stage.week,
        title: stage.title,
        icon: stage.icon,
        desc: stage.desc,
        deliverable: stage.deliverable,
        lessons,
        completedCount,
        totalLessons: lessons.length,
        progress: Math.round((completedCount / lessons.length) * 100),
      };
    });

    // Find the next incomplete lesson (for auto-resume)
    const nextLesson = LESSONS.find((l) => !completedIds.has(l.id)) || null;

    // Overall progress
    const totalCompleted = completedIds.size;
    const totalLessons = LESSONS.length;

    return NextResponse.json({
      ok: true,
      modules,
      nextLesson,
      overallProgress: Math.round((totalCompleted / totalLessons) * 100),
      totalCompleted,
      totalLessons,
    });
  } catch (err) {
    console.error("[student/lessons] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load lessons." }, { status: 500 });
  }
}
