import Link from "next/link";
import { Mail, Phone, MessageCircle, Zap, Linkedin, Twitter, Youtube, Instagram } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Internships",
    links: [
      { label: "Embedded Systems", href: "#detail-embedded" },
      { label: "Internet of Things (IoT)", href: "#detail-iot" },
      { label: "Campus Ambassador", href: "#detail-cap" },
      { label: "AI / ML Industry Internship", href: "#aiml-program" },
      { label: "Full Stack Track", href: "#programs" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "AI Learning Assistant", href: "#ai-assistant" },
      { label: "IT Courses (SkillGorila)", href: "#it-courses" },
      { label: "Schedule & Batches", href: "#schedule" },
      { label: "End-to-End ML Guide", href: "#aiml-program" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Meet the Mentors", href: "#mentors" },
      { label: "Student Stories", href: "#testimonials" },
      { label: "Why AgileProjection", href: "#benefits" },
      { label: "How It Works", href: "#how" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-5 md:px-[5%] py-12 md:py-16">
        <div className="grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-10">
          {/* Brand */}
          <div className="lg:pr-6">
            <Link href="https://agileprojection.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-bold text-xl mb-3">
              <span className="size-7 rounded-md ap-gradient-cyan grid place-items-center text-navy">
                <Zap className="size-4" fill="currentColor" />
              </span>
              <span>
                Agile<span className="text-cyan-400">Projection</span>
                <span className="text-muted-foreground text-xs font-semibold ml-0.5">(NT-AI)</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              AgileProjection (NT-AI Network) is a free engineering internship platform serving BE / B.Tech / ME / M.Tech / MCA students across India. Live mentoring, real projects, AICTE-aligned certificates — at zero cost, always.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <a
                href="https://agileprojection.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-300"
              >
                <Zap className="size-4 text-cyan-400" />
                agileprojection.com
              </a>
              <a
                href="mailto:training@agileprojection.com"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-300"
              >
                <Mail className="size-4 text-cyan-400" />
                training@agileprojection.com
              </a>
              <a
                href="tel:+918095557332"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-300"
              >
                <Phone className="size-4 text-cyan-400" />
                +91 80955 57332
              </a>
              <a
                href="https://wa.me/918095557334"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-300"
              >
                <MessageCircle className="size-4 text-cyan-400" />
                WhatsApp +91 80955 57334
              </a>
            </div>
            <div className="mt-5 flex items-center gap-2">
              {[
                { label: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/ai-is-a-mirror-reflecting-not-only-our-intellect-in-nt-ai-network-690362367/" },
                { label: "Twitter", icon: Twitter, href: "https://twitter.com" },
                { label: "YouTube", icon: Youtube, href: "https://www.youtube.com" },
                { label: "Instagram", icon: Instagram, href: "https://www.instagram.com" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="size-9 rounded-md bg-secondary border border-border grid place-items-center text-muted-foreground hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-muted-foreground hover:text-cyan-300 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h3 className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
              Contact
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="text-muted-foreground">NT-AI</li>
              <li className="text-muted-foreground text-xs">Founder &amp; Lead Mentor</li>
              <li>
                <a
                  href="mailto:hr@agileprojection.com"
                  className="text-muted-foreground hover:text-cyan-300 inline-flex items-center gap-2 break-all"
                >
                  <Mail className="size-4 text-cyan-400 shrink-0" />
                  hr@agileprojection.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/918319985622"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-cyan-300 inline-flex items-center gap-2"
                >
                  <MessageCircle className="size-4 text-cyan-400 shrink-0" />
                  +91 83199 85622
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/ai-is-a-mirror-reflecting-not-only-our-intellect-in-nt-ai-network-690362367/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-cyan-300 inline-flex items-center gap-2"
                >
                  <Linkedin className="size-4 text-cyan-400 shrink-0" />
                  Jobs on LinkedIn →
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© 2026 <a href="https://agileprojection.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300">AgileProjection.com</a> · All Rights Reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-cyan-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-cyan-300">Terms</Link>
            <Link href="#" className="hover:text-cyan-300">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
