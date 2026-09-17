import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// AI Learning Assistant — POST /api/ai-assistant
// Body: { sessionId, message, degree?, history?: [{role, content}] }
// Returns: { ok, reply, sessionId }
//
// Powered by z-ai-web-dev-sdk (LLM). Server-only — never import the SDK on the client.
type ChatMsg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are "AP-AI Mentor", the AI Learning Assistant for AgileProjection · NT-AI Network — a free engineering internship platform in India serving BE, B.Tech, ME/M.Tech and MCA students.

Your role:
- Help students learn Computer Science, AI/ML, Embedded Systems, IoT, Full Stack and related topics.
- Recommend final-year / capstone project ideas from AgileProjection's 80+ AI/ML project catalog (Generative AI, Computer Vision, NLP, ML/Predictive Analytics, Industry 4.0, Healthcare AI, Cybersecurity+AI, Recommendation Systems, Research AI, Embedded/IoT/Full Stack).
- Explain concepts end-to-end: from data ingestion → EDA → feature engineering → model training → evaluation → deployment. The canonical reference architecture the platform uses is "Shekhar Dube's End-to-End ML Project — Housing Price Prediction using Regression", an in-portal walkthrough at #shekhar-dube-ml (6 stages with real Python/Scikit-Learn code: Data Ingestion → EDA → Feature Engineering → Modelling → Evaluation → Deployment). When a student asks how to build a complete ML project, point them to Shekhar Dube's walkthrough and summarise the 6 stages.
- Advise on internship & career: which AgileProjection program fits their degree/branch, how to register, certificate & AICTE credit questions, placement prep (DISHA sessions, resume review, mock interviews).
- Be concrete, structured, and beginner-friendly. Use short paragraphs and bullet lists. When you give code, use fenced code blocks with a language tag.
- Keep replies focused (around 200–350 words). If a student asks something out of scope, gently steer back to learning, projects, or careers.
- Never invent fake internship schedules or fees — AgileProjection internships are FREE; if unsure about batch dates, tell them to check the Schedule section on the portal.
- If a student wants to register, guide them to the #register section and tell them the team replies within 24 hours on WhatsApp +91 96440 84473 and email shekhar.dube@agileprojection.com.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || "").trim();
    const sessionId = String(body.sessionId || "").trim() || crypto.randomUUID();
    const degree = body.degree ? String(body.degree) : null;
    const history: ChatMsg[] = Array.isArray(body.history) ? body.history.slice(-8) : [];

    if (!message) {
      return NextResponse.json({ ok: false, error: "Message is required" }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ ok: false, error: "Message too long (max 2000 chars)" }, { status: 400 });
    }

    // Persist the user message for analytics (best-effort, non-blocking on failure).
    try {
      await db.chatMessage.create({
        data: { sessionId, role: "user", content: message, degree },
      });
    } catch (e) {
      console.error("[ai-assistant] persist user msg failed:", (e as Error).message);
    }

    // Compose the conversation. The first assistant message is the system prompt.
    const degreeContext = degree
      ? `\n\n[Student context: the student's degree is "${degree}". Tailor depth and examples to this background.]`
      : "";
    const messages: ChatMsg[] = [
      { role: "assistant", content: SYSTEM_PROMPT + degreeContext },
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
      console.error("[ai-assistant] LLM call failed:", (e as Error).message);
      reply = `I hit a snag reaching the AI service just now. Please try again in a moment — meanwhile, you can browse the 80+ AI/ML projects above or email shekhar.dube@agileprojection.com and our team will reply within 24 hours.`;
    }

    if (!reply) {
      reply = `I couldn't generate a response right now. Please rephrase your question, or reach our team on WhatsApp +91 96440 84473 / email shekhar.dube@agileprojection.com.`;
    }

    // Persist assistant reply.
    try {
      await db.chatMessage.create({
        data: { sessionId, role: "assistant", content: reply, degree },
      });
    } catch (e) {
      console.error("[ai-assistant] persist reply failed:", (e as Error).message);
    }

    return NextResponse.json({ ok: true, reply, sessionId });
  } catch (err) {
    console.error("[ai-assistant] error:", err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
