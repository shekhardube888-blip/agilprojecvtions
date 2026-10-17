"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "how", label: "How It Works" },
  { id: "programs", label: "Programs" },
  { id: "categories", label: "Subjects" },
  { id: "benefits", label: "Benefits" },
  { id: "about", label: "About" },
  { id: "login", label: "Sign In" },
  { id: "faq", label: "FAQ" },
];

export function SectionNavigator() {
  const [active, setActive] = useState("top");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show the navigator after scrolling past the hero
      setVisible(window.scrollY > 400);

      // Find the current section
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.getBoundingClientRect().top < 200) {
          setActive(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2" aria-label="Section navigator">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="group flex items-center gap-2 justify-end"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span className={cn(
            "text-[10px] font-medium transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap",
            active === s.id ? "text-cyan-500 dark:text-cyan-400" : "text-muted-foreground"
          )}>
            {s.label}
          </span>
          <span className={cn(
            "rounded-full transition-all",
            active === s.id
              ? "size-3 bg-cyan-500 dark:bg-cyan-400 ring-2 ring-cyan-500/20"
              : "size-2 bg-muted-foreground/40 hover:bg-muted-foreground/70 group-hover:size-3"
          )} />
        </a>
      ))}
    </nav>
  );
}
