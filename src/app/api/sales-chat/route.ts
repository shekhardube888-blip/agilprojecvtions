import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 60;

// POST /api/sales-chat  { sessionId, message, history? }
// Sales & query chatbot (separate from the learning AP-AI Mentor).
type ChatMsg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are "AP-Sales Assistant", the sales & query chatbot for AgileProjection · NT-AI Network — a FREE engineering internship platform in India serving BE, B.Tech, ME/M.Tech and MCA students.

Your job (sales + pre-sales queries):
- Help prospects pick the right internship track (Embedded Systems, IoT, AI/ML Industry Internship, Full Stack, Campus Ambassador) based on their degree, branch, year, and goals.
- Explain the 4 plans: Basic (₹1,499), Standard (₹2,499), Professional (₹3,999), Premium / Job-Oriented (₹4,999). Note: the internship itself is FREE; the plan is the project mentorship tier.
- Cover batch start dates, last-date-to-apply, duration (4 weeks for most tracks, 6 weeks for AI/ML), mode (online live), and the AICTE-aligned certificate.
- Explain the registration flow: pick category → pick project → fill details → confirm → admin confirms payment → internship starts → 6-stage project journey.
- Mention there are 80+ AI/ML projects across 10 domains.
- For bulk / college enrollment discounts, collect the college name + approximate number of students and say the team will revert within 24h.
- Be warm, concise, conversion-oriented (not pushy). Use short paragraphs + bullets. Use emojis to make responses friendly (📊 🚀 ✅ 💡 📧). Keep replies under ~250 words.
- Always end with a clear next step: "Register free at #register" or "Talk to our team on WhatsApp +91 83199 85622 / email hr@agileprojection.com".
- If a question is technical (e.g. "how does RAG work?"), politely say that's for AP-AI Mentor (the learning assistant, lower on the page) and steer back to sales/pre-sales.
- Never invent fees or schedules that aren't in this prompt. If unsure, say "Let me connect you with the team" + the WhatsApp/email.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || "").trim();
    const sessionId = String(body.sessionId || "").trim() || crypto.randomUUID();
    const history: ChatMsg[] = Array.isArray(body.history) ? body.history.slice(-6) : [];
    if (!message) {
      return NextResponse.json({ ok: false, error: "Message is required" }, { status: 400 });
    }
    if (message.length > 1500) {
      return NextResponse.json({ ok: false, error: "Message too long (max 1500 chars)" }, { status: 400 });
    }
    const messages: ChatMsg[] = [
      { role: "assistant", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: message },
    ];

    let reply = "";
    try {
      const ZAIModule = await import("z-ai-web-dev-sdk");
      const ZAI = (ZAIModule as unknown as { default: { create: () => Promise<unknown> } }).default ?? (ZAIModule as unknown as { create: () => Promise<unknown> });
      const zai = await ZAI.create();
      const completion = await (zai as {
        chat: {
          completions: {
            create: (args: { messages: ChatMsg[]; thinking: { type: string } }) => Promise<{
              choices: { message?: { content?: string } }[];
            }>;
          };
        };
      }).chat.completions.create({
        messages,
        thinking: { type: "disabled" },
      });
      reply = completion.choices?.[0]?.message?.content?.trim() || "";
    } catch (e) {
      console.error("[sales-chat] LLM call failed:", (e as Error).message);
      reply = `I couldn't reach the AI service just now. Meanwhile, you can register free at #register, or reach our team on WhatsApp +91 83199 85622 / email hr@agileprojection.com — we reply within 24 hours.`;
    }
    if (!reply) {
      reply = `Please rephrase, or reach our team on WhatsApp +91 83199 85622 / email hr@agileprojection.com.`;
    }
    return NextResponse.json({ ok: true, reply, sessionId });
  } catch (err) {
    console.error("[sales-chat] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
