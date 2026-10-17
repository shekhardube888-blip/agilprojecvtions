"use client";

import { useState, useEffect } from "react";
import { Bot, Cpu, Code2, Briefcase, Building2, HardHat, MoreHorizontal, ChevronRight, X, Search, CheckCircle2, GitBranch, FileText, Award, BarChart3, Folder, FolderOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/data";

// ── AI & Machine Learning hierarchy ──
// Category → Subcategory → Project (with details + student progress)

type Project = {
  id: number;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  techStack: string[];
  github?: string;
  docs?: string;
  certificate?: boolean;
  progress: "Not Started" | "In Progress" | "Submitted" | "Completed";
};

type SubCategory = {
  key: string;
  label: string;
  projects: Project[];
};

type CategoryNode = {
  key: string;
  label: string;
  icon: string;
  subcategories: SubCategory[];
};

const AI_ML_HIERARCHY: CategoryNode[] = [
  {
    key: "cat-ml",
    label: "Machine Learning",
    icon: "📊",
    subcategories: [
      {
        key: "sub-pred",
        label: "Prediction",
        projects: [
          { id: 101, title: "Customer Churn Prediction System", difficulty: "Intermediate", techStack: ["Python", "Scikit-Learn", "Pandas", "XGBoost"], github: "github.com/agileprojection/churn-prediction", docs: "Available", certificate: true, progress: "Completed" },
          { id: 102, title: "House Price Prediction using Regression", difficulty: "Beginner", techStack: ["Python", "Scikit-Learn", "Pandas", "Matplotlib"], github: "github.com/agileprojection/housing-price", docs: "Available", certificate: true, progress: "In Progress" },
          { id: 103, title: "Sales Forecasting with Time Series", difficulty: "Advanced", techStack: ["Python", "Prophet", "ARIMA", "Plotly"], github: "github.com/agileprojection/sales-forecast", docs: "Available", certificate: true, progress: "Not Started" },
        ],
      },
      {
        key: "sub-class",
        label: "Classification",
        projects: [
          { id: 111, title: "Credit Card Fraud Detection", difficulty: "Intermediate", techStack: ["Python", "Scikit-Learn", "Imbalanced-Learn", "SMOTE"], github: "github.com/agileprojection/fraud-detection", docs: "Available", certificate: true, progress: "Not Started" },
          { id: 112, title: "Spam Email Classifier using NLP", difficulty: "Beginner", techStack: ["Python", "NLTK", "Scikit-Learn", "TF-IDF"], docs: "Available", certificate: true, progress: "Not Started" },
          { id: 113, title: "Disease Risk Prediction from Health Data", difficulty: "Advanced", techStack: ["Python", "Scikit-Learn", "XGBoost", "SHAP"], docs: "Available", certificate: true, progress: "Not Started" },
        ],
      },
      {
        key: "sub-agents",
        label: "AI Agents",
        projects: [
          { id: 121, title: "Autonomous Trading Agent", difficulty: "Advanced", techStack: ["Python", "Reinforcement Learning", "OpenAI Gym", "TensorFlow"], docs: "Available", certificate: true, progress: "Not Started" },
          { id: 122, title: "Smart Customer Support Agent", difficulty: "Intermediate", techStack: ["Python", "LangChain", "OpenAI", "FastAPI"], github: "github.com/agileprojection/support-agent", docs: "Available", certificate: true, progress: "Submitted" },
        ],
      },
    ],
  },
  {
    key: "cat-genai",
    label: "Generative AI & LLM",
    icon: "🤖",
    subcategories: [
      {
        key: "sub-rag",
        label: "RAG & Knowledge Bases",
        projects: [
          { id: 201, title: "Enterprise RAG-Based AI Knowledge Assistant", difficulty: "Intermediate", techStack: ["LangChain", "ChromaDB", "OpenAI", "FastAPI"], github: "github.com/agileprojection/rag-assistant", docs: "Available", certificate: true, progress: "Not Started" },
          { id: 202, title: "Multilingual AI Chatbot for Global Customer Service", difficulty: "Advanced", techStack: ["LangChain", "OpenAI", "Redis", "Docker"], docs: "Available", certificate: true, progress: "Not Started" },
          { id: 203, title: "AI-Powered Document Summarization Tool", difficulty: "Beginner", techStack: ["OpenAI", "PyPDF", "Streamlit"], docs: "Available", certificate: true, progress: "Not Started" },
        ],
      },
      {
        key: "sub-gen",
        label: "Content Generation",
        projects: [
          { id: 211, title: "Intelligent Code Review Assistant", difficulty: "Intermediate", techStack: ["OpenAI", "GitHub API", "LangChain"], docs: "Available", certificate: true, progress: "Not Started" },
          { id: 212, title: "Multimodal Content Generation Platform", difficulty: "Advanced", techStack: ["OpenAI GPT-4V", "DALL-E", "React", "FastAPI"], docs: "Available", certificate: true, progress: "Not Started" },
        ],
      },
    ],
  },
  {
    key: "cat-cv",
    label: "Computer Vision",
    icon: "👁️",
    subcategories: [
      {
        key: "sub-detect",
        label: "Object Detection",
        projects: [
          { id: 301, title: "Real-Time Object Detection using YOLO", difficulty: "Intermediate", techStack: ["Python", "YOLOv8", "OpenCV", "Ultralytics"], github: "github.com/agileprojection/yolo-detection", docs: "Available", certificate: true, progress: "Not Started" },
          { id: 302, title: "Face Recognition Attendance System", difficulty: "Beginner", techStack: ["Python", "OpenCV", "face_recognition", "Flask"], docs: "Available", certificate: true, progress: "Not Started" },
          { id: 303, title: "Traffic Sign Recognition for Autonomous Driving", difficulty: "Advanced", techStack: ["Python", "TensorFlow", "Keras", "OpenCV"], docs: "Available", certificate: true, progress: "Not Started" },
        ],
      },
      {
        key: "sub-medical",
        label: "Medical Imaging",
        projects: [
          { id: 311, title: "Diabetic Retinopathy Detection from Retinal Images", difficulty: "Advanced", techStack: ["Python", "TensorFlow", "Keras", "Grad-CAM"], docs: "Available", certificate: true, progress: "Not Started" },
          { id: 312, title: "Pneumonia Detection from Chest X-Rays", difficulty: "Intermediate", techStack: ["Python", "PyTorch", "TorchVision", "Grad-CAM"], docs: "Available", certificate: true, progress: "Not Started" },
        ],
      },
    ],
  },
];

const PROGRESS_STYLES: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  "Not Started": { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", icon: BarChart3 },
  "In Progress": { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", icon: GitBranch },
  "Submitted": { bg: "bg-cyan-500/10", text: "text-cyan-500 dark:text-cyan-400", icon: FileText },
  "Completed": { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
};

const DIFFICULTY_STYLES: Record<string, string> = {
  "Beginner": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Intermediate": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Advanced": "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20",
};

export function CategorySelector() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setIsLoggedIn(d.ok && !!d.user))
      .catch(() => setIsLoggedIn(false));
  }, []);

  function selectCategory(key: string) {
    setSelectedSubject(key);
    setSelectedProject(null);
    setExpandedCats(new Set());
    setExpandedSubs(new Set());
    try {
      localStorage.setItem("selected-subject", key);
      localStorage.setItem("redirect-after-login", "register");
    } catch { /* ignore */ }
    setTimeout(() => {
      document.getElementById("project-hierarchy")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function proceedToRegistration() {
    try { localStorage.setItem("redirect-after-login", "register"); } catch { /* ignore */ }
    if (isLoggedIn) {
      window.dispatchEvent(new CustomEvent("switch-dashboard-tab", { detail: "register" }));
    } else {
      document.querySelector("#login")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function toggleCat(key: string) {
    setExpandedCats((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }
  function toggleSub(key: string) {
    setExpandedSubs((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  // Filter projects by search
  const filterProject = (p: Project) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.techStack.some((t) => t.toLowerCase().includes(q));
  };

  const totalProjects = AI_ML_HIERARCHY.reduce((sum, cat) =>
    sum + cat.subcategories.reduce((s, sub) => s + sub.projects.filter(filterProject).length, 0), 0);

  const CATEGORIES_CARDS = [
    { key: "ai-ml", label: "AI / Machine Learning", desc: "Generative AI, LLMs, Computer Vision, NLP, Deep Learning", icon: Bot, accent: "cyan" },
    { key: "cs", label: "Computer Science", desc: "Full Stack, DSA, System Design, Cloud, DevOps", icon: Code2, accent: "violet" },
    { key: "ece", label: "Electronics & Communication", desc: "Embedded Systems, IoT, VLSI, Signal Processing", icon: Cpu, accent: "emerald" },
    { key: "mech", label: "Mechanical Engineering", desc: "CAD/CAM, Robotics, Automotive, Manufacturing", icon: HardHat, accent: "amber" },
    { key: "mba", label: "MBA / Management", desc: "Business Analytics, Marketing, Finance, Operations", icon: Briefcase, accent: "rose" },
    { key: "bba", label: "BBA / Business", desc: "Entrepreneurship, Digital Marketing, HR, Supply Chain", icon: Building2, accent: "blue" },
    { key: "civil", label: "Civil Engineering", desc: "Structural, Construction Mgmt, Smart Cities, GIS", icon: Building2, accent: "teal" },
    { key: "other", label: "Other (coming v2.0)", desc: "We're adding more domains", icon: MoreHorizontal, accent: "slate" },
  ];

  const ACCENTS: Record<string, { bg: string; text: string; border: string; hover: string }> = {
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500 dark:text-cyan-400", border: "border-cyan-500/20", hover: "hover:border-cyan-400/50" },
    violet: { bg: "bg-violet-500/10", text: "text-violet-500 dark:text-violet-400", border: "border-violet-500/20", hover: "hover:border-violet-400/50" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", hover: "hover:border-emerald-400/50" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20", hover: "hover:border-amber-400/50" },
    rose: { bg: "bg-rose-500/10", text: "text-rose-500 dark:text-rose-400", border: "border-rose-500/20", hover: "hover:border-rose-400/50" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500 dark:text-blue-400", border: "border-blue-500/20", hover: "hover:border-blue-400/50" },
    teal: { bg: "bg-teal-500/10", text: "text-teal-500 dark:text-teal-400", border: "border-teal-500/20", hover: "hover:border-teal-400/50" },
    slate: { bg: "bg-slate-500/10", text: "text-slate-500 dark:text-slate-400", border: "border-slate-500/20", hover: "hover:border-slate-400/50" },
  };

  return (
    <section id="categories" className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20">
      {/* Subject cards */}
      <div className="text-center mb-8">
        <div className="text-cyan-500 dark:text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">Internship Categories</div>
        <h2 className="font-bold text-3xl md:text-4xl text-foreground">Choose Your <span className="ap-gradient-text">Domain</span></h2>
        <p className="text-muted-foreground text-sm md:text-base mt-3 max-w-2xl mx-auto">Select your field to see the full project hierarchy: Category → Subcategory → Projects with details + progress.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES_CARDS.map((cat) => {
          const Icon = cat.icon; const a = ACCENTS[cat.accent] || ACCENTS.cyan;
          const isSelected = selectedSubject === cat.key;
          return (
            <button key={cat.key} type="button" onClick={() => selectCategory(cat.key)}
              className={cn("group text-left bg-card border rounded-xl p-4 transition-all hover:shadow-lg hover:-translate-y-0.5", isSelected ? cn(a.border, "ring-2 ring-offset-2 ring-offset-background", a.text) : cn(a.border, a.hover))}>
              <div className={cn("size-10 rounded-lg grid place-items-center mb-3", a.bg, a.text)}><Icon className="size-5" /></div>
              <div className="font-semibold text-sm text-foreground mb-1">{cat.label}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mb-2">{cat.desc}</div>
              <div className={cn("text-[10px] font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all", a.text)}>{isSelected ? "Selected ✓" : <>Select <ChevronRight className="size-3" /></>}</div>
            </button>
          );
        })}
      </div>

      {/* AI & ML full hierarchy: Category → Subcategory → Project → Details */}
      {selectedSubject === "ai-ml" && (
        <div id="project-hierarchy" className="mt-8 scroll-mt-20">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2"><Layers className="size-5 text-cyan-500 dark:text-cyan-400" /><div><h3 className="font-bold text-lg text-foreground">AI / Machine Learning — Project Hierarchy</h3><p className="text-xs text-muted-foreground">{AI_ML_HIERARCHY.length} categories · {totalProjects} projects</p></div></div>
            <div className="flex items-center gap-2">
              {search && <button onClick={() => setSearch("")} className="text-[10px] text-rose-500 font-semibold">Clear</button>}
              <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…" className="pl-8 pr-3 h-8 rounded-lg border border-border bg-muted text-xs text-foreground w-48" /></div>
              <button onClick={() => { setSelectedSubject(null); setSearch(""); }} className="text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground hover:text-foreground flex items-center gap-1"><X className="size-3" /> Close</button>
            </div>
          </div>

          <div className="space-y-3">
            {AI_ML_HIERARCHY.map((cat) => {
              const isCatExpanded = expandedCats.has(cat.key) || !!search;
              const visibleSubs = cat.subcategories.map((sub) => ({ ...sub, projects: sub.projects.filter(filterProject) })).filter((s) => s.projects.length > 0);
              if (visibleSubs.length === 0) return null;
              const catProjectCount = visibleSubs.reduce((s, sub) => s + sub.projects.length, 0);
              return (
                <div key={cat.key} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Category (level 1) */}
                  <button onClick={() => toggleCat(cat.key)} className="w-full flex items-center justify-between gap-3 p-4 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors text-left border-b border-border">
                    <div className="flex items-center gap-3"><span className="text-xl">{cat.icon}</span><div><div className="font-bold text-sm text-foreground">{cat.label}</div><div className="text-[10px] text-muted-foreground">{catProjectCount} projects · {visibleSubs.length} subcategories</div></div></div>
                    <div className="flex items-center gap-2"><span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-semibold">{catProjectCount} projects</span><ChevronRight className={cn("size-4 text-muted-foreground transition-transform", isCatExpanded && "rotate-90")} /></div>
                  </button>

                  {/* Subcategories (level 2) */}
                  {isCatExpanded && (
                    <div className="divide-y divide-border/30">
                      {visibleSubs.map((sub) => {
                        const subKey = `${cat.key}-${sub.key}`;
                        const isSubExpanded = expandedSubs.has(subKey) || !!search;
                        return (
                          <div key={sub.key} className="pl-4">
                            {/* Subcategory header */}
                            <button onClick={() => toggleSub(subKey)} className="w-full flex items-center justify-between gap-3 py-2.5 px-3 hover:bg-secondary/30 transition-colors text-left">
                              <div className="flex items-center gap-2"><Folder className={cn("size-4", isSubExpanded ? "text-cyan-500 dark:text-cyan-400" : "text-muted-foreground")} /><span className="text-xs font-semibold text-foreground">{sub.label}</span><span className="text-[10px] text-muted-foreground">{sub.projects.length} projects</span></div>
                              <ChevronRight className={cn("size-3.5 text-muted-foreground transition-transform", isSubExpanded && "rotate-90")} />
                            </button>

                            {/* Projects (level 3) */}
                            {isSubExpanded && (
                              <div className="pl-8 pb-2 space-y-2">
                                {sub.projects.map((p, idx) => {
                                  const ps = PROGRESS_STYLES[p.progress];
                                  const ProgressIcon = ps.icon;
                                  return (
                                    <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-cyan-400/30 transition-colors">
                                      {/* Number */}
                                      <span className="size-6 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 grid place-items-center text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</span>
                                      <div className="flex-1 min-w-0">
                                        {/* Project title */}
                                        <div className="font-medium text-xs text-foreground leading-tight">{p.title}</div>
                                        {/* Badges: difficulty + progress */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                          <span className={cn("text-[9px] px-2 py-0.5 rounded-full border font-semibold", DIFFICULTY_STYLES[p.difficulty])}>{p.difficulty}</span>
                                          <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5", ps.bg, ps.text)}><ProgressIcon className="size-2.5" /> {p.progress}</span>
                                        </div>
                                        {/* Tech stack */}
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {p.techStack.map((tech, i) => (<span key={i} className="text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/30">{tech}</span>))}
                                        </div>
                                        {/* Project details row */}
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[9px] text-muted-foreground">
                                          {p.github && <span className="flex items-center gap-0.5"><GitBranch className="size-2.5" /><a href={`https://${p.github}`} target="_blank" rel="noopener noreferrer" className="text-cyan-500 dark:text-cyan-400 hover:underline truncate max-w-[120px]">{p.github.replace("github.com/", "")}</a></span>}
                                          {p.docs && <span className="flex items-center gap-0.5"><FileText className="size-2.5" />{p.docs}</span>}
                                          {p.certificate && <span className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400"><Award className="size-2.5" /> Certificate</span>}
                                        </div>
                                      </div>
                                      {/* Register button */}
                                      <button onClick={proceedToRegistration} className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 hover:bg-cyan-500/20 font-semibold whitespace-nowrap flex items-center gap-1 shrink-0">
                                        {isLoggedIn ? <><CheckCircle2 className="size-3" /> Register</> : <>Select <ChevronRight className="size-3" /></>}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-6">
            <button onClick={proceedToRegistration} className="text-sm px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 inline-flex items-center gap-2">
              {isLoggedIn ? <><CheckCircle2 className="size-4" /> Go to Registration →</> : <>Sign In to Register →</>}
            </button>
            <p className="text-[10px] text-muted-foreground mt-2">{isLoggedIn ? "You're logged in — go straight to registration" : "Plans from ₹1,499 · UPI / Card / Net Banking · AICTE-Aligned Certificate"}</p>
          </div>
        </div>
      )}

      {/* For other subjects: show flat CATEGORIES list (fallback) */}
      {selectedSubject && selectedSubject !== "ai-ml" && (
        <div id="project-hierarchy" className="mt-8 scroll-mt-20">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Full project hierarchy for {CATEGORIES_CARDS.find((c) => c.key === selectedSubject)?.label} is being prepared. Meanwhile, select "AI / Machine Learning" to see the complete hierarchy in action.</p>
            <button onClick={() => setSelectedSubject("ai-ml")} className="mt-4 text-sm px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 font-semibold hover:bg-cyan-500/20">View AI/ML Hierarchy →</button>
          </div>
        </div>
      )}
    </section>
  );
}
