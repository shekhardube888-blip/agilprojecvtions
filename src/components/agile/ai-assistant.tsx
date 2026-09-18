"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Loader2, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DEGREES } from "@/lib/data";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I start my final-year AI project?",
  "Explain the end-to-end ML pipeline",
  "Recommend a project for CSE final year",
  "Which internship fits an MCA student?",
  "What's RAG?",
];

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hi! I'm **AP-AI Mentor**, your AI learning assistant for AgileProjection. Ask me anything about CS, AI/ML, Embedded, IoT, Full Stack, projects, internships or careers. Pick a degree (optional) below to tailor my answers, then type your question or tap a suggestion chip. 🚀",
};

function genSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "sess-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AIAssistant() {
  const [sessionId] = useState(() => genSessionId());
  const [degree, setDegree] = useState<string>("__none__");
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll on new message
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Msg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      // Send last 6 turns of history (excluding welcome, slicing for context window).
      const history = next
        .filter((m) => m !== WELCOME)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: content,
          degree: degree && degree !== "__none__" ? degree : undefined,
          history,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Request failed");
      }
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "Sorry — I couldn't generate a reply. Try again." },
      ]);
    } catch (err) {
      toast({
        title: "AI Mentor error",
        description: (err as Error).message || "Please try again in a moment.",
        variant: "destructive",
      });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I couldn't reach the AI service right now. Please try again, or email hr@agileprojection.com — our team replies within 24 hours.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <section
      id="ai-assistant"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="ai-h2"
    >
      <div className="text-center mb-8">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          AI Learning Assistant
        </div>
        <h2 id="ai-h2" className="font-bold text-3xl md:text-4xl">
          🤖 AP-AI Mentor — <span className="ap-gradient-text">Your Learning Assistant</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-3">
          Ask anything about CS, AI/ML, Embedded, IoT, Full Stack, projects, internships &amp; careers. Built for BE / B.Tech / MCA / M.Tech students.
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-[#0e1b2e] border border-[rgba(6,182,212,0.22)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(6,182,212,0.18)] bg-[#0a1422]">
          <span className="size-9 rounded-full ap-gradient-cyan grid place-items-center text-navy">
            <Bot className="size-5" />
          </span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              AP-AI Mentor
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="size-1.5 rounded-full bg-emerald-400" /> online
              </span>
            </div>
            <div className="text-[11px] text-slate-500">Powered by AgileProjection · NT-AI Network</div>
          </div>
        </div>

        {/* Degree selector */}
        <div className="px-4 py-3 border-b border-[rgba(6,182,212,0.18)] bg-[#0a1422]/60">
          <label className="text-[11px] text-slate-400 mb-1 block">Your degree (optional — improves context)</label>
          <Select value={degree} onValueChange={setDegree}>
            <SelectTrigger className="bg-[#0a1422] border-[rgba(6,182,212,0.18)] w-full sm:w-72 h-8 text-xs">
              <SelectValue placeholder="Select degree (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-[#0e1b2e] border-[rgba(6,182,212,0.18)] max-h-72 overflow-y-auto">
              <SelectItem value="__none__">— None —</SelectItem>
              {DEGREES.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="max-h-96 overflow-y-auto p-4 space-y-4 bg-[#0B1929]"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="size-7 rounded-full bg-[#0F2340] grid place-items-center text-cyan-400">
                <Loader2 className="size-3.5 animate-spin" />
              </span>
              <span className="italic">AP-AI Mentor is typing…</span>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-[rgba(6,182,212,0.12)] bg-[#0a1422]/40">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-full border border-[rgba(6,182,212,0.22)] bg-[#0F2340] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors disabled:opacity-50"
            >
              <Sparkles className="size-3 inline mr-1 text-cyan-400" />
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t border-[rgba(6,182,212,0.18)] bg-[#0a1422]">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask AP-AI Mentor anything… (e.g. 'Recommend a final-year AI project')"
            className="bg-[#0a1422] border-[rgba(6,182,212,0.18)] flex-1"
            aria-label="Message AP-AI Mentor"
            disabled={loading}
            maxLength={2000}
          />
          <Button
            type="button"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90"
            aria-label="Send message"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>

        <p className="px-4 py-2 text-[10px] text-slate-500 border-t border-[rgba(6,182,212,0.08)] bg-[#0a1422]/60">
          AP-AI Mentor can make mistakes. For official program details, email{" "}
          <a href="mailto:hr@agileprojection.com" className="text-cyan-300 underline underline-offset-4">
            hr@agileprojection.com
          </a>{" "}
          or WhatsApp{" "}
          <a href="https://wa.me/918319985622" className="text-cyan-300 underline underline-offset-4">
            +91 83199 85622
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "size-7 rounded-full grid place-items-center shrink-0",
          isUser
            ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
            : "ap-gradient-cyan text-navy"
        )}
        aria-hidden
      >
        {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-blue-600/15 border border-blue-500/30 text-slate-200"
            : "bg-[#111f35] border border-[rgba(6,182,212,0.18)] text-slate-200"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-pre:bg-[#0a1422] prose-pre:border-[rgba(6,182,212,0.18)] prose-pre:text-slate-200 prose-code:text-cyan-300 prose-a:text-cyan-300 prose-headings:text-foreground prose-strong:text-slate-100 prose-ul:my-2 prose-li:my-0.5 prose-p:my-1.5">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
