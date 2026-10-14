import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth";
import { PROJECT_STAGES } from "@/lib/data";

export const runtime = "nodejs";

// GET /api/student/dashboard
// Returns the student's personalized dashboard data:
// - Student profile (name, email, project, domain, college)
// - Internship status + completion percentage
// - Training modules generated (X/6)
// - Pending stages (which weeks still need to be started)
// - Next recommended action
// - Certificate eligibility
// - Payment status

export async function GET(req: Request) {
  try {
    const session = readSession(req.headers.get("cookie"));
    if (!session?.username) {
      return NextResponse.json({ ok: false, error: "Not logged in.", code: "NO_SESSION" }, { status: 401 });
    }

    const email = session.username.toLowerCase().trim();

    // Find the student record
    const candidates = await db.student.findMany({
      where: { email: { contains: email.split("@")[0].slice(0, 3) } },
      take: 100,
    });
    let student = candidates.find((s) => s.email.toLowerCase() === email);
    if (!student) {
      const all = await db.student.findMany({ take: 500 });
      student = all.find((s) => s.email.toLowerCase() === email) || null;
    }

    if (!student) {
      return NextResponse.json({
        ok: false,
        error: "No registration found.",
        code: "NO_REGISTRATION",
      }, { status: 404 });
    }

    // Count cached training modules for this student
    const trainingModulesCount = await db.trainingModule.count({
      where: { studentEmail: email },
    });

    // Compute completion percentage
    const totalStages = PROJECT_STAGES.length; // 6
    const completedStages = Math.min(student.currentStage, totalStages);
    const completionPercent = Math.round((completedStages / totalStages) * 100);

    // Determine pending stages (which weeks haven't been generated yet)
    const generatedStages = await db.trainingModule.findMany({
      where: { studentEmail: email },
      select: { stage: true },
    });
    const generatedStageNums = new Set(generatedStages.map((m) => m.stage));
    const pendingStages = PROJECT_STAGES.filter((_, i) => !generatedStageNums.has(i + 1)).map((s) => ({
      stage: s.step,
      week: s.week,
      title: s.title,
    }));

    // Determine next recommended action
    let nextAction: { title: string; description: string; action: string } = {
      title: "Complete your registration",
      description: "Choose a project + domain to start your internship",
      action: "register",
    };

    if (student.paymentStatus === "pending") {
      nextAction = {
        title: "Awaiting payment confirmation",
        description: "The admin will confirm your payment + start your internship. Check back soon.",
        action: "track",
      };
    } else if (student.internshipStatus === "not_started" && student.paymentStatus === "confirmed") {
      nextAction = {
        title: `Start Week 1: ${PROJECT_STAGES[0].title}`,
        description: "Your internship is ready to begin. Open the Project Tracker and click 'Start Week 1 Training'.",
        action: "track",
      };
    } else if (student.internshipStatus === "in_progress") {
      const currentStageInfo = PROJECT_STAGES[student.currentStage - 1] || PROJECT_STAGES[0];
      nextAction = {
        title: `Continue: ${currentStageInfo.week} — ${currentStageInfo.title}`,
        description: `You're on stage ${student.currentStage} of ${totalStages}. ${completedStages < totalStages ? "Complete the current stage to advance." : "Finish the final stage!"}`,
        action: "track",
      };
    } else if (student.internshipStatus === "completed") {
      nextAction = {
        title: "Certificate ready!",
        description: "Your internship is complete. Generate your verified certificate from the admin dashboard.",
        action: "track",
      };
    }

    // Certificate eligibility
    const certificateEligible = student.internshipStatus === "completed";
    const existingCert = await db.certificate.findFirst({
      where: { studentId: student.id },
      select: { certificateNumber: true, issuedAt: true },
    });

    return NextResponse.json({
      ok: true,
      dashboard: {
        student: {
          name: `${student.firstName} ${student.lastName}`.trim(),
          email: student.email,
          degree: student.degree,
          branch: student.branch,
          college: student.college,
          subject: (student as any).subject || "",
          project: student.project,
          categoryLabel: student.categoryLabel,
        },
        internship: {
          status: student.internshipStatus,
          paymentStatus: student.paymentStatus,
          currentStage: student.currentStage,
          totalStages,
          completionPercent,
          startedAt: student.startedAt,
          completedAt: student.completedAt,
        },
        training: {
          modulesGenerated: trainingModulesCount,
          totalModules: totalStages,
          pendingStages,
        },
        nextAction,
        certificate: {
          eligible: certificateEligible,
          issued: !!existingCert,
          number: existingCert?.certificateNumber || null,
        },
      },
    });
  } catch (err) {
    console.error("[student/dashboard] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: "Failed to load dashboard." }, { status: 500 });
  }
}
