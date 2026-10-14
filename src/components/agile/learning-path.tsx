"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, CheckCircle2, Lock, PlayCircle, Clock, ChevronDown, ChevronRight,
  Loader2, Award, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { safeJson } from "@/lib/utils";

type Lesson = {
  id: string; stage: number; title: string; desc: string; duration: number;
  completed: boolean; locked: boolean; completedAt: string | null;
};

type Module = {
  stage: number; week: string; title: string; icon: string; desc: string;
  deliverable: string; lessons: Lesson[]; completedCount: number;
  totalLessons: number; progress: number;
};

export function LearningPath() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/lessons", { cache: "no-store" });
      const data = await safeJson(res);
      if (data.ok) {
        setModules(data.modules);
        setOverallProgress(data.overallProgress);
        setTotalCompleted(data.totalCompleted);
        setTotalLessons(data.totalLessons);
        setNextLessonId(data.nextLesson?.id || null);
        // Auto-expand the module containing the next incomplete lesson
        if (data.nextLesson && expandedStage === null) {
          setExpandedStage(data.nextLesson.stage);
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [expandedStage]);

  useEffect(() => { load(); }, [load]);

  async function completeLesson(lessonId: string) {
    setCompleting(lessonId);
    try {
      const res = await fetch("/api/student/lesson/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const data = await safeJson(res);
      if (!res.ok || !data.ok) {
        toast({ title: "Cannot complete", description: data.error, variant: "destructive" });
        return;
      }
      toast({
        title: data.moduleComplete ? "🎉 Module complete!" : "✅ Lesson completed",
        description: data.moduleComplete ? `You've finished all lessons in this module.` : "Great progress! Keep going.",
      });
      await load(); // refresh to update progress + unlock next lesson
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setCompleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="size-4 animate-spin text-cyan-500 dark:text-cyan-400" /> Loading your learning path…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Overall progress header */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="size-9 rounded-lg bg-cyan-500/10 grid place-items-center text-cyan-500 dark:text-cyan-400">
              <TrendingUp className="size-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-foreground">Learning Path</h3>
              <p className="text-[11px] text-muted-foreground">{totalCompleted} of {totalLessons} lessons completed</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold ap-gradient-text">{overallProgress}%</div>
            <div className="text-[10px] text-muted-foreground">complete</div>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Resume button (if there's a next lesson) */}
      {nextLessonId && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PlayCircle className="size-5 text-cyan-500 dark:text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-cyan-500 dark:text-cyan-400 uppercase tracking-wider font-semibold">Resume</div>
              <div className="text-sm font-semibold text-foreground">
                {modules.flatMap(m => m.lessons).find(l => l.id === nextLessonId)?.title || "Next lesson"}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const stage = modules.flatMap(m => m.lessons).find(l => l.id === nextLessonId)?.stage;
              if (stage) setExpandedStage(stage);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 font-semibold hover:bg-cyan-500/25"
          >
            Continue
          </button>
        </div>
      )}

      {/* Modules (accordion) */}
      <div className="space-y-3">
        {modules.map((mod) => {
          const isExpanded = expandedStage === mod.stage;
          const moduleComplete = mod.progress === 100;
          const hasUnlockedLessons = mod.lessons.some(l => !l.locked);

          return (
            <div key={mod.stage} className={cn(
              "rounded-xl border overflow-hidden transition-colors",
              moduleComplete ? "border-emerald-500/30 bg-emerald-500/5" : isExpanded ? "border-cyan-500/30 bg-card" : "border-border bg-card"
            )}>
              {/* Module header (click to expand) */}
              <button
                type="button"
                onClick={() => setExpandedStage(isExpanded ? null : mod.stage)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "size-9 rounded-lg grid place-items-center text-lg shrink-0",
                    moduleComplete ? "bg-emerald-500/15" : "bg-cyan-500/10"
                  )}>
                    {moduleComplete ? <CheckCircle2 className="size-5 text-emerald-500 dark:text-emerald-400" /> : mod.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{mod.week}: {mod.title}</div>
                    <div className="text-[10px] text-muted-foreground">{mod.completedCount}/{mod.totalLessons} lessons · {mod.progress}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", moduleComplete ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 to-blue-600")} style={{ width: `${mod.progress}%` }} />
                  </div>
                  {isExpanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Lessons (expanded) */}
              {isExpanded && (
                <div className="border-t border-border divide-y divide-border/50">
                  {/* Module description */}
                  <div className="px-4 py-3 bg-muted/30">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.desc}</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1"><strong>Deliverable:</strong> {mod.deliverable}</p>
                  </div>

                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className={cn(
                      "flex items-start gap-3 p-3 transition-colors",
                      lesson.locked ? "opacity-50" : "hover:bg-secondary/30"
                    )}>
                      {/* Status icon */}
                      <div className="mt-0.5 shrink-0">
                        {lesson.completed ? (
                          <CheckCircle2 className="size-5 text-emerald-500 dark:text-emerald-400" />
                        ) : lesson.locked ? (
                          <Lock className="size-5 text-muted-foreground" />
                        ) : (
                          <div className="size-5 rounded-full border-2 border-cyan-500/40 grid place-items-center">
                            <PlayCircle className="size-3 text-cyan-500 dark:text-cyan-400" />
                          </div>
                        )}
                      </div>

                      {/* Lesson content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-semibold",
                            lesson.completed ? "text-emerald-600 dark:text-emerald-400" :
                            lesson.locked ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {lesson.title}
                          </span>
                          {lesson.completed && (
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(lesson.completedAt!).toLocaleDateString("en-IN", { dateStyle: "short" })}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{lesson.desc}</p>
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground">
                          <Clock className="size-3" /> {lesson.duration} min
                        </div>
                      </div>

                      {/* Complete button */}
                      {!lesson.locked && !lesson.completed && (
                        <Button
                          size="sm"
                          onClick={() => completeLesson(lesson.id)}
                          disabled={completing === lesson.id}
                          className="h-7 text-[10px] bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 shrink-0"
                        >
                          {completing === lesson.id ? <Loader2 className="size-3 animate-spin" /> : "Complete"}
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Module complete badge */}
                  {moduleComplete && (
                    <div className="px-4 py-2 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Award className="size-3" /> Module completed! Ready for the next module.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
