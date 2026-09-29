import { NextResponse } from "next/server";
import { PROJECT_STAGES } from "@/lib/data";
export const runtime = "nodejs";
export const maxDuration = 60;
type ChatMsg = { role: "user" | "assistant"; content: string };
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stageNum = Number(body.stage);
    const project = String(body.project || "your selected project");
    const categoryLabel = String(body.categoryLabel || "your chosen domain");
    if (!stageNum || stageNum < 1 || stageNum > 6) return NextResponse.json({ ok: false, error: "stage must be 1-6" }, { status: 400 });
    const stage = PROJECT_STAGES[stageNum - 1];
    if (!stage) return NextResponse.json({ ok: false, error: "unknown stage" }, { status: 400 });
    const systemPrompt = `You are "AP-Mentor", an AgileProjection instructor. The student is building: "${project}" in the "${categoryLabel}" domain. Generate a Markdown training module for ${stage.week} — Stage ${stage.step}: "${stage.title}". Focus: ${stage.desc} Deliverable: ${stage.deliverable}. Structure with H2 sections: 🎯 Learning Objectives (3-5 bullets), 📝 Step-by-Step Guide (numbered + ONE code block ~15-25 lines), 🔗 Resources (3-4 topics), 🛠️ Hands-on Exercise (tied to their project), ✅ Completion Checklist (4-6 items). Tailor to "${project}" + "${categoryLabel}". ~400 words.`;
    const messages: ChatMsg[] = [{ role: "assistant", content: systemPrompt }, { role: "user", content: `Generate the ${stage.week} training module now.` }];
    let reply = "";
    try {
      const ZAIModule = await import("z-ai-web-dev-sdk");
      const ZAI = (ZAIModule as unknown as { default: { create: () => Promise<unknown> } }).default ?? (ZAIModule as unknown as { create: () => Promise<unknown> });
      const zai = await ZAI.create();
      const completion = await (zai as { chat: { completions: { create: (a: { messages: ChatMsg[]; thinking: { type: string } }) => Promise<{ choices: { message?: { content?: string } }[] }> } } }).chat.completions.create({ messages, thinking: { type: "disabled" } });
      reply = completion.choices?.[0]?.message?.content?.trim() || "";
    } catch (e) { console.error("[training] LLM failed:", (e as Error).message); reply = `## ⚠️ AI service unavailable\n\nPlease try again, or ask the AP-AI Mentor for help with "${stage.title}".`; }
    if (!reply) reply = `## ⚠️ Empty response\n\nPlease click "Start ${stage.week} Training" again.`;
    return NextResponse.json({ ok: true, stage: stageNum, week: stage.week, title: stage.title, content: reply });
  } catch (err) { console.error("[training] error:", err); return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 }); }
}
