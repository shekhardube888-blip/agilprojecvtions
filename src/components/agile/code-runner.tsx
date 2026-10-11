"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, RotateCcw, Download, Code2, FileCode2, Palette, Braces, Eye,
  Maximize2, Minimize2, Copy, Check, Loader2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ── Starter templates ──
const STARTER_HTML = `<!-- Write your HTML here -->
<div class="hero">
  <h1>Hello, World!</h1>
  <p>Welcome to the AgileProjection Code Playground.</p>
  <button id="btn">Click me</button>
  <div id="counter">Clicks: 0</div>
</div>
`;

const STARTER_CSS = `/* Write your CSS here */
body {
  font-family: system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: white;
}
.hero {
  text-align: center;
  padding: 2rem;
}
h1 { font-size: 2rem; margin: 0 0 0.5rem; }
button {
  background: white;
  color: #0ea5e9;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: transform 0.15s;
}
button:hover { transform: scale(1.05); }
#counter { margin-top: 1rem; font-size: 1.1rem; }
`;

const STARTER_JS = `// Write your JavaScript here
let count = 0;
const btn = document.getElementById('btn');
const counter = document.getElementById('counter');

btn.addEventListener('click', () => {
  count++;
  counter.textContent = 'Clicks: ' + count;
  btn.textContent = count % 2 === 0 ? 'Click me' : 'Click again!';
});

console.log('Playground loaded');
`;

type EditorTab = "html" | "css" | "js";

const TABS: { key: EditorTab; label: string; icon: typeof FileCode2; starter: string; lang: string }[] = [
  { key: "html", label: "HTML", icon: FileCode2, starter: STARTER_HTML, lang: "html" },
  { key: "css", label: "CSS", icon: Palette, starter: STARTER_CSS, lang: "css" },
  { key: "js", label: "JS", icon: Braces, starter: STARTER_JS, lang: "javascript" },
];

// Combine HTML + CSS + JS into a single document for the iframe srcDoc.
function buildDoc(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${css}</style>
</head>
<body>
${html}
<script>
// Capture console logs + errors so they show in the student's panel
(function(){
  const orig = { log: console.log, error: console.error, warn: console.warn };
  ['log','error','warn'].forEach(function(k){
    console[k] = function(){
      try { window.parent.postMessage({ __playground: true, type: k, args: Array.from(arguments).map(String) }, '*'); } catch(e){}
      orig[k].apply(console, arguments);
    };
  });
  window.addEventListener('error', function(e){
    try { window.parent.postMessage({ __playground: true, type: 'error', args: [e.message + ' (line ' + (e.lineno||'?') + ')'] }, '*'); } catch(err){}
  });
})();
try {
${js}
} catch(e) {
  console.error(e.message);
}
<\/script>
</body>
</html>`;
}

export function CodeRunner() {
  const [tab, setTab] = useState<EditorTab>("html");
  const [code, setCode] = useState({ html: STARTER_HTML, css: STARTER_CSS, js: STARTER_JS });
  const [doc, setDoc] = useState<string>("");
  const [autoRun, setAutoRun] = useState(true);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [logs, setLogs] = useState<{ type: string; text: string }[]>([]);
  const [copied, setCopied] = useState<EditorTab | null>(null);
  const { toast } = useToast();

  // Auto-run with debounce (500ms after the user stops typing).
  useEffect(() => {
    if (!autoRun) return;
    const t = setTimeout(() => {
      setDoc(buildDoc(code.html, code.css, code.js));
    }, 500);
    return () => clearTimeout(t);
  }, [code, autoRun]);

  // Listen for console logs/errors from the iframe.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && typeof e.data === "object" && e.data.__playground) {
        setLogs((prev) => [...prev.slice(-50), { type: e.data.type, text: (e.data.args || []).join(" ") }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const run = useCallback(() => {
    setRunning(true);
    setLogs([]);
    setDoc(buildDoc(code.html, code.css, code.js));
    setTimeout(() => setRunning(false), 300);
  }, [code]);

  const reset = useCallback(() => {
    setCode({ html: STARTER_HTML, css: STARTER_CSS, js: STARTER_JS });
    setLogs([]);
    toast({ title: "Code reset", description: "Starter template restored." });
  }, [toast]);

  const download = useCallback(() => {
    const blob = new Blob([buildDoc(code.html, code.css, code.js)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "playground.html";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "playground.html saved." });
  }, [code, toast]);

  const copy = useCallback((which: EditorTab) => {
    navigator.clipboard.writeText(code[which]);
    setCopied(which);
    setTimeout(() => setCopied(null), 1200);
  }, [code]);

  // Handle Tab key in the textarea (insert 2 spaces instead of moving focus).
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      const newVal = val.slice(0, start) + "  " + val.slice(end);
      setCode((c) => ({ ...c, [tab]: newVal }));
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [tab]);

  const ActiveTab = TABS.find((t) => t.key === tab)!;

  return (
    <div className={cn("flex flex-col", fullscreen ? "fixed inset-0 z-[100] bg-background p-4" : "space-y-3")}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="size-8 rounded-lg ap-gradient-cyan grid place-items-center text-navy mr-1">
            <Code2 className="size-4" />
          </span>
          <div>
            <div className="font-semibold text-sm text-foreground">Code Playground</div>
            <div className="text-[10px] text-muted-foreground">Write HTML · CSS · JS — live preview</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none px-2 py-1 rounded-md hover:bg-muted">
            <input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} className="size-3 accent-cyan-500" />
            Auto-run
          </label>
          <Button size="sm" variant="outline" onClick={reset} className="h-8 text-xs">
            <RotateCcw className="size-3.5 mr-1" /> Reset
          </Button>
          <Button size="sm" variant="outline" onClick={download} className="h-8 text-xs">
            <Download className="size-3.5 mr-1" /> Download
          </Button>
          <Button size="sm" onClick={run} disabled={running} className="h-8 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            {running ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Play className="size-3.5 mr-1" />}
            Run
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setFullscreen((f) => !f)} className="h-8 w-8 p-0">
            {fullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
        </div>
      </div>

      {/* Editor + Preview split */}
      <div className={cn("grid gap-3", fullscreen ? "flex-1 grid-cols-2" : "grid-cols-1 lg:grid-cols-2")}>
        {/* Editor column */}
        <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
          {/* Editor tabs */}
          <div className="flex items-center gap-0.5 border-b border-border bg-muted/50 px-1.5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                    active
                      ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" /> {t.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-1 pr-1">
              <button
                type="button"
                onClick={() => copy(tab)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                title="Copy code"
              >
                {copied === tab ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied === tab ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          {/* Code textarea */}
          <div className="relative flex-1 min-h-[280px]">
            <textarea
              value={code[tab]}
              onChange={(e) => setCode((c) => ({ ...c, [tab]: e.target.value }))}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder={`Write your ${ActiveTab.label} here…`}
              className="absolute inset-0 w-full h-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-foreground outline-none border-0"
              style={{ tabSize: 2 }}
              aria-label={`${ActiveTab.label} editor`}
            />
          </div>
          {/* Status bar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ActiveTab.icon className="size-3" /> {ActiveTab.label}
            </span>
            <span>{code[tab].length} chars · {code[tab].split("\n").length} lines</span>
          </div>
        </div>

        {/* Preview column */}
        <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
            <Eye className="size-3.5 text-cyan-500 dark:text-cyan-400" />
            <span className="text-xs font-medium text-foreground">Live Preview</span>
            <div className="ml-auto flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" title="Live" />
              <span className="text-[10px] text-muted-foreground">{autoRun ? "Auto" : "Manual"}</span>
            </div>
          </div>
          {/* iframe preview — sandboxed (can run scripts but can't access parent) */}
          <div className="flex-1 min-h-[280px] bg-white">
            {doc ? (
              <iframe
                srcDoc={doc}
                title="preview"
                sandbox="allow-scripts allow-modals"
                className="w-full h-full min-h-[280px] border-0 bg-white"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">
                Click <strong className="text-foreground">Run</strong> to see the preview
              </div>
            )}
          </div>
          {/* Console / logs */}
          {logs.length > 0 && (
            <div className="border-t border-border bg-zinc-900 text-zinc-100 max-h-32 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-400 border-b border-zinc-700 sticky top-0 bg-zinc-900">
                Console
              </div>
              <div className="p-2 space-y-0.5 font-mono text-[11px]">
                {logs.map((l, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-1.5",
                      l.type === "error" ? "text-rose-400" : l.type === "warn" ? "text-amber-400" : "text-zinc-300",
                    )}
                  >
                    <span className="text-zinc-500 shrink-0 inline-flex items-center">{l.type === "error" ? "✗" : l.type === "warn" ? <AlertTriangle className="size-3" /> : "›"}</span>
                    <span className="break-all">{l.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
