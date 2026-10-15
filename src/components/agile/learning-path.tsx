"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, CheckCircle2, Lock, PlayCircle, Clock, ChevronDown, ChevronRight,
  Loader2, Award, TrendingUp, FileText, Send, CheckCircle, XCircle, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn, safeJson } from "@/lib/utils";

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

                  {/* Assignment / Deliverable section — student submits their work here */}
                  <AssignmentSection stage={mod.stage} deliverable={mod.deliverable} />

                  {/* Quiz section — student takes the module quiz */}
                  <QuizSection stage={mod.stage} week={mod.week} />

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

// ── Assignment Section — student submits their module deliverable ──
function AssignmentSection({ stage, deliverable }: { stage: number; deliverable: string }) {
  const [assignment, setAssignment] = useState<{ submission: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/student/assignments", { cache: "no-store" });
      const data = await safeJson(res);
      if (data.ok) {
        const a = data.assignments.find((x: any) => x.stage === stage);
        setAssignment(a || null);
        if (a?.submission?.content) setContent(a.submission.content);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [stage]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (!content.trim()) { toast({ title: "Empty submission", description: "Paste your work or a GitHub link.", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/assignment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, content: content.trim() }),
      });
      const data = await safeJson(res);
      if (!res.ok || !data.ok) throw new Error(data.error);
      toast({ title: "Submitted!", description: "Your mentor will review this assignment. Check back for feedback." });
      await load();
    } catch (e) {
      toast({ title: "Submission failed", description: (e as Error).message, variant: "destructive" });
    } finally { setSubmitting(false); }
  }

  if (loading) return null;
  const sub = assignment?.submission;
  const status = sub?.status;

  return (
    <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="size-4 text-amber-500 dark:text-amber-400" />
        <span className="text-[11px] font-semibold text-foreground">Module Assignment</span>
        {status && (
          <span className={cn(
            "text-[9px] px-2 py-0.5 rounded-full font-semibold ml-auto",
            status === "approved" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
            status === "rejected" ? "bg-rose-500/15 text-rose-500 dark:text-rose-400" :
            "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          )}>
            {status === "approved" ? "✓ Approved" : status === "rejected" ? "✗ Needs revision" : "⏳ Pending review"}
          </span>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">
        <strong className="text-foreground">Deliverable:</strong> {deliverable}
      </p>

      {/* Mentor feedback (if reviewed) */}
      {sub?.mentorFeedback && (
        <div className="mb-2 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-[10px]">
          <div className="flex items-center gap-1 text-cyan-500 dark:text-cyan-400 font-semibold mb-0.5">
            <MessageSquare className="size-3" /> Mentor Feedback
          </div>
          <p className="text-foreground">{sub.mentorFeedback}</p>
        </div>
      )}

      {/* Submission textarea */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your work here — code, a GitHub repo link, notes, or a summary of what you did for this module's deliverable…"
        className="bg-background border-border min-h-[80px] text-xs mb-2"
        disabled={submitting}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] text-muted-foreground">{content.length} chars</span>
        <Button
          size="sm"
          onClick={submit}
          disabled={submitting || !content.trim()}
          className="h-7 text-[10px] bg-gradient-to-r from-amber-500 to-cyan-500 text-white hover:opacity-90"
        >
          {submitting ? <Loader2 className="size-3 animate-spin mr-1" /> : <Send className="size-3 mr-1" />}
          {sub ? "Re-submit" : "Submit Assignment"}
        </Button>
      </div>

      {status === "approved" && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="size-3" /> Approved by your mentor. This module's assignment is complete!
        </div>
      )}
    </div>
  );
}

// ── Quiz Section — student takes the module MCQ quiz ──
function QuizSection({ stage, week }: { stage: number; week: string }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/quiz?stage=${stage}`, { cache: "no-store" });
      const data = await safeJson(res);
      if (data.ok) setQuiz(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [stage]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    const unanswered = quiz?.questions?.filter((q: any) => answers[q.id] === undefined);
    if (unanswered?.length > 0) { toast({ title: "Answer all questions", description: `${unanswered.length} question(s) unanswered.`, variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, answers: Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption })) }),
      });
      const data = await safeJson(res);
      if (!res.ok || !data.ok) throw new Error(data.error);
      setResult(data);
      toast({ title: data.passed ? "🎉 Quiz passed!" : "Quiz not passed", description: `Score: ${data.score}% (${data.correctCount}/${data.totalQuestions})`, variant: data.passed ? "default" : "destructive" });
      await load(); // refresh best score
    } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  }

  if (loading || !quiz) return null;

  return (
    <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="size-4 text-violet-500 dark:text-violet-400" />
        <span className="text-[11px] font-semibold text-foreground">Module Quiz</span>
        {quiz.passed && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold ml-auto">✓ Passed ({quiz.bestScore}%)</span>}
        {quiz.attemptCount > 0 && !quiz.passed && <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold ml-auto">Best: {quiz.bestScore}% · Retake</span>}
      </div>

      {result && (
        <div className={cn("mb-3 p-2 rounded-lg text-[10px]", result.passed ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20")}>
          <span className="font-semibold">Score: {result.score}%</span> ({result.correctCount}/{result.totalQuestions})
          {result.passed ? " — Passed!" : ` — Need ${result.passThreshold}% to pass. Retake to improve.`}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3 mb-3">
        {quiz.questions?.map((q: any, qi: number) => {
          const userAns = answers[q.id];
          const r = result?.results?.find((x: any) => x.questionId === q.id);
          return (
            <div key={q.id} className="text-[11px]">
              <div className="font-medium text-foreground mb-1">{qi + 1}. {q.question}</div>
              <div className="space-y-1">
                {q.options.map((opt: string, oi: number) => {
                  const selected = userAns === oi;
                  const isCorrect = r && oi === r.correctOption;
                  const isWrongSelected = r && selected && !r.correct;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => !result && setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      disabled={!!result}
                      className={cn(
                        "block w-full text-left px-2.5 py-1.5 rounded-lg border text-[10px] transition-colors",
                        result
                          ? isCorrect ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : isWrongSelected ? "bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400"
                            : "bg-muted border-border text-muted-foreground"
                          : selected ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-500 dark:text-cyan-400"
                            : "bg-muted/50 border-border text-foreground hover:border-cyan-500/20"
                      )}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                      {result && isCorrect && " ✓"}
                      {result && isWrongSelected && " ✗"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!result ? (
        <Button size="sm" onClick={submit} disabled={submitting} className="h-7 text-[10px] bg-gradient-to-r from-violet-500 to-cyan-500 text-white">
          {submitting ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
          Submit Quiz
        </Button>
      ) : (
        <button
          onClick={() => { setResult(null); setAnswers({}); }}
          className="text-[10px] px-3 py-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 font-semibold"
        >
          Retake Quiz
        </button>
      )}
    </div>
  );
}
