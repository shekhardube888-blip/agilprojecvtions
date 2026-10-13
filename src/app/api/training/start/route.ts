import { NextResponse } from "next/server";
import { PROJECT_STAGES } from "@/lib/data";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic"; // prevents Next.js fetch interception that hangs the SDK
export const fetchCache = "force-no-store";

type ChatMsg = { role: "user" | "assistant"; content: string };

// Helper: call the ZAI LLM with a timeout so it can't hang forever.
async function callZAILLM(messages: ChatMsg[], timeoutMs = 45000): Promise<string> {
  // Use Promise.race to enforce a timeout — if the SDK hangs (a known issue
  // in some Next.js contexts), we reject + the caller falls back gracefully.
  const llmPromise = (async () => {
    const ZAIModule = await import("z-ai-web-dev-sdk");
    const ZAI = (ZAIModule as unknown as { default: { create: () => Promise<unknown> }; create: () => Promise<unknown> }).default ?? (ZAIModule as unknown as { create: () => Promise<unknown> });
    const zai = await ZAI.create();
    const completion = await (zai as {
      chat: {
        completions: {
          create: (args: { messages: ChatMsg[]; thinking: { type: string } }) => Promise<{
            choices: { message?: { content?: string } }[];
          }>;
        };
      };
    }).chat.completions.create({ messages, thinking: { type: "disabled" } });
    return completion.choices?.[0]?.message?.content?.trim() || "";
  })();

  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error("LLM call timed out")), timeoutMs)
  );

  return Promise.race([llmPromise, timeoutPromise]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stageNum = Number(body.stage);
    const project = String(body.project || "your selected project");
    const categoryLabel = String(body.categoryLabel || "your chosen domain");
    if (!stageNum || stageNum < 1 || stageNum > 6)
      return NextResponse.json({ ok: false, error: "stage must be 1-6" }, { status: 400 });
    const stage = PROJECT_STAGES[stageNum - 1];
    if (!stage) return NextResponse.json({ ok: false, error: "unknown stage" }, { status: 400 });

    const systemPrompt = `You are "AP-Mentor", an AgileProjection instructor. The student is building: "${project}" in the "${categoryLabel}" domain. Generate a Markdown training module for ${stage.week} — Stage ${stage.step}: "${stage.title}". Focus: ${stage.desc} Deliverable: ${stage.deliverable}. Structure with H2 sections: 🎯 Learning Objectives (3-5 bullets), 📝 Step-by-Step Guide (numbered + ONE code block ~15-25 lines), 🔗 Resources (3-4 topics), 🛠️ Hands-on Exercise (tied to their project), ✅ Completion Checklist (4-6 items). Tailor to "${project}" + "${categoryLabel}". ~400 words.`;
    const messages: ChatMsg[] = [
      { role: "assistant", content: systemPrompt },
      { role: "user", content: `Generate the ${stage.week} training module now.` },
    ];

    let reply = "";
    let aiError = "";
    try {
      reply = await callZAILLM(messages, 45000);
    } catch (e) {
      aiError = (e as Error).message;
      console.error("[training] LLM failed:", aiError);
    }

    if (!reply) {
      // Provide a helpful, actionable fallback — the student can still proceed
      // with the stage even if the AI service is down.
      reply = `## ${stage.title} — ${stage.week}

### ⚠️ AI Mentor unavailable right now

The AI training generator couldn't be reached. This happens when:
- The AI service (z-ai-web-dev-sdk) isn't configured on this machine — it works on the deployed version but may not work in local dev.
- The request timed out (the AI is busy).

### 📋 What to do for **${stage.title}**

${stage.desc}

**Deliverable:** ${stage.deliverable}

### 🛠️ Step-by-step (manual guide)

1. **Set up your environment** — Python 3.10+, a Jupyter notebook, and the libraries for your project domain.
2. **Follow the stage description above** — it tells you exactly what to do for this week.
3. **Use the AP-AI Mentor tab** for specific questions — type "help me with ${stage.title}" and the mentor will guide you.
4. **Email hr@agileprojection.com** if you're stuck — our team replies within 24 hours.

### ✅ Completion checklist

- [ ] I understand what "${stage.title}" means for my project
- [ ] I've started the work described above
- [ ] I've asked the AI Mentor or emailed the team if I'm stuck

> 💡 The AI training generator works on the **deployed portal** (the live version). In local development, the AI service may not be configured.`;
    }

    return NextResponse.json({ ok: true, stage: stageNum, week: stage.week, title: stage.title, content: reply, aiAvailable: !aiError });
  } catch (err) {
    console.error("[training] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
