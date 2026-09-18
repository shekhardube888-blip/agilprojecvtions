import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/agile/nav";
import { Hero } from "@/components/agile/hero";
import { Counters } from "@/components/agile/counters";
import { HowItWorks } from "@/components/agile/how-it-works";
import { Programs } from "@/components/agile/programs";
import { ProgramDetails } from "@/components/agile/program-details";
import { Schedule } from "@/components/agile/schedule";
import { Benefits } from "@/components/agile/benefits";
import { Testimonials } from "@/components/agile/testimonials";
import { About } from "@/components/agile/about";
import { Mentors } from "@/components/agile/mentors";
import { FAQ } from "@/components/agile/faq";
import { Resources } from "@/components/agile/resources";
import { RegisterForm } from "@/components/agile/register-form";
import { Reports } from "@/components/agile/reports";
import { ITCourses } from "@/components/agile/it-courses";
import { Instructors } from "@/components/agile/instructors";
import { AIMLProgram } from "@/components/agile/aiml-program";
import { ShekharDubeMLProject } from "@/components/agile/shekhar-dube-ml-project";
import { AIAssistant } from "@/components/agile/ai-assistant";
import { Newsletter } from "@/components/agile/newsletter";
import { Footer } from "@/components/agile/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Counters />
        <HowItWorks />
        <div className="ap-divider" />
        <Programs />
        <ProgramDetails />
        <div className="ap-divider" />
        <Schedule />
        <div className="ap-divider" />
        <Benefits />
        <div className="ap-divider" />
        <Testimonials />
        <div className="ap-divider" />
        <About />
        <Mentors />
        <FAQ />
        <div className="ap-divider" />
        <Resources />
        <div className="ap-divider" />
        <RegisterForm />
        <div className="ap-divider" />
        <Reports />
        <div className="ap-divider" />
        <ITCourses />
        <Instructors />
        <AIMLProgram />
        <ShekharDubeMLProject />
        <AIAssistant />
        <Newsletter />

        {/* Closing CTA strip */}
        <section className="py-16 md:py-20 px-5 md:px-[5%] max-w-7xl mx-auto" aria-labelledby="cta-h2">
          <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600/50 via-cyan-500/50 to-blue-600/50">
            <div className="rounded-2xl bg-[#0e1b2e] p-8 md:p-12 text-center">
              <h2 id="cta-h2" className="font-bold text-2xl md:text-4xl">
                Ready to launch your <span className="ap-gradient-text">engineering career?</span>
              </h2>
              <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm md:text-base">
                Register free in under 4 minutes. No fee, no documents. Your seat in the next batch is reserved the moment you submit.
              </p>
              <Button asChild size="lg" className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 h-12 px-6">
                <Link href="#register">
                  Register Free — Apply Now <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
