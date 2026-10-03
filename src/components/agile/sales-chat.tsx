"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageCircle, Send, Loader2, X, Headset, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Which plan should I pick?",
  "What are the batch dates?",
  "Bulk enrollment for my college?",
  "Is it really free?",
];

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hi! I'm the **AP-Sales Assistant**. I can help you pick a track, understand the plans & pricing, batch dates, and get you registered. What would you like to know? 💬",
};

function genSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "sales-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function SalesChat() {
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(() => genSessionId());
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
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
      const history = next
        .filter((m) => m !== WELCOME)
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/sales-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: content, history }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Request failed");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply || "Sorry — I couldn't generate a reply. Try again." },
      ]);
    } catch (err) {
      toast({ title: "Sales chat error", description: (err as Error).message, variant: "destructive" });
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I couldn't reach the service right now. Please WhatsApp +91 83199 85622 or email hr@agileprojection.com — we reply within 24 hours.",
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
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close sales chat" : "Open sales chat"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] size-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 grid place-items-center hover:scale-105 transition-transform"
      >
        {open ? <X className="size-6" /> : <Headset className="size-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-emerald-400 ap-pulse ring-2 ring-[#0B1929]" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[calc(100vw-2.5rem)] sm:w-96 max-h-[70vh] flex flex-col bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted">
            <span className="size-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 grid place-items-center text-white">
              <Headset className="size-5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold flex items-center gap-2">
                AP-Sales Assistant
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-400" /> online
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">Sales & queries · replies instantly</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-cyan-300">
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-background"
            aria-live="polite"
            aria-label="Sales chat messages"
          >
            {messages.map((m, i) => (
              <SalesBubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <span className="size-6 rounded-full bg-secondary grid place-items-center text-cyan-400">
                  <Loader2 className="size-3 animate-spin" />
                </span>
                <span className="italic">AP-Sales Assistant is typing…</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-border bg-muted/40">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-secondary text-muted-foreground hover:text-cyan-300 hover:border-cyan-500/40 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-border bg-muted">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about plans, pricing, batches…"
              className="bg-muted border-border flex-1 h-9"
              aria-label="Message AP-Sales Assistant"
              disabled={loading}
              maxLength={1500}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 size-9"
              aria-label="Send message"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>

          <p className="px-3 py-1.5 text-[10px] text-muted-foreground border-t border-border bg-muted/60">
            For official details: WhatsApp{" "}
            <a href="https://wa.me/918319985622" className="text-cyan-300 underline underline-offset-4">+91 83199 85622</a>{" "}
            · email{" "}
            <a href="mailto:hr@agileprojection.com" className="text-cyan-300 underline underline-offset-4">hr@agileprojection.com</a>
          </p>
        </div>
      )}
    </>
  );
}

function SalesBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "size-6 rounded-full grid place-items-center shrink-0",
          isUser
            ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
            : "bg-gradient-to-br from-blue-600 to-cyan-500 text-white"
        )}
        aria-hidden
      >
        {isUser ? <User className="size-3" /> : <Headset className="size-3" />}
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-blue-600/15 border border-blue-500/30 text-foreground"
            : "bg-card border border-border text-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-slate-100 prose-a:text-cyan-300">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
