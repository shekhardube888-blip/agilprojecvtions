import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgileProjection · NT-AI Network — Free Engineering Internships & AI/ML Projects",
  description:
    "AgileProjection (NT-AI Network) offers free online internship programs and 80+ industry-grade AI/ML projects for BE / B.Tech / ME / M.Tech / MCA students. Live mentoring, real projects, AICTE-aligned certificates, and AI-powered learning support.",
  keywords: [
    "AgileProjection",
    "NT-AI Network",
    "free internship",
    "engineering internship",
    "AI ML internship",
    "BE internship",
    "B.Tech internship",
    "MCA internship",
    "M.Tech internship",
    "embedded systems internship",
    "IoT internship",
    "final year project",
    "AI learning assistant",
  ],
  authors: [{ name: "AgileProjection" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AgileProjection · NT-AI Network — Free Engineering Internships",
    description:
      "Free online internship programs for engineering students. 80+ AI/ML projects, live mentoring, AICTE-aligned certificates.",
    url: "https://agileprojection.com",
    siteName: "AgileProjection",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgileProjection · NT-AI Network",
    description:
      "Free engineering internships & AI/ML projects for BE / B.Tech / MCA / M.Tech students.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* No-flash theme script — applies the dark (NT-AI burgundy) theme
            BEFORE React hydrates, so there's no flash of light theme. */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var stored = localStorage.getItem('ap-theme');
              var isDark = stored !== 'light';
              if (isDark) document.documentElement.classList.add('dark');
            } catch(e) {
              document.documentElement.classList.add('dark');
            }
          })();
        ` }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
