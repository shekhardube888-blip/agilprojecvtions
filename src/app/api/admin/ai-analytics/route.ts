import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, readSession } from "@/lib/auth";
export const runtime = "nodejs";
export const maxDuration = 60;
type ChatMsg = { role: "user" | "assistant"; content: string };
export async function POST(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    const total = await db.student.count();
    const pending = await db.student.count({ where: { paymentStatus: "pending" } });
    const active = await db.student.count({ where: { internshipStatus: "in_progress" } });
    const completed = await db.student.count({ where: { internshipStatus: "completed" } });
    const byDegree = await db.student.groupBy({ by: ["degree"], _count: { degree: true }, orderBy: { _count: { degree: "desc" } } });
    const byCategory = await db.student.groupBy({ by: ["categoryLabel"], _count: { categoryLabel: true }, orderBy: { _count: { categoryLabel: "desc" } } });
    const certCount = await db.certificate.count();
    const statsText = `Total: ${total}, Pending: ${pending}, Active: ${active}, Completed: ${completed}, Certs: ${certCount}. By degree: ${byDegree.map(d => `${d.degree}(${d._count.degree})`).join(", ")}. By domain: ${byCategory.map(c => `${c.categoryLabel}(${c._count.categoryLabel})`).join(", ")}.`;
    const systemPrompt = `You are an AI analytics engine for AgileProjection. Based on student stats, generate Markdown insights: 🎯 Dropout Risk Analysis (which groups at risk), 📈 Performance Forecast (next 30 days), 🏆 Certificate Eligibility Forecast, 💡 Recommendations (3-5 actions). ~350 words. Use the actual numbers.`;
    const messages: ChatMsg[] = [{ role: "assistant", content: systemPrompt }, { role: "user", content: `Stats:\n${statsText}` }];
    let reply = "";
    try {
      const ZAIModule = await import("z-ai-web-dev-sdk");
      const ZAI = (ZAIModule as unknown as { default: { create: () => Promise<unknown> } }).default ?? (ZAIModule as unknown as { create: () => Promise<unknown> });
      const zai = await ZAI.create();
      const completion = await (zai as { chat: { completions: { create: (a: { messages: ChatMsg[]; thinking: { type: string } }) => Promise<{ choices: { message?: { content?: string } }[] }> } } }).chat.completions.create({ messages, thinking: { type: "disabled" } });
      reply = completion.choices?.[0]?.message?.content?.trim() || "";
    } catch (e) { reply = `## ⚠️ AI service unavailable\n\nStats:\n${statsText}`; }
    return NextResponse.json({ ok: true, stats: { total, pending, active, completed, certCount, byDegree, byCategory }, insights: reply });
  } catch (err) { console.error("[ai-analytics] error:", err); return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 }); }
}
