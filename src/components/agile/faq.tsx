"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/data";

export function FAQ() {
  return (
    <section
      id="faq"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto"
      aria-labelledby="faq-h2"
    >
      <div className="text-center mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Frequently Asked
        </div>
        <h2 id="faq-h2" className="font-bold text-3xl md:text-4xl">
          Everything you want to <span className="ap-gradient-text">know</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
          Still have a question? Ask the AI Mentor below, or WhatsApp{" "}
          <a href="https://wa.me/918095557334" className="text-cyan-300 underline underline-offset-4">
            +91 80955 57334
          </a>{" "}
          — our team replies within 24 hours.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Accordion
          type="single"
          defaultValue="faq-0"
          className="flex flex-col gap-3"
        >
          {FAQS.map((f, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border rounded-xl px-5 [&:last-child]:border-b"
            >
              <AccordionTrigger
                className="text-left text-sm md:text-base font-medium text-foreground hover:text-cyan-300 hover:no-underline [&>svg]:text-cyan-400"
                aria-label={f.q}
              >
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
