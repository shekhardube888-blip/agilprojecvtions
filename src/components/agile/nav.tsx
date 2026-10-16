"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthMenu } from "@/components/agile/auth-menu";
import { ThemeToggle } from "@/components/agile/theme-toggle";

type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string; desc?: string }[];
};

const NAV_LINKS: NavLink[] = [
  {
    label: "Internship Subjects",
    href: "#categories",
    children: [
      { label: "AI / Machine Learning", href: "#categories?subject=ai-ml", desc: "Generative AI · LLMs · Computer Vision · NLP" },
      { label: "Computer Science", href: "#categories?subject=cs", desc: "Full Stack · DSA · System Design · Cloud" },
      { label: "Electronics & Communication", href: "#categories?subject=ece", desc: "Embedded Systems · IoT · VLSI" },
      { label: "Mechanical Engineering", href: "#categories?subject=mech", desc: "CAD/CAM · Robotics · Automotive" },
      { label: "MBA / Management", href: "#categories?subject=mba", desc: "Business Analytics · Marketing · Finance" },
      { label: "BBA / Business", href: "#categories?subject=bba", desc: "Entrepreneurship · Digital Marketing · HR" },
      { label: "Civil Engineering", href: "#categories?subject=civil", desc: "Structural · Construction Mgmt · GIS" },
      { label: "Other (coming v2.0)", href: "#categories?subject=other", desc: "We're adding more domains" },
    ],
  },
  {
    label: "Projects",
    href: "#categories",
    children: [
      { label: "Generative AI & LLM", href: "#categories", desc: "10 projects · RAG, Chatbots, LLMs" },
      { label: "Computer Vision", href: "#categories", desc: "10 projects · YOLO, Detection" },
      { label: "ML & Predictive Analytics", href: "#categories", desc: "10 projects · Churn, Fraud, Forecasting" },
      { label: "NLP & Transformers", href: "#categories", desc: "10 projects · BERT, Sentiment" },
      { label: "AI for Industry 4.0", href: "#categories", desc: "10 projects · Manufacturing, Smart Factory" },
      { label: "Healthcare AI", href: "#categories", desc: "8 projects · Medical Imaging" },
      { label: "Cybersecurity + AI", href: "#categories", desc: "7 projects · Malware, Intrusion" },
    ],
  },
  { label: "How It Works", href: "#how" },
  { label: "Benefits", href: "#benefits" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

function BrandLogo() {
  return (
    <Link href="#top" className="flex items-center gap-2 font-bold text-lg shrink-0">
      <img src="/agileprojection-logo.png" alt="AgileProjection logo" className="h-7 w-auto rounded-md" />
      <span className="text-muted-foreground/40 hidden sm:inline">|</span>
      <img src="/ntai-logo.png" alt="NT-AI Network logo" className="h-7 w-auto rounded-md" />
    </Link>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const closeAll = () => {
    setOpen(false);
    setActiveDropdown(null);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/85 backdrop-blur-md border-b border-border">
      <nav
        className="h-full max-w-7xl mx-auto px-4 md:px-[5%] flex items-center justify-between gap-4"
        aria-label="Primary navigation"
      >
        <BrandLogo />

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1 text-sm">
          {NAV_LINKS.map((link) => (
            <li
              key={link.label}
              className="relative"
              onMouseEnter={() => link.children && setActiveDropdown(link.label)}
              onMouseLeave={() => link.children && setActiveDropdown(null)}
            >
              <Link
                href={link.href}
                className="px-3 py-2 inline-flex items-center gap-1 text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                {link.label}
                {link.children && <ChevronDown className="size-3.5 opacity-70" />}
              </Link>
              {link.children && activeDropdown === link.label && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-80"
                  role="menu"
                >
                  <div className="bg-popover border border-border rounded-xl p-2 shadow-2xl min-w-[280px]">
                    {link.children.map((c) => {
                      // Check if this link has a subject parameter → auto-select + prompt login
                      const subjectMatch = c.href.match(/\?subject=([^&]+)/);
                      const subjectKey = subjectMatch ? subjectMatch[1] : null;
                      return (
                        <a
                          key={c.label}
                          href={subjectKey ? "#login" : c.href}
                          className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                          onClick={(e) => {
                            setActiveDropdown(null);
                            if (subjectKey) {
                              e.preventDefault();
                              try {
                                localStorage.setItem("selected-subject", subjectKey);
                                localStorage.setItem("redirect-after-login", "register");
                              } catch { /* ignore */ }
                              document.querySelector("#login")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                          }}
                        >
                          <div className="text-sm font-medium text-foreground">{c.label}</div>
                          {c.desc && (
                            <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <AuthMenu />
          <a
            href="#login"
            className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Register Free
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                aria-expanded={open}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l border-border w-[88%] max-w-sm p-0">
              <SheetHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between">
                <SheetTitle className="flex items-center gap-1.5 font-bold">
                  <img src="/agileprojection-logo.png" alt="AgileProjection" className="h-6 w-auto rounded-md" />
                </SheetTitle>
              </SheetHeader>
              <div className="px-2 pb-6 overflow-y-auto flex-1">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={closeAll}
                        className={cn(
                          "block px-3 py-2.5 rounded-lg text-sm font-medium",
                          "text-foreground hover:bg-secondary hover:text-cyan-400"
                        )}
                      >
                        {link.label}
                      </Link>
                      {link.children && (
                        <ul className="ml-2 mt-1 mb-2 border-l border-border">
                          {link.children.map((c) => {
                            const subjectMatch = c.href.match(/\?subject=([^&]+)/);
                            const subjectKey = subjectMatch ? subjectMatch[1] : null;
                            return (
                            <li key={c.label}>
                              <a
                                href={subjectKey ? "#login" : c.href}
                                onClick={(e) => {
                                  closeAll();
                                  if (subjectKey) {
                                    e.preventDefault();
                                    try {
                                      localStorage.setItem("selected-subject", subjectKey);
                                      localStorage.setItem("redirect-after-login", "register");
                                    } catch { /* ignore */ }
                                    document.querySelector("#login")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                  }
                                }}
                                className="block px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-cyan-400"
                              >
                                {c.label}
                              </a>
                            </li>
                          );
                          })}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-2 px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <AuthMenu />
                  <a
                    href="#login"
                    onClick={closeAll}
                    className="w-full text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-center hover:opacity-90"
                  >
                    Register Free
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
