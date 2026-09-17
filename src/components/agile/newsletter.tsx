"use client";

import * as React from "react";
import { Mail, Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Subscription failed");
      }
      toast({ title: "Subscribed!", description: data.message || "New batch alerts will land in your inbox." });
      setEmail("");
    } catch (err) {
      toast({
        title: "Subscription failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="newsletter"
      className="py-16 md:py-20 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="newsletter-h2"
    >
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/40 via-cyan-500/40 to-blue-600/40">
        <div className="rounded-2xl bg-[#0e1b2e] p-6 md:p-8 grid lg:grid-cols-[1.2fr_1fr] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
              <Bell className="size-4" /> Stay in the Loop
            </div>
            <h2 id="newsletter-h2" className="font-bold text-2xl md:text-3xl">
              Get notified when new <span className="ap-gradient-text">batches &amp; projects</span> drop
            </h2>
            <p className="text-slate-400 mt-2 text-sm max-w-md">
              New internship batches open every month. Subscribe to get alerts 24 hours before the public announcement — plus free AI/ML project guides from our mentors.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <Input
                type="email"
                placeholder="you@college.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-[#0a1422] border-[rgba(6,182,212,0.18)] h-11"
                aria-label="Email address"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 h-11"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
