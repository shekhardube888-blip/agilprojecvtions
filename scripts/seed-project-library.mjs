// ─────────────────────────────────────────────────────────────────────────────
// scripts/seed-project-library.mjs
// ─────────────────────────────────────────────────────────────────────────────
// Cross-database seed (works for both SQLite local dev AND Postgres/Neon prod).
// Idempotent — safe to run multiple times.
//
// Run with:  node scripts/seed-project-library.mjs
//   (or  bun run scripts/seed-project-library.mjs)
//
// Creates 5 ready-made projects in the Project Library:
//   1. AI Procurement Assistant
//   2. AI Resume Screening System
//   3. Enterprise AI Chatbot
//   4. Smart Business Dashboard
//   5. Internship Project Management Portal
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const projects = [
  {
    slug: "ai-procurement-assistant",
    title: "AI Procurement Assistant",
    description:
      "Build a tool for supplier evaluation, purchase recommendations, and procurement analytics. The assistant ingests vendor catalogs + past PO history, scores suppliers on quality/price/lead-time, and recommends the best vendor for a new requisition.",
    techStack: "Python / FastAPI / PostgreSQL",
    difficulty: "Intermediate",
    category: "AI",
    featured: true,
    features: JSON.stringify([
      "Supplier scoring (quality, price, lead-time)",
      "Purchase recommendation engine",
      "Procurement analytics dashboard",
      "REST API with FastAPI",
      "PostgreSQL persistence",
    ]),
    starterFiles: JSON.stringify([
      {
        label: "README",
        fileName: "README.md",
        language: "markdown",
        content:
          "# AI Procurement Assistant\n\nBuild a tool for supplier evaluation, purchase recommendations, and procurement analytics.\n\n## Stack\n- Python 3.11\n- FastAPI (REST API)\n- PostgreSQL + SQLAlchemy\n- scikit-learn (scoring model)\n\n## Setup\n```bash\npip install -r requirements.txt\npsql -f database/schema.sql\nuvicorn app.main:app --reload\n```\n\n## Endpoints\n- `POST /suppliers` — register a supplier\n- `POST /requisitions` — submit a purchase requisition\n- `GET /recommend?category=...` — top-3 suppliers ranked\n- `GET /analytics/lead-time` — avg lead-time by category\n",
      },
      {
        label: "requirements",
        fileName: "requirements.txt",
        language: "text",
        content:
          "fastapi==0.115.0\nuvicorn[standard]==0.32.0\nsqlalchemy==2.0.35\npsycopg2-binary==2.9.9\npydantic==2.9.2\nscikit-learn==1.5.2\npandas==2.2.3\nnumpy==1.26.4\npython-dotenv==1.0.1\n",
      },
      {
        label: "FastAPI app",
        fileName: "app/main.py",
        language: "python",
        content:
          "from fastapi import FastAPI, Depends, HTTPException\nfrom pydantic import BaseModel\nfrom sqlalchemy.orm import Session\n\nfrom app.db import get_db, Supplier, Requisition\nfrom app.ml.scorer import score_suppliers\n\napp = FastAPI(title=\"AI Procurement Assistant\", version=\"0.1.0\")\n\nclass SupplierIn(BaseModel):\n    name: str\n    category: str\n    quality_score: float\n    avg_price: float\n    avg_lead_days: int\n\nclass RequisitionIn(BaseModel):\n    category: str\n    qty: int\n    budget: float\n\n@app.get(\"/health\")\ndef health():\n    return {\"status\": \"ok\"}\n\n@app.post(\"/suppliers\", status_code=201)\ndef add_supplier(s: SupplierIn, db: Session = Depends(get_db)):\n    obj = Supplier(**s.dict())\n    db.add(obj); db.commit(); db.refresh(obj)\n    return {\"id\": obj.id}\n\n@app.get(\"/recommend\")\ndef recommend(category: str, db: Session = Depends(get_db)):\n    rows = db.query(Supplier).filter(Supplier.category == category).all()\n    if not rows:\n        raise HTTPException(404, \"No suppliers in this category\")\n    ranked = score_suppliers(rows)\n    return {\"top\": ranked[:3]}\n",
      },
      {
        label: "ML scorer",
        fileName: "app/ml/scorer.py",
        language: "python",
        content:
          "import numpy as np\n\ndef score_suppliers(suppliers):\n    out = []\n    for s in suppliers:\n        quality = s.quality_score\n        price   = 1.0 - min(s.avg_price / 100000.0, 1.0)\n        lead    = 1.0 - min(s.avg_lead_days / 30.0, 1.0)\n        score   = 0.5 * quality + 0.3 * price + 0.2 * lead\n        out.append({\n            \"id\": s.id, \"name\": s.name,\n            \"score\": round(float(score), 4),\n            \"breakdown\": {\n                \"quality\": round(float(quality), 3),\n                \"price\":   round(float(price), 3),\n                \"lead\":    round(float(lead), 3),\n            }\n        })\n    out.sort(key=lambda x: x[\"score\"], reverse=True)\n    return out\n",
      },
      {
        label: "DB schema",
        fileName: "database/schema.sql",
        language: "sql",
        content:
          "CREATE TABLE IF NOT EXISTS suppliers (\n  id SERIAL PRIMARY KEY,\n  name TEXT NOT NULL,\n  category TEXT NOT NULL,\n  quality_score REAL NOT NULL CHECK (quality_score BETWEEN 0 AND 1),\n  avg_price REAL NOT NULL,\n  avg_lead_days INT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\nCREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);\nCREATE TABLE IF NOT EXISTS requisitions (\n  id SERIAL PRIMARY KEY,\n  category TEXT NOT NULL,\n  qty INT NOT NULL,\n  budget REAL NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n",
      },
    ]),
  },
  {
    slug: "ai-resume-screening",
    title: "AI Resume Screening System",
    description:
      "Analyze resumes, extract skills using NLP, and compare candidates against job requirements. Outputs a shortlist ranked by match score with explainability.",
    techStack: "Python / NLP / React",
    difficulty: "Intermediate",
    category: "AI",
    featured: true,
    features: JSON.stringify([
      "Resume PDF parsing",
      "Skill extraction with spaCy NER",
      "Job-description matching (TF-IDF + cosine)",
      "React dashboard for HR",
      "Explainable match scores",
    ]),
    starterFiles: JSON.stringify([
      {
        label: "README",
        fileName: "README.md",
        language: "markdown",
        content:
          "# AI Resume Screening System\n\nAnalyze resumes, extract skills using NLP, and rank candidates against a job description.\n\n## Stack\n- Backend: Python 3.11 + FastAPI\n- NLP: spaCy + scikit-learn\n- Frontend: React 18 + Vite\n\n## Run\n```bash\ncd backend && pip install -r requirements.txt\npython -m spacy download en_core_web_sm\nuvicorn app.main:app --reload --port 8000\ncd ../frontend && npm install && npm run dev\n```\n",
      },
      {
        label: "Backend deps",
        fileName: "backend/requirements.txt",
        language: "text",
        content:
          "fastapi==0.115.0\nuvicorn[standard]==0.32.0\nspacy==3.7.6\nscikit-learn==1.5.2\nPyPDF2==3.0.1\npython-multipart==0.0.12\npydantic==2.9.2\n",
      },
      {
        label: "Skill extractor",
        fileName: "backend/app/nlp/skill_extractor.py",
        language: "python",
        content:
          "import spacy\n_NLP = spacy.load(\"en_core_web_sm\")\nSKILL_VOCAB = {\n  \"python\", \"java\", \"javascript\", \"react\", \"node\", \"fastapi\", \"django\",\n  \"sql\", \"postgres\", \"mongodb\", \"aws\", \"docker\", \"kubernetes\",\n  \"machine learning\", \"deep learning\", \"nlp\", \"pandas\", \"numpy\",\n  \"tensorflow\", \"pytorch\", \"scikit-learn\", \"tableau\", \"powerbi\"\n}\ndef extract_skills(text):\n    doc = _NLP(text.lower())\n    found = set()\n    for chunk in doc.noun_chunks:\n        if chunk.text.strip() in SKILL_VOCAB:\n            found.add(chunk.text.strip())\n    for tok in doc:\n        if tok.text in SKILL_VOCAB and len(tok.text) > 1:\n            found.add(tok.text)\n    return sorted(found)\n",
      },
      {
        label: "Matcher",
        fileName: "backend/app/ml/matcher.py",
        language: "python",
        content:
          "from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\ndef match_resumes(job_desc, resumes):\n    if not resumes:\n        return []\n    corpus = [job_desc] + [r[\"text\"] for r in resumes]\n    vec = TfidfVectorizer(stop_words=\"english\", ngram_range=(1, 2))\n    tfidf = vec.fit_transform(corpus)\n    sims = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()\n    ranked = sorted(\n        ({\"id\": r[\"id\"], \"name\": r[\"name\"], \"score\": float(s)} for r, s in zip(resumes, sims)),\n        key=lambda x: x[\"score\"], reverse=True\n    )\n    return ranked\n",
      },
      {
        label: "React dashboard",
        fileName: "frontend/src/App.jsx",
        language: "javascript",
        content:
          "import { useState } from \"react\";\nexport default function App() {\n  const [jd, setJd] = useState(\"\");\n  const [files, setFiles] = useState([]);\n  const [results, setResults] = useState([]);\n  const [busy, setBusy] = useState(false);\n  async function submit() {\n    if (!jd || !files.length) return;\n    setBusy(true);\n    const fd = new FormData();\n    fd.append(\"job_desc\", jd);\n    for (const f of files) fd.append(\"files\", f);\n    try {\n      const r = await fetch(\"http://localhost:8000/screen\", { method: \"POST\", body: fd });\n      const d = await r.json();\n      setResults(d.ranked || []);\n    } finally { setBusy(false); }\n  }\n  return (\n    <div style={{ fontFamily: \"sans-serif\", padding: 24, maxWidth: 960, margin: \"0 auto\" }}>\n      <h1>AI Resume Screening</h1>\n      <textarea rows={6} value={jd} onChange={(e) => setJd(e.target.value)} style={{ width: \"100%\", padding: 8 }} />\n      <input type=\"file\" multiple accept=\".pdf\" onChange={(e) => setFiles([...e.target.files])} />\n      <button onClick={submit} disabled={busy}>{busy ? \"Screening...\" : \"Screen resumes\"}</button>\n      <ul>\n        {results.map((r) => (\n          <li key={r.id}><strong>{r.name}</strong> — {(r.score*100).toFixed(1)}%</li>\n        ))}\n      </ul>\n    </div>\n  );\n}\n",
      },
    ]),
  },
  {
    slug: "enterprise-ai-chatbot",
    title: "Enterprise AI Chatbot",
    description:
      "A chatbot that answers employee questions using company documents. Upload PDFs/docs, the system chunks + embeds them, and retrieves the most relevant context for each user question before calling the LLM.",
    techStack: "Python / LLM API / FastAPI / React",
    difficulty: "Advanced",
    category: "AI",
    featured: true,
    features: JSON.stringify([
      "Document upload + chunking",
      "Vector retrieval (FAISS)",
      "RAG — context-aware LLM responses",
      "Multi-turn chat memory",
      "React chat UI",
    ]),
    starterFiles: JSON.stringify([
      {
        label: "README",
        fileName: "README.md",
        language: "markdown",
        content:
          "# Enterprise AI Chatbot (RAG)\n\nAnswers employee questions using company documents — Retrieval-Augmented Generation.\n\n## Stack\n- Backend: FastAPI + sentence-transformers + FAISS\n- LLM: any OpenAI-compatible chat API\n- Frontend: React + Vite\n\n## Run\n```bash\ncd backend && pip install -r requirements.txt\nuvicorn app.main:app --reload --port 8000\ncd ../frontend && npm install && npm run dev\n```\n",
      },
      {
        label: "Vector store",
        fileName: "backend/app/retriever.py",
        language: "python",
        content:
          "import faiss, numpy as np\nfrom sentence_transformers import SentenceTransformer\n_model = SentenceTransformer(\"all-MiniLM-L6-v2\")\n_dim = 384\ndocs = []\nindex = faiss.IndexFlatIP(_dim)\n\ndef add(text, source, page=0):\n    emb = _model.encode([text], normalize_embeddings=True)\n    idx = len(docs)\n    docs.append({\"id\": idx, \"text\": text, \"source\": source, \"page\": page})\n    index.add(np.asarray(emb, dtype=np.float32))\n\ndef search(query, k=3):\n    if len(docs) == 0: return []\n    q = _model.encode([query], normalize_embeddings=True)\n    D, I = index.search(np.asarray(q, dtype=np.float32), min(k, len(docs)))\n    out = []\n    for score, idx in zip(D[0], I[0]):\n        if idx < 0 or idx >= len(docs): continue\n        d = docs[idx]\n        out.append({\"score\": float(score), \"text\": d[\"text\"], \"source\": d[\"source\"], \"page\": d[\"page\"]})\n    return out\n\ndef chunk(text, size=800, overlap=100):\n    chunks, i = [], 0\n    while i < len(text):\n        chunks.append(text[i:i+size])\n        i += size - overlap\n    return chunks\n",
      },
      {
        label: "RAG chat endpoint",
        fileName: "backend/app/main.py",
        language: "python",
        content:
          "from fastapi import FastAPI, UploadFile, File\nfrom pydantic import BaseModel\nfrom PyPDF2 import PdfReader\nfrom openai import OpenAI\nfrom app.retriever import add, search, chunk\nimport os, uuid\napp = FastAPI(title=\"Enterprise AI Chatbot\")\n_client = OpenAI(api_key=os.getenv(\"OPENAI_API_KEY\", \"\"))\n_sessions = {}\n\nclass ChatIn(BaseModel):\n    messages: list[dict]\n    session_id: str | None = None\n\n@app.post(\"/docs/upload\")\nasync def upload(file: UploadFile = File(...)):\n    reader = PdfReader(file.file)\n    for i, page in enumerate(reader.pages):\n        text = page.extract_text() or \"\"\n        for c in chunk(text):\n            add(c, source=file.filename, page=i+1)\n    return {\"filename\": file.filename, \"pages\": len(reader.pages)}\n\n@app.post(\"/chat\")\ndef chat(req: ChatIn):\n    sid = req.session_id or str(uuid.uuid4())\n    last_user = next((m[\"content\"] for m in reversed(req.messages) if m[\"role\"] == \"user\"), \"\")\n    sources = search(last_user, k=3)\n    context = \"\\n\\n\".join(s[\"text\"] for s in sources)\n    sys = \"You are an internal enterprise assistant. Answer ONLY from the context below.\\n\\nContext:\\n\" + context\n    msgs = [{\"role\": \"system\", \"content\": sys}] + req.messages\n    try:\n        r = _client.chat.completions.create(model=\"gpt-4o-mini\", messages=msgs, temperature=0.2)\n        reply = r.choices[0].message.content\n    except Exception as e:\n        reply = f\"(LLM unavailable: {e})\"\n    return {\"reply\": reply, \"sources\": sources, \"session_id\": sid}\n",
      },
    ]),
  },
  {
    slug: "smart-business-dashboard",
    title: "Smart Business Dashboard",
    description:
      "KPI dashboards, data filters, reports, and business analytics. Pulls sales/inventory/HR data from Postgres, aggregates by region/period, and renders interactive Chart.js visualisations.",
    techStack: "React / Next.js / PostgreSQL / Chart.js",
    difficulty: "Beginner",
    category: "Web",
    featured: false,
    features: JSON.stringify([
      "KPI cards (revenue, orders, AOV)",
      "Date + region filters",
      "Drill-down charts with Chart.js",
      "CSV/PDF report export",
      "Server-side aggregation via Prisma",
    ]),
    starterFiles: JSON.stringify([
      {
        label: "README",
        fileName: "README.md",
        language: "markdown",
        content: "# Smart Business Dashboard\n\nKPI dashboards with date + region filters, Chart.js visualisations, and CSV export.\n\n## Stack\n- Next.js 14 (App Router)\n- Prisma + PostgreSQL\n- Chart.js (react-chartjs-2)\n- TailwindCSS\n\n## Run\n```bash\nnpm install\npsql -f database/schema.sql\nnpm run dev\n```\n",
      },
      {
        label: "DB schema",
        fileName: "database/schema.sql",
        language: "sql",
        content:
          "CREATE TABLE IF NOT EXISTS orders (\n  id SERIAL PRIMARY KEY,\n  order_date DATE NOT NULL,\n  region TEXT NOT NULL,\n  product TEXT NOT NULL,\n  qty INT NOT NULL,\n  revenue NUMERIC(12, 2) NOT NULL\n);\nCREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);\nCREATE INDEX IF NOT EXISTS idx_orders_region ON orders(region);\n",
      },
      {
        label: "API route",
        fileName: "app/api/kpis/route.ts",
        language: "typescript",
        content:
          "import { NextResponse } from 'next/server';\nimport { PrismaClient } from '@prisma/client';\nimport { sub } from 'date-fns';\nconst prisma = new PrismaClient();\nexport async function GET(req: Request) {\n  const url = new URL(req.url);\n  const region = url.searchParams.get('region') || 'all';\n  const days = Number(url.searchParams.get('days') || 30);\n  const since = sub(new Date(), { days });\n  const where = {\n    orderDate: { gte: since },\n    ...(region !== 'all' ? { region } : {}),\n  };\n  const rows = await prisma.order.findMany({ where, select: { qty: true, revenue: true, orderDate: true } });\n  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);\n  const totalOrders = rows.length;\n  const aov = totalOrders ? totalRevenue / totalOrders : 0;\n  const byDay = new Map<string, number>();\n  for (const r of rows) {\n    const k = r.orderDate.toISOString().slice(0, 10);\n    byDay.set(k, (byDay.get(k) || 0) + r.revenue);\n  }\n  const labels = [...byDay.keys()].sort();\n  const series = labels.map(l => byDay.get(l)!);\n  return NextResponse.json({ kpis: { revenue: totalRevenue.toFixed(2), orders: totalOrders, aov: aov.toFixed(2) }, chart: { labels, series } });\n}\n",
      },
      {
        label: "Dashboard page",
        fileName: "app/page.tsx",
        language: "tsx",
        content:
          "'use client';\nimport { useEffect, useState } from 'react';\nimport { Line } from 'react-chartjs-2';\nimport { Chart, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';\nChart.register(CategoryScale, LinearScale, PointElement, LineElement);\nexport default function Home() {\n  const [region, setRegion] = useState('all');\n  const [data, setData] = useState<any>(null);\n  useEffect(() => {\n    fetch(`/api/kpis?region=${region}`).then(r => r.json()).then(setData);\n  }, [region]);\n  if (!data) return <p>Loading...</p>;\n  return (\n    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>\n      <h1>Smart Business Dashboard</h1>\n      <select value={region} onChange={e => setRegion(e.target.value)}>\n        <option value=\"all\">All Regions</option><option>North</option><option>South</option>\n        <option>East</option><option>West</option>\n      </select>\n      <Line data={{ labels: data.chart.labels, datasets: [{ label: 'Revenue', data: data.chart.series, borderColor: '#0ea5e9' }] }} />\n    </main>\n  );\n}\n",
      },
    ]),
  },
  {
    slug: "internship-pm-portal",
    title: "Internship Project Management Portal",
    description:
      "Manage student assignments, progress, mentor feedback, and project submissions. Admins assign projects with deadlines; students upload their work; mentors review and provide feedback. Built on Next.js + Prisma + PostgreSQL.",
    techStack: "Next.js / Prisma / PostgreSQL",
    difficulty: "Intermediate",
    category: "Enterprise",
    featured: false,
    features: JSON.stringify([
      "Admin assigns projects + deadlines",
      "Student upload (GitHub link + report)",
      "Mentor review + feedback",
      "Progress tracking (auto-stage)",
      "Certificate generation",
    ]),
    starterFiles: JSON.stringify([
      {
        label: "README",
        fileName: "README.md",
        language: "markdown",
        content:
          "# Internship Project Management Portal\n\nA self-hostable internship management portal — admin assigns projects, students upload work, mentors review.\n\n## Stack\n- Next.js 16 (App Router)\n- Prisma + PostgreSQL\n- Tailwind + shadcn/ui\n\n## Run\n```bash\nnpm install\nnpm run db:push\nnpm run dev\n```\n\n## Default login\n- Admin: `admin` / `admin123`\n- Student demo: `student@demo.local` / `demo123`\n",
      },
      {
        label: "Prisma schema",
        fileName: "prisma/schema.prisma",
        language: "prisma",
        content:
          "generator client { provider = \"prisma-client-js\" }\ndatasource db { provider = \"postgresql\"; url = env(\"DATABASE_URL\") }\nmodel Account {\n  id String @id @default(cuid())\n  username String @unique\n  passwordHash String\n  role String @default(\"student\")\n  createdAt DateTime @default(now())\n}\nmodel Project {\n  id String @id @default(cuid())\n  title String\n  description String\n  deadline DateTime?\n  createdAt DateTime @default(now())\n  assignments Assignment[]\n}\nmodel Assignment {\n  id String @id @default(cuid())\n  projectId String\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  studentEmail String\n  status String @default(\"assigned\")\n  feedback String?\n  assignedAt DateTime @default(now())\n  submittedAt DateTime?\n  reviewedAt DateTime?\n  @@unique([projectId, studentEmail])\n}\n",
      },
      {
        label: "Auth helper",
        fileName: "lib/auth.ts",
        language: "typescript",
        content:
          "import { SignJWT, jwtVerify } from 'jose';\nimport bcrypt from 'bcryptjs';\nimport { db } from './db';\nconst SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev-secret');\nexport async function login(username, password) {\n  const acct = await db.account.findUnique({ where: { username } });\n  if (!acct) return null;\n  if (!await bcrypt.compare(password, acct.passwordHash)) return null;\n  const token = await new SignJWT({ username: acct.username, role: acct.role })\n    .setProtectedHeader({ alg: 'HS256' })\n    .setExpirationTime('7d')\n    .sign(SECRET);\n  return token;\n}\nexport async function verify(token) {\n  try {\n    const { payload } = await jwtVerify(token, SECRET);\n    return payload;\n  } catch { return null; }\n}\n",
      },
      {
        label: "Admin assign API",
        fileName: "app/api/admin/assign/route.ts",
        language: "typescript",
        content:
          "import { NextResponse } from 'next/server';\nimport { db } from '@/lib/db';\nimport { verify } from '@/lib/auth';\nexport async function POST(req: Request) {\n  const auth = req.headers.get('cookie') || '';\n  const token = auth.split(';').map(c => c.trim()).find(c => c.startsWith('token='))?.split('=')[1];\n  const session = token ? await verify(token) : null;\n  if (!session || session.role !== 'admin')\n    return NextResponse.json({ error: 'forbidden' }, { status: 403 });\n  const { projectId, studentEmail, deadline } = await req.json();\n  const a = await db.assignment.upsert({\n    where: { projectId_studentEmail: { projectId, studentEmail } },\n    create: { projectId, studentEmail, status: 'assigned', deadline: deadline ? new Date(deadline) : null },\n    update: { deadline: deadline ? new Date(deadline) : null }\n  });\n  return NextResponse.json({ ok: true, assignment: a });\n}\n",
      },
    ]),
  },
];

async function main() {
  // Clean existing
  console.log("[seed] Cleaning existing project library items...");
  await db.projectSubmission.deleteMany();
  await db.projectDownload.deleteMany();
  await db.projectLibraryItem.deleteMany({
    where: { slug: { in: projects.map((p) => p.slug) } },
  });

  console.log(`[seed] Inserting ${projects.length} projects...`);
  for (const p of projects) {
    await db.projectLibraryItem.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        techStack: p.techStack,
        difficulty: p.difficulty,
        category: p.category,
        features: p.features,
        starterFiles: p.starterFiles,
        status: "published",
        accessLevel: "public",
        featured: p.featured,
        createdBy: "seed-script",
      },
    });
    console.log(`  ✓ ${p.title}`);
  }
  console.log("[seed] Done.");
}

main()
  .catch((e) => {
    console.error("[seed] FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
