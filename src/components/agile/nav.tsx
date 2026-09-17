"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ChevronDown, Phone, Zap, BarChart3 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string; desc?: string }[];
};

const NAV_LINKS: NavLink[] = [
  {
    label: "Internships",
    href: "#programs",
    children: [
      { label: "Embedded Systems", href: "#detail-embedded", desc: "ARM Cortex · RTOS · Firmware" },
      { label: "Internet of Things (IoT)", href: "#detail-iot", desc: "ESP32 · MQTT · Cloud" },
      { label: "Campus Ambassador", href: "#detail-cap", desc: "Leadership · Marketing" },
      { label: "AI / ML Industry Internship", href: "#aiml-program", desc: "80+ Projects · 6 Weeks" },
      { label: "Full Stack Track", href: "#programs", desc: "MERN + DSA (Coming Soon)" },
    ],
  },
  {
    label: "IT Courses",
    href: "#it-courses",
    children: [
      { label: "SAP Ariba / BTP / MM", href: "#it-courses", desc: "India's #1 SAP platform" },
      { label: "AI & ML for SAP", href: "#it-courses", desc: "SAP AI Core · Generative AI" },
      { label: "Cloud & DevOps", href: "#it-courses", desc: "AWS · Azure · K8s · CI/CD" },
      { label: "Full Stack Web Dev", href: "#it-courses", desc: "MERN + DSA bootcamp" },
      { label: "Cybersecurity", href: "#it-courses", desc: "Ethical Hacking · SOC" },
      { label: "Data Analytics", href: "#it-courses", desc: "Python · Power BI · SQL" },
    ],
  },
  { label: "Schedule", href: "#schedule" },
  { label: "Reports", href: "#reports" },
  { label: "Benefits", href: "#benefits" },
  { label: "FAQ", href: "#faq" },
  { label: "About", href: "#about" },
];

function BrandLogo() {
  return (
    <Link href="#top" className="flex items-center gap-1.5 font-bold text-lg shrink-0">
      <span className="size-7 rounded-md ap-gradient-cyan grid place-items-center text-navy">
        <Zap className="size-4" fill="currentColor" />
      </span>
      <span className="text-foreground">
        Agile<span className="text-cyan-400">Projection</span>
      </span>
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
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-[#0B1929]/85 backdrop-blur-md border-b border-[rgba(6,182,212,0.15)]">
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
                className="px-3 py-2 inline-flex items-center gap-1 text-slate-300 hover:text-cyan-400 transition-colors"
              >
                {link.label}
                {link.children && <ChevronDown className="size-3.5 opacity-70" />}
              </Link>
              {link.children && activeDropdown === link.label && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-80"
                  role="menu"
                >
                  <div className="bg-[#0e1b2e] border border-[rgba(6,182,212,0.22)] rounded-xl p-2 shadow-2xl">
                    {link.children.map((c) => (
                      <Link
                        key={c.label}
                        href={c.href}
                        className="block px-3 py-2 rounded-lg hover:bg-[#0F2340] transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="text-sm font-medium text-foreground">{c.label}</div>
                        {c.desc && (
                          <div className="text-xs text-slate-400 mt-0.5">{c.desc}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a
            href="tel:+918095557332"
            className="text-sm text-slate-300 hover:text-cyan-400 inline-flex items-center gap-1.5"
          >
            <Phone className="size-3.5" />
            +91 80955 57332
          </a>
          <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90">
            <Link href="#register">Register →</Link>
          </Button>
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
            <SheetContent side="right" className="bg-background border-l border-[rgba(6,182,212,0.18)] w-[88%] max-w-sm p-0">
              <SheetHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between">
                <SheetTitle className="flex items-center gap-1.5 font-bold">
                  <span className="size-6 rounded-md ap-gradient-cyan grid place-items-center text-navy">
                    <Zap className="size-3.5" fill="currentColor" />
                  </span>
                  <span>Agile<span className="text-cyan-400">Projection</span></span>
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
                          "text-slate-200 hover:bg-[#0F2340] hover:text-cyan-400"
                        )}
                      >
                        {link.label}
                      </Link>
                      {link.children && (
                        <ul className="ml-2 mt-1 mb-2 border-l border-[rgba(6,182,212,0.12)]">
                          {link.children.map((c) => (
                            <li key={c.label}>
                              <Link
                                href={c.href}
                                onClick={closeAll}
                                className="block px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-cyan-400"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-2 px-2">
                  <a
                    href="tel:+918095557332"
                    className="text-sm text-slate-300 inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-[rgba(6,182,212,0.2)]"
                  >
                    <Phone className="size-3.5" /> +91 80955 57332
                  </a>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                    <Link href="#register" onClick={closeAll}>Register →</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
