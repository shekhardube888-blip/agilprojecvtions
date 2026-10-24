// AgileProjection · NT-AI Network — central data source
// Used by both the frontend (page.tsx / components) and backend (API routes).

export const SITE = {
  brand: "AgileProjection",
  network: "NT-AI Network",
  email: "hr@agileprojection.com", // notifications destination
  trainingEmail: "training@agileprojection.com",
  phone: "+91 80955 57332",
  whatsapp: "918319985622", // WhatsApp number per request (8319985622)
  whatsappDisplay: "+91 83199 85622",
  founded: 2018,
};

// ── Hero / counters ──
export const COUNTERS = [
  { num: "10,000+", label: "Students Enrolled" },
  { num: "98%", label: "Completion Rate" },
  { num: "500+", label: "Colleges Represented" },
  { num: "4.8 ★", label: "Average Student Rating" },
];

export const ABOUT_STATS = [
  { num: "2018", label: "Founded" },
  { num: "10K+", label: "Students Trained" },
  { num: "500+", label: "Partner Colleges" },
  { num: "50+", label: "Expert Mentors" },
  { num: "4", label: "Program Tracks" },
  { num: "98%", label: "Completion Rate" },
];

// ── How it works ──
export const STEPS = [
  { num: "01", title: "Choose Your Track", desc: "Pick from Embedded Systems, IoT, Campus Ambassador, Full Stack or AI/ML based on your interests and degree stream." },
  { num: "02", title: "Register Free", desc: "Fill in the online form — no fee, no documents required. You'll receive a confirmation within 24 hours." },
  { num: "03", title: "Attend Live Sessions", desc: "Join daily online classes with expert mentors. Ask questions, clear doubts, and track your progress." },
  { num: "04", title: "Build Your Project", desc: "Complete a real-world project as your final deliverable — a working prototype you can showcase in interviews." },
  { num: "05", title: "Get Certified", desc: "Earn a merit certificate recognised by hundreds of Indian engineering colleges for academic credit." },
];

// ── Internship programs (cards) ──
export type Program = {
  id: string;
  title: string;
  badge: string;
  badgeType: "tech" | "non-tech" | "soon";
  icon: string;
  thumb: string;
  desc: string;
  tags: string[];
  meta: { strong: string; label: string }[];
  primaryCta: string;
};

export const PROGRAMS: Program[] = [
  {
    id: "embedded",
    title: "Embedded Systems Internship",
    badge: "Technical",
    badgeType: "tech",
    icon: "⚙️",
    thumb: "linear-gradient(135deg,#0a2a20,#06142a)",
    desc: "A live online program where you'll master microcontrollers, real-time operating systems, and firmware development. Build a complete embedded project from scratch with expert mentoring at every step.",
    tags: ["C / C++", "ARM Cortex", "RTOS", "GPIO / UART / SPI"],
    meta: [
      { strong: "4 Weeks", label: "Duration" },
      { strong: "Free", label: "Cost" },
      { strong: "Daily", label: "Live Sessions" },
    ],
    primaryCta: "Register Now",
  },
  {
    id: "iot",
    title: "Internet of Things (IoT) Internship",
    badge: "Technical",
    badgeType: "tech",
    icon: "🌐",
    thumb: "linear-gradient(135deg,#06142a,#0a1a30)",
    desc: "Design and build an end-to-end IoT solution — from sensors and microcontrollers to cloud dashboards. Perfect for students who want to work at the intersection of hardware, software, and connectivity.",
    tags: ["Arduino / ESP32", "MQTT", "Cloud", "Python"],
    meta: [
      { strong: "4 Weeks", label: "Duration" },
      { strong: "Free", label: "Cost" },
      { strong: "Daily", label: "Live Sessions" },
    ],
    primaryCta: "Register Now",
  },
  {
    id: "cap",
    title: "Campus Ambassador Program",
    badge: "Non-Technical",
    badgeType: "non-tech",
    icon: "🎓",
    thumb: "linear-gradient(135deg,#06142a,#1a0a30)",
    desc: "Be the face of AgileProjection at your engineering college. Drive awareness, host events, and build a community — while earning a stipend, developing leadership skills, and gaining a standout resume entry.",
    tags: ["Marketing", "Leadership", "Event Mgmt", "Stipend"],
    meta: [
      { strong: "1 Month", label: "Duration" },
      { strong: "Stipend", label: "Paid" },
      { strong: "Flexible", label: "Schedule" },
    ],
    primaryCta: "Apply Now",
  },
  {
    id: "fullstack",
    title: "Full Stack Developer Track",
    badge: "Coming Soon",
    badgeType: "soon",
    icon: "🖥️",
    thumb: "linear-gradient(135deg,#06142a,#102000)",
    desc: "Master the MERN stack (MongoDB, Express, React, Node.js) plus core Data Structures & Algorithms. Build a production-ready capstone application that you can showcase in your portfolio and job interviews.",
    tags: ["React", "Node.js", "MongoDB", "DSA"],
    meta: [
      { strong: "4 Weeks", label: "Duration" },
      { strong: "Free", label: "Cost" },
      { strong: "TBA", label: "Batch Start" },
    ],
    primaryCta: "Get Notified",
  },
];

// ── Program detail curriculum (tabs) ──
export type ProgramDetail = {
  id: string;
  title: string;
  intro: string[];
  curriculum: { week: string; text: string }[];
  build: string[];
  perks: string[];
  eligibility: string[];
};

export const PROGRAM_DETAILS: ProgramDetail[] = [
  {
    id: "embedded",
    title: "Embedded Systems Internship",
    intro: [
      "This four-week live program gives engineering students a structured introduction to embedded firmware development. Starting from bare-metal C programming, you'll progress to peripheral interfacing and conclude with a complete RTOS-based project.",
      "Sessions are held daily (2 hours) by industry mentors with hands-on lab assignments after every session. A doubt-clearing session is available every alternate day, plus recorded playbacks for revision.",
    ],
    curriculum: [
      { week: "Week 1", text: "C Programming Fundamentals, Memory Model, Bit Manipulation, GCC Toolchain setup" },
      { week: "Week 2", text: "Microcontroller Architecture (ARM Cortex-M), GPIO, UART, Timers & Interrupts" },
      { week: "Week 3", text: "SPI, I2C, ADC/DAC, Sensor interfacing, Debugging with Logic Analyser" },
      { week: "Week 4", text: "FreeRTOS fundamentals, Task scheduling, Semaphores, Final project integration & demo" },
    ],
    build: [
      "Sensor data logger with UART output",
      "Real-time clock & display system",
      "Multi-sensor IoT node with RTOS",
      "Complete project documentation & demo video",
    ],
    perks: [
      "Merit-based digital certificate",
      "Project source code on GitHub",
      "Performance-based goodie packs & vouchers",
      "LinkedIn recommendation from mentors",
      "Access to recorded sessions for 3 months",
    ],
    eligibility: [
      "BE / B.Tech students (3rd – 8th semester)",
      "Branches: ECE, EEE, EI, CSE, IT, Mech",
      "Basic C programming knowledge preferred",
      "Laptop with internet connection required",
    ],
  },
  {
    id: "iot",
    title: "Internet of Things (IoT) Internship",
    intro: [
      "Build a complete end-to-end IoT solution from sensor to cloud. This four-week program bridges hardware and software — you'll wire up sensors, write firmware, connect to the cloud, and visualise data on a live dashboard.",
      "Ideal for students who enjoy both electronics and software. No prior IoT experience required — just a willingness to build and experiment.",
    ],
    curriculum: [
      { week: "Week 1", text: "IoT ecosystem overview, Arduino / ESP32 basics, Python scripting, Breadboard prototyping" },
      { week: "Week 2", text: "Sensors & actuators, DHT22, LDR, PIR, Serial & Wi-Fi communication, MQTT protocol" },
      { week: "Week 3", text: "Cloud platforms (AWS IoT / Firebase), REST APIs, real-time data streaming, JSON payloads" },
      { week: "Week 4", text: "Dashboard creation, alert systems, final project build, demo & presentation to industry panel" },
    ],
    build: [
      "Smart environment monitor (temp / humidity / air)",
      "Real-time cloud dashboard with charts",
      "SMS / email alert system on threshold breach",
      "End-to-end project report & demo",
    ],
    perks: [
      "Merit-based digital certificate",
      "Complete project on GitHub",
      "Cloud deployment walkthrough guide",
      "Performance-based vouchers & goodies",
      "90-day recorded session access",
    ],
    eligibility: [
      "BE / B.Tech students (3rd – 8th semester)",
      "Branches: ECE, CSE, EEE, IT, Mech",
      "Basic programming (any language) helpful",
      "Laptop with internet + Arduino kit (optional)",
    ],
  },
  {
    id: "cap",
    title: "Campus Ambassador Program (CAP)",
    intro: [
      "For students who are passionate about community building, marketing, and leadership. As an AgileProjection Campus Ambassador you'll represent the brand at your college, run awareness campaigns, and coordinate events — while receiving a monthly stipend and growing your professional network.",
      "No technical background required. If you communicate well, take initiative, and want your resume to stand out, CAP is for you.",
    ],
    curriculum: [
      { week: "Week 1", text: "Onboarding, brand training, understanding the student audience, setting campaign goals" },
      { week: "Week 2", text: "Social media content creation, campus outreach, peer-to-peer recruitment drives" },
      { week: "Week 3", text: "Host a campus webinar or info session, collect feedback, coordinate with regional team" },
      { week: "Week 4", text: "Performance review, final report, referral tallying, certificate & stipend disbursement" },
    ],
    build: [
      "Verified ambassador badge on LinkedIn",
      "Real event management experience",
      "Monthly stipend based on performance",
      "Letter of Recommendation from leadership",
    ],
    perks: [
      "Monthly stipend (performance-based)",
      "Official CAP certificate",
      "Free access to all AgileProjection technical resources",
      "Priority referral for technical programs",
      "Recognition in our national ambassador network",
    ],
    eligibility: [
      "Any engineering branch / year",
      "Strong communication & interpersonal skills",
      "Active on social media platforms",
      "Minimum 1 semester remaining in college",
    ],
  },
];

// ── Schedule ──
export const SCHEDULE = [
  { name: "Embedded Systems Internship", start: "10 Aug 2026", last: "01 Aug 2026", duration: "4 Weeks", mode: "Online Live", status: "open" },
  { name: "IoT Internship", start: "01 Sep 2026", last: "20 Aug 2026", duration: "4 Weeks", mode: "Online Live", status: "open" },
  { name: "Campus Ambassador Program", start: "Rolling", last: "05 Sep 2026", duration: "1 Month", mode: "Hybrid", status: "open" },
  { name: "AI / ML Industry Internship", start: "15 Sep 2026", last: "05 Sep 2026", duration: "6 Weeks", mode: "Online Live", status: "open" },
  { name: "Full Stack Developer Track", start: "TBA", last: "TBA", duration: "4 Weeks", mode: "Online Live", status: "soon" },
];

// ── Benefits ──
export const BENEFITS = [
  { icon: "📡", title: "Live Online Delivery", desc: "Every session is taught live — not pre-recorded. You interact with mentors in real time, ask questions, and get answers on the spot. Recorded playbacks are available within 2 hours for revision." },
  { icon: "👨‍🏫", title: "Expert Industry Mentors", desc: "Our mentors are active professionals with 8–20 years of embedded, IoT, and software experience. They bring real-world context to every concept — not just textbook theory." },
  { icon: "🛠️", title: "Project-Based Learning", desc: "Every program ends with a working project you can demo to recruiters and submit to your college. 70% of session time is hands-on lab work — debugging, building, testing." },
  { icon: "🔄", title: "Unlimited Doubt Clearing", desc: "Doubt-clearing sessions every alternate day, plus a dedicated Slack channel for async questions. No question goes unanswered — mentors respond within 4 hours on weekdays." },
  { icon: "🎓", title: "AICTE-Aligned Certificate", desc: "Our merit certificates are accepted by hundreds of engineering colleges for academic credit conversion, fulfilling AICTE and most university internship mandates." },
  { icon: "🏆", title: "Perks & Recognition", desc: "Quizzes, weekly challenges, and leaderboard competitions. Top performers receive goodie packs, Amazon vouchers, LinkedIn endorsements, and featured profiles on our platform." },
  { icon: "🤝", title: "Career Support", desc: "Resume review workshops (DISHA sessions), mock interview preparation, and job board access are included for all interns who complete the program successfully." },
  { icon: "💰", title: "100% Free — Always", desc: "No registration fee. No course fee. No hidden charges — ever. AgileProjection is committed to democratising quality technical education for every engineering student in India." },
];

// ── Testimonials ──
export const TESTIMONIALS = [
  { name: "Aditya Sharma", info: "B.Tech ECE · VIT Vellore · Embedded Batch '25", color: "linear-gradient(135deg,#2563eb,#06b6d4)", quote: "The Embedded Systems internship was the best thing I did in my 3rd year. The mentors were incredibly patient and the project I built got me my first campus interview call. Completely free and genuinely worth every hour." },
  { name: "Priya Menon", info: "B.Tech CSE · NIT Trichy · IoT Batch '25", color: "linear-gradient(135deg,#7c3aed,#06b6d4)", quote: "I was sceptical about a free internship — thought it would be superficial. I was completely wrong. The IoT program had daily live sessions, real labs, and I ended up building a working smart home sensor. The certificate is on my CV and it gets noticed." },
  { name: "Rahul Joshi", info: "B.Tech Civil · BITS Pilani · CAP Batch '24", color: "linear-gradient(135deg,#059669,#06b6d4)", quote: "The Campus Ambassador Program taught me more about marketing and event management than any college subject did. I organised two successful college events and the stipend was a nice bonus. Highly recommend for non-CS students who want a strong internship." },
  { name: "Sneha Kulkarni", info: "B.Tech EEE · RVCE Bangalore · Embedded Batch '25", color: "linear-gradient(135deg,#dc2626,#f59e0b)", quote: "What I loved most was the doubt-clearing sessions — the mentors would stay back and explain until every student understood. That's rare. My project on an RTOS-based data logger was presented at my college tech fest and won first prize." },
  { name: "Kartik Verma", info: "B.Tech Mech · Delhi Technological Univ. · IoT Batch '24", color: "linear-gradient(135deg,#0891b2,#2563eb)", quote: "I joined the IoT program during my 5th semester summer break. In 4 weeks I went from barely knowing what ESP32 was to deploying a live cloud dashboard. The 70/30 practical split is real — we spent most time actually building, not listening to lectures." },
  { name: "Nidhi Patel", info: "B.Tech IT · Nirma University · Embedded Batch '24", color: "linear-gradient(135deg,#7c3aed,#ec4899)", quote: "The DISHA career workshop alone was worth it. They reviewed my resume, did a mock HR round, and helped me understand what companies actually look for. I got my internship offer within 3 weeks of completing the program." },
];

// ── Mentors / Team ──
export const MENTORS = [
  { initials: "VK", name: "Vijay Kumar", role: "Lead Mentor — Embedded", exp: "Ex-Texas Instruments · 14 yrs experience", color: "linear-gradient(135deg,#2563eb,#06b6d4)" },
  { initials: "SR", name: "Supriya Rao", role: "IoT Program Lead", exp: "Ex-Bosch · 11 yrs in Industrial IoT", color: "linear-gradient(135deg,#7c3aed,#06b6d4)" },
  { initials: "AM", name: "Anand Mehta", role: "Firmware Engineer", exp: "Ex-Qualcomm · ARM Cortex specialist", color: "linear-gradient(135deg,#059669,#06b6d4)" },
  { initials: "PN", name: "Preethi Nair", role: "Career Coach & DISHA Lead", exp: "10 yrs in engineering placement", color: "linear-gradient(135deg,#dc2626,#f59e0b)" },
  { initials: "RB", name: "Rahul Bose", role: "Full Stack Track Lead", exp: "Ex-Infosys · MERN & DSA expert", color: "linear-gradient(135deg,#0891b2,#7c3aed)" },
];

// ── FAQ ──
export const FAQS = [
  { q: "Is the internship really free? Are there any hidden charges?", a: "Yes, completely free. There is no registration fee, no course fee, no certificate fee, and no hidden charges of any kind. AgileProjection's mission is to make quality internship programs accessible to every engineering student in India, regardless of financial background." },
  { q: "Will my college accept this certificate for the internship credit requirement?", a: "Our certificates are accepted by 500+ engineering colleges across India and are designed to meet AICTE and most university internship mandate requirements. We recommend checking with your college's academic section first — most affiliated colleges accept them without any issue. We can also provide a letter of undertaking if your college needs one." },
  { q: "What equipment or software do I need?", a: "You need a laptop (Windows / Mac / Linux) with a stable internet connection. All software tools used (GCC toolchain, Arduino IDE, VS Code, Python, etc.) are free and open-source. For IoT track, having an Arduino Uno or ESP32 kit is helpful but not mandatory — simulated environments are available for students who don't have hardware." },
  { q: "What are the session timings? Can I attend if I have college classes?", a: "Sessions are typically scheduled in the evenings (6 PM – 8 PM IST) on weekdays, and Saturday mornings for lab sessions. This is designed to accommodate students who have daytime college schedules. All sessions are recorded and available within 2 hours for those who can't attend live." },
  { q: "I'm a B.E / B.Tech / MCA / M.Tech student. Which program is right for me?", a: "BE/B.Tech students (3rd semester onward) can join Embedded, IoT, or AI/ML tracks. MCA and M.Tech students are especially encouraged to join the AI/ML Industry Internship — it is designed with the depth required for postgraduate students. The Campus Ambassador Program is open to all degrees including B.Sc." },
  { q: "How is the certificate issued? Is it digital or physical?", a: "Certificates are issued digitally (PDF with a unique verification QR code) within 7 days of completing the program. They can be downloaded, printed, and shared on LinkedIn directly. A physical certificate can also be requested for a nominal courier charge. All certificates are verifiable online via our portal." },
  { q: "What if I miss a few sessions? Will I still get the certificate?", a: "Certificates are merit-based and require completing at least 80% of sessions (or watching recordings) and submitting the final project. Missing 1–2 sessions is fine as long as you catch up via recordings. If you anticipate a longer absence, reach out to your mentor early — we work with students to find solutions wherever possible." },
  { q: "Can non-engineering students apply?", a: "Our technical programs (Embedded, IoT, AI/ML) are designed specifically for engineering students. The Campus Ambassador Program is open to any college student who has strong communication skills and is passionate about outreach — engineering degree not required for CAP." },
];

// ── Resources ──
export const RESOURCES = [
  { icon: "📚", title: "Technical Resource Library", desc: "Free course material covering Embedded C, Linux internals, IoT protocols, RTOS, ARM architecture, and more. Updated every quarter with new content from our mentors.", link: "Explore Library", href: "#ai-assistant" },
  { icon: "💬", title: "AI Learning Assistant", desc: "Ask our AI-powered assistant any technical or career question — from 'how do I start my final year AI project' to 'which domain suits my branch'. Built specifically for BE / B.Tech / MCA / M.Tech students.", link: "Ask the AI →", href: "#ai-assistant" },
  { icon: "📝", title: "NT-AI's End-to-End ML Project", desc: "A complete, in-portal walkthrough by NT-AI — building a Housing Price Prediction regression model from raw CSV to deployed API. Covers data ingestion, EDA, feature engineering, modelling, evaluation and deployment with real Python/Scikit-Learn code at every stage.", link: "Open the walkthrough →", href: "#nt-ai-ml" },
  { icon: "🎓", title: "Career & Technical Blog", desc: "Practical guides: building your first IoT project, cracking embedded systems interviews, writing a resume that gets callbacks, and understanding the AI/ML job market in 2026.", link: "Read Articles →", href: "#ai-assistant" },
];

// ── IT Courses ──
export type Course = {
  icon: string;
  thumb: string;
  badges: { label: string; cls: string }[];
  title: string;
  desc: string;
  meta: string[];
  rating: string;
  reviews: string;
  price: string;
};

export const COURSES: Course[] = [
  {
    icon: "⚙️",
    thumb: "linear-gradient(135deg,#071a30,#0a2a20)",
    badges: [{ label: "Bestseller", cls: "amber" }, { label: "SAP Certified", cls: "cyan" }],
    title: "SAP Ariba: Complete Procurement & Supply Chain Mastery",
    desc: "Hands-on training covering sourcing, contracts, supplier collaboration, and buying with real-world enterprise project scenarios. Includes live Ariba sandbox access.",
    meta: ["48 hrs content", "Live sessions", "Certificate included"],
    rating: "4.9", reviews: "3.2K", price: "FREE",
  },
  {
    icon: "☁️",
    thumb: "linear-gradient(135deg,#071a30,#1a0a30)",
    badges: [{ label: "Hot", cls: "red" }, { label: "Cloud", cls: "cyan" }],
    title: "SAP BTP: Business Technology Platform — Complete Guide",
    desc: "Master SAP's cloud platform for application development, integration, and AI services. Covers CAP framework, Fiori, KYMA, and real BTP system access throughout.",
    meta: ["36 hrs content", "Live sessions", "Certificate included"],
    rating: "4.8", reviews: "2.1K", price: "FREE",
  },
  {
    icon: "📦",
    thumb: "linear-gradient(135deg,#071a30,#1a1500)",
    badges: [{ label: "S/4HANA", cls: "cyan" }],
    title: "SAP MM: Materials Management Complete Guide",
    desc: "Master procurement cycles, inventory management, and materials planning with live S/4HANA system access. Covers P2P, vendor evaluation, invoice verification, and more.",
    meta: ["40 hrs content", "Live sessions", "Certificate included"],
    rating: "4.7", reviews: "1.8K", price: "FREE",
  },
  {
    icon: "🤖",
    thumb: "linear-gradient(135deg,#071a30,#1a0020)",
    badges: [{ label: "New", cls: "indigo" }, { label: "AI", cls: "red" }],
    title: "AI & Machine Learning for SAP — SAP AI Core & Launchpad",
    desc: "Build and deploy AI models on SAP's enterprise stack. Covers Generative AI, NLP, ML pipelines, SAP AI Core, and real enterprise AI use cases with Python and SAP tools.",
    meta: ["32 hrs content", "Live sessions", "Certificate included"],
    rating: "4.9", reviews: "980", price: "FREE",
  },
  {
    icon: "🖥️",
    thumb: "linear-gradient(135deg,#071a30,#102000)",
    badges: [{ label: "Popular", cls: "amber" }, { label: "Free", cls: "green" }],
    title: "Full Stack Web Development — MERN Stack + DSA",
    desc: "Complete full-stack bootcamp: React, Node.js, Express, MongoDB, REST APIs, authentication, cloud deployment, and interview-ready DSA preparation in one comprehensive program.",
    meta: ["60 hrs content", "Live sessions", "Certificate included"],
    rating: "4.8", reviews: "2.4K", price: "FREE",
  },
  {
    icon: "🔧",
    thumb: "linear-gradient(135deg,#071a30,#001a2a)",
    badges: [{ label: "AWS + Azure", cls: "cyan" }],
    title: "Cloud & DevOps: AWS, Azure, Docker, Kubernetes & CI/CD",
    desc: "From cloud fundamentals to deploying containerised microservices — covers AWS core services, Azure fundamentals, Docker, Kubernetes, Jenkins CI/CD, and Terraform IaC.",
    meta: ["44 hrs content", "Live sessions", "Certificate included"],
    rating: "4.7", reviews: "1.5K", price: "FREE",
  },
  {
    icon: "🔐",
    thumb: "linear-gradient(135deg,#071a30,#200a00)",
    badges: [{ label: "New 2026", cls: "indigo" }],
    title: "Cybersecurity Fundamentals — Ethical Hacking & SOC Analyst",
    desc: "Network security, penetration testing, vulnerability assessment, SIEM tools, and SOC operations. Aligned with CompTIA Security+ and CEH certification objectives.",
    meta: ["38 hrs content", "Live sessions", "Cert-aligned"],
    rating: "4.8", reviews: "760", price: "FREE",
  },
  {
    icon: "📊",
    thumb: "linear-gradient(135deg,#071a30,#001020)",
    badges: [{ label: "Trending", cls: "amber" }],
    title: "Data Analytics & Business Intelligence — Python, Power BI & SQL",
    desc: "End-to-end data analytics: SQL querying, Python (Pandas, NumPy, Matplotlib), Power BI dashboards, and storytelling with data for business decision-making.",
    meta: ["42 hrs content", "Live sessions", "Certificate included"],
    rating: "4.8", reviews: "1.9K", price: "FREE",
  },
];

// ── AI/ML Project catalog (LOV) ──
export type Project = { id: number; name: string; tags: string };
export type Category = {
  key: string;
  icon: string;
  label: string;
  sub: string;
  projects: Project[];
};

export const CATEGORIES: Category[] = [
  {
    key: "gen-ai", icon: "🤖", label: "Generative AI & LLM", sub: "10 projects · RAG, Chatbots, LLMs",
    projects: [
      { id: 1, name: "Enterprise RAG-Based AI Knowledge Assistant", tags: "RAG · LLM · Vector DB" },
      { id: 2, name: "AI Customer Support Chatbot using LLM + RAG", tags: "Chatbot · LangChain · FastAPI" },
      { id: 3, name: "AI Resume Screening & Job Recommendation System", tags: "NLP · Matching · HR AI" },
      { id: 4, name: "Multilingual AI Chatbot for Global Customer Service", tags: "Multilingual · LLM · APIs" },
      { id: 5, name: "AI Document Question-Answering System", tags: "QA · Embeddings · RAG" },
      { id: 6, name: "Intelligent PDF Research Assistant using RAG", tags: "PDF · RAG · LangChain" },
      { id: 7, name: "AI Meeting Summarization & Action-Item Generator", tags: "NLP · Summarization · Audio" },
      { id: 8, name: "AI Email Classification & Smart Reply Assistant", tags: "Email · NLP · BERT" },
      { id: 9, name: "LLM-Based Legal Document Analysis Assistant", tags: "Legal AI · NLP · Document" },
      { id: 10, name: "AI Research Paper Summarization System", tags: "Summarization · Transformers" },
    ],
  },
  {
    key: "cv", icon: "👁️", label: "Computer Vision", sub: "10 projects · YOLO, Detection, Classification",
    projects: [
      { id: 11, name: "Real-Time Object Detection & Tracking using YOLO", tags: "YOLO · OpenCV · Real-time" },
      { id: 12, name: "AI-Based Industrial Defect Detection", tags: "CNN · Quality Control · Vision" },
      { id: 13, name: "Smart Traffic Monitoring & Vehicle Detection", tags: "YOLO · Traffic · Analytics" },
      { id: 14, name: "Automatic Number Plate Recognition System", tags: "OCR · ANPR · OpenCV" },
      { id: 15, name: "Driver Drowsiness Detection System", tags: "Face Detection · Alert · Safety" },
      { id: 16, name: "PPE Safety Compliance Detection", tags: "YOLO · Safety · Industrial" },
      { id: 17, name: "AI-Based Face Recognition Attendance System", tags: "Face Recognition · Attendance" },
      { id: 18, name: "AI Retail Shelf Monitoring System", tags: "Object Detection · Retail · CV" },
      { id: 19, name: "AI-Based Crowd Density Detection", tags: "Density · Crowd · Vision" },
      { id: 20, name: "Satellite Image Classification using Deep Learning", tags: "CNN · Remote Sensing · GIS" },
    ],
  },
  {
    key: "ml", icon: "📊", label: "ML & Predictive Analytics", sub: "10 projects · Churn, Fraud, Forecasting",
    projects: [
      { id: 21, name: "Housing Price Prediction using Regression (End-to-End ML)", tags: "Regression · Feature Engg · Deployment" },
      { id: 22, name: "Customer Churn Prediction System", tags: "Classification · CRM · Business" },
      { id: 23, name: "Credit Risk Prediction using Machine Learning", tags: "Risk · Finance · XGBoost" },
      { id: 24, name: "Fraud Detection & Anomaly Detection System", tags: "Anomaly · Banking · ML" },
      { id: 25, name: "Sales Forecasting System", tags: "Time Series · Forecasting · ARIMA" },
      { id: 26, name: "Demand Forecasting for Retail", tags: "Retail · Inventory · ML" },
      { id: 27, name: "Student Placement Prediction System", tags: "Classification · Education · HR" },
      { id: 28, name: "Employee Attrition Prediction", tags: "HR Analytics · Classification" },
      { id: 29, name: "Loan Default Prediction", tags: "Finance · Risk · XGBoost" },
      { id: 30, name: "Predictive Maintenance System", tags: "IoT · Sensors · Maintenance" },
    ],
  },
  {
    key: "nlp", icon: "📝", label: "NLP & Transformers", sub: "10 projects · BERT, Sentiment, Classification",
    projects: [
      { id: 31, name: "Multilingual Customer Support Ticket Classification", tags: "NLP · BERT · Multilingual" },
      { id: 32, name: "Fake News Detection using Transformers", tags: "NLP · BERT · Classification" },
      { id: 33, name: "Sentiment Analysis of Product Reviews", tags: "Sentiment · NLP · E-commerce" },
      { id: 34, name: "AI News Article Summarizer", tags: "Summarization · NLP · Transformers" },
      { id: 35, name: "Spam & Phishing Email Detection using BERT", tags: "BERT · Email · Security" },
      { id: 36, name: "Text Classification using BERT", tags: "BERT · Classification · NLP" },
      { id: 37, name: "Named Entity Recognition System", tags: "NER · spaCy · Information Extraction" },
      { id: 38, name: "Multilingual Document Classification", tags: "Multilingual · NLP · BERT" },
      { id: 39, name: "AI Complaint Classification System", tags: "Classification · CRM · NLP" },
      { id: 40, name: "Voice-to-Text + NLP Analysis System", tags: "ASR · NLP · Speech AI" },
    ],
  },
  {
    key: "industry", icon: "🏭", label: "AI for Industry 4.0", sub: "10 projects · Manufacturing, Smart Factory",
    projects: [
      { id: 41, name: "AI Predictive Maintenance for Industrial Machines", tags: "IoT · Sensors · ML" },
      { id: 42, name: "AI Manufacturing Defect Detection", tags: "Computer Vision · Quality" },
      { id: 43, name: "Machine Failure Prediction using Sensor Data", tags: "Time Series · IoT · ML" },
      { id: 44, name: "AI Production Quality Prediction", tags: "Quality · Manufacturing · ML" },
      { id: 45, name: "Smart Factory Anomaly Detection", tags: "Anomaly · IIoT · Real-time" },
      { id: 46, name: "AI-Based Inventory Demand Forecasting", tags: "Inventory · Forecasting · ML" },
      { id: 47, name: "AI Supply Chain Optimization", tags: "Optimization · Logistics · ML" },
      { id: 48, name: "Industrial Safety Violation Detection", tags: "CV · Safety · PPE · YOLO" },
      { id: 49, name: "Digital Twin Analytics using AI", tags: "Digital Twin · Simulation · ML" },
      { id: 50, name: "AI Energy Consumption Prediction", tags: "Energy · IoT · Forecasting" },
    ],
  },
  {
    key: "healthcare", icon: "🏥", label: "Healthcare AI", sub: "8 projects · Medical Imaging, Disease Risk",
    projects: [
      { id: 51, name: "Disease Risk Prediction using ML", tags: "Healthcare · Classification · Risk" },
      { id: 52, name: "Medical Image Classification", tags: "CNN · Medical · Imaging" },
      { id: 53, name: "Pneumonia Detection from X-Ray Images", tags: "CNN · X-Ray · Medical AI" },
      { id: 54, name: "Patient Readmission Prediction", tags: "Healthcare · ML · Hospital" },
      { id: 55, name: "Healthcare Appointment Prediction", tags: "ML · Hospital · Scheduling" },
      { id: 56, name: "Medical Report Classification using NLP", tags: "NLP · Medical · BERT" },
      { id: 57, name: "AI-Based Symptom Analysis Assistant", tags: "Healthcare AI · NLP · Chatbot" },
      { id: 58, name: "Hospital Resource Demand Forecasting", tags: "Forecasting · Hospital · ML" },
    ],
  },
  {
    key: "cyber", icon: "🔐", label: "Cybersecurity + AI", sub: "7 projects · Malware, Intrusion, Fraud",
    projects: [
      { id: 59, name: "AI-Based Malware Classification", tags: "Security · ML · Malware" },
      { id: 60, name: "Phishing Email Detection using BERT", tags: "BERT · Phishing · NLP" },
      { id: 61, name: "Network Intrusion Detection using ML", tags: "IDS · Network · ML" },
      { id: 62, name: "Anomaly Detection in Network Traffic", tags: "Anomaly · Security · ML" },
      { id: 63, name: "AI-Based Fraud Transaction Detection", tags: "Fraud · Finance · ML" },
      { id: 64, name: "Bot Detection using Machine Learning", tags: "Bot · Security · Classification" },
      { id: 65, name: "Malicious URL Classification", tags: "URL · Security · NLP" },
    ],
  },
  {
    key: "recom", icon: "🎯", label: "Recommendation & Personalisation", sub: "7 projects · Movies, E-Commerce, Learning",
    projects: [
      { id: 66, name: "AI Movie Recommendation System", tags: "Collaborative Filtering · ML" },
      { id: 67, name: "E-Commerce Product Recommendation", tags: "Recommendation · Retail · ML" },
      { id: 68, name: "Job Recommendation Engine", tags: "NLP · Jobs · Matching" },
      { id: 69, name: "Personalized Learning Recommendation System", tags: "EdTech · NLP · ML" },
      { id: 70, name: "AI Travel Recommendation System", tags: "Travel · NLP · Filtering" },
      { id: 71, name: "News Recommendation Engine", tags: "NLP · News · Personalisation" },
      { id: 72, name: "Music Recommendation System", tags: "Audio · ML · Collaborative Filtering" },
    ],
  },
  {
    key: "advanced", icon: "🔬", label: "Advanced / Research AI", sub: "8 projects · XAI, Federated Learning, Edge AI",
    projects: [
      { id: 73, name: "Explainable AI using SHAP/LIME", tags: "XAI · Interpretability · ML" },
      { id: 74, name: "Federated Learning for Privacy-Preserving ML", tags: "Federated · Privacy · ML" },
      { id: 75, name: "Edge AI / TinyML Model Deployment", tags: "Edge · TinyML · IoT" },
      { id: 76, name: "Vision Transformer for Image Classification", tags: "ViT · Transformers · CV" },
      { id: 77, name: "Multimodal Vision-Language AI Assistant", tags: "Multimodal · LLM · Vision" },
      { id: 78, name: "Reinforcement Learning for Autonomous Decision Making", tags: "RL · Agent · Decision" },
      { id: 79, name: "AI-Based Semantic Image Search", tags: "Embeddings · CLIP · Search" },
      { id: 80, name: "AI Agent for Automated Business Processes", tags: "Agent · Automation · LLM" },
    ],
  },
  {
    key: "other", icon: "⚙️", label: "Embedded / IoT / Full Stack", sub: "Classic AgileProjection tracks",
    projects: [
      { id: 81, name: "Embedded Systems Internship", tags: "C/C++ · ARM · RTOS · Firmware" },
      { id: 82, name: "Internet of Things (IoT) Internship", tags: "ESP32 · MQTT · Cloud · Sensors" },
      { id: 83, name: "Full Stack Developer Track", tags: "MERN · React · Node.js · MongoDB" },
      { id: 84, name: "Campus Ambassador Program", tags: "Leadership · Marketing · Non-Tech" },
    ],
  },
];

// ── AI/ML program curriculum (the 6-week ML pipeline, mapped to NT-AI's
//    in-portal end-to-end housing-price regression project at #nt-ai-ml) ──
export const AIML_CURRICULUM = [
  { week: "Week 1", title: "Python for ML · Data Ingestion", text: "NumPy / Pandas / Matplotlib, loading datasets (CSV, API, DB), handling missing values, basic EDA. You'll work with the California Housing dataset — the exact sandbox used in NT-AI's end-to-end ML project." },
  { week: "Week 2", title: "Exploratory Data Analysis & Visualisation", text: "Univariate & multivariate analysis, correlation heatmaps, geographical scatter (lat/long), feature-target relationships — the same EDA flow used in NT-AI's housing-price regression project (Stage 2)." },
  { week: "Week 3", title: "Feature Engineering & Pipeline Design", text: "Handling categorical & numerical attributes, custom transformers, full Scikit-Learn pipeline, train/val stratified split — replicating Stage 3 of NT-AI's ML project." },
  { week: "Week 4", title: "Model Training & Tuning", text: "Linear Regression, Decision Tree, Random Forest, Gradient Boosting. Cross-validation, RMSE evaluation, RandomizedSearchCV hyperparameter tuning — the model zoo from NT-AI's housing-price walkthrough (Stage 4)." },
  { week: "Week 5", title: "Model Evaluation & Explainability", text: "Feature importance, error analysis, SHAP/LIME interpretation, confidence intervals — understanding why your model makes the predictions it does (Stage 5)." },
  { week: "Week 6", title: "Deployment & Capstone Demo", text: "FastAPI serving, Streamlit dashboard, model versioning, presenting to an industry panel. You ship a working AI product, not just a notebook (Stage 6)." },
];

export const AIML_FEATURES = [
  { icon: "🧠", title: "80+ Industry Projects", desc: "Pick from Gen-AI, Computer Vision, NLP, ML, Healthcare AI, Cybersecurity + AI, Recommendation Systems, Industry 4.0, Research AI, and more." },
  { icon: "📊", title: "End-to-End ML Pipeline", desc: "Built around the complete ML lifecycle (data ingestion → EDA → feature engineering → modelling → tuning → deployment) using NT-AI's housing-price regression project as the reference architecture." },
  { icon: "🎓", title: "PG-Depth Curriculum", desc: "Designed for BE / B.Tech final-year, M.Tech and MCA students. Project complexity and mentorship depth is calibrated for postgraduate learning outcomes." },
  { icon: "🏆", title: "Industry Mentor Reviews", desc: "Weekly code reviews by working ML engineers, capstone presentation to an industry panel, and a verifiable completion certificate with project GitHub link." },
];

// ── Form option lists (shared by frontend + backend) ──
export const DEGREES = ["BE / B.Tech", "ME / M.Tech", "MCA", "B.Sc Engineering"];
export const BRANCHES = [
  "Computer Science Engineering",
  "Information Technology",
  "AI & Data Science",
  "AI & Machine Learning",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Other",
];
export const SEMESTERS = ["3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"];
export const PLANS = [
  "Basic — ₹1,499",
  "Standard — ₹2,499",
  "Professional — ₹3,999",
  "Premium / Job-Oriented — ₹4,999",
];
export const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Other",
];
export const SOURCES = [
  "Social Media (Instagram / LinkedIn)",
  "Google Search",
  "Friend / Classmate Referral",
  "College Notice Board",
  "Email",
  "YouTube",
  "Other",
];

// ── 6-stage internship journey (universal ML lifecycle). ──
export type ProjectStage = {
  step: number;
  week: string;
  title: string;
  desc: string;
  deliverable: string;
  icon: string;
};

export const PROJECT_STAGES: ProjectStage[] = [
  { step: 1, week: "Week 1", title: "Data Ingestion & Setup", desc: "Pull the dataset for your chosen project. Load into Pandas, inspect shape/dtypes/nulls, set up the project structure (notebooks/, src/, models/, data/).", deliverable: "A clean DataFrame + project skeleton committed to GitHub.", icon: "📥" },
  { step: 2, week: "Week 2", title: "Exploratory Data Analysis (EDA)", desc: "Plot distributions, correlation heatmaps, and (where relevant) geographical/grouped scatters. Identify skew, outliers, and the features most correlated with the target.", deliverable: "An EDA notebook with 4-6 key charts + a findings write-up.", icon: "📊" },
  { step: 3, week: "Week 3", title: "Feature Engineering & Pipeline", desc: "Build a Scikit-Learn Pipeline: imputation, custom transformers, scaling, one-hot. Combine numeric + categorical in a ColumnTransformer so preprocessing is reproducible + deploy-safe.", deliverable: "A full preprocessing Pipeline + a stratified train/val split.", icon: "🔧" },
  { step: 4, week: "Week 4", title: "Model Training & Tuning", desc: "Train several baselines (e.g. Linear/DecisionTree/RandomForest/GradientBoosting). Cross-validate with RMSE/accuracy, then tune the best via RandomizedSearchCV. Persist with joblib.", deliverable: "A tuned model artifact (models/<name>.pkl) + CV scores.", icon: "🧠" },
  { step: 5, week: "Week 5", title: "Evaluation & Explainability", desc: "Score on the held-out test set. Residual / confusion-matrix analysis. Use SHAP/LIME to explain which features drive each prediction.", deliverable: "Test-set metrics + a SHAP beeswarm + a residual plot.", icon: "🎯" },
  { step: 6, week: "Week 6", title: "Deployment & Capstone Demo", desc: "Serve the model behind a FastAPI endpoint + a Streamlit dashboard. Containerise with Docker. Present the end-to-end project to an industry panel + hand off on GitHub.", deliverable: "Live API + dashboard + a 10-min capstone demo to the panel.", icon: "🚀" },
];

// ── Structured lessons per stage (3-4 lessons per module = ~21 total) ──
// Each lesson has: id (stage-lessonNum), stage, title, desc, duration (mins)
export type Lesson = {
  id: string;        // e.g. "1-1" (stage 1, lesson 1)
  stage: number;     // 1-6
  title: string;
  desc: string;
  duration: number;  // estimated minutes
};

export const LESSONS: Lesson[] = [
  // Stage 1: Data Ingestion & Setup
  { id: "1-1", stage: 1, title: "Setting Up Your Environment", desc: "Install Python 3.10+, create a virtual env, install Pandas/NumPy/Scikit-Learn. Set up the project folder structure (notebooks/, src/, models/, data/).", duration: 30 },
  { id: "1-2", stage: 1, title: "Loading Data with Pandas", desc: "Read CSV/Excel into a DataFrame. Inspect shape, dtypes, head/tail. Handle encoding issues + parse dates.", duration: 45 },
  { id: "1-3", stage: 1, title: "Data Quality Check", desc: "Count nulls per column. Identify duplicates. Check for mixed types. Write a data-quality report function.", duration: 40 },
  { id: "1-4", stage: 1, title: "Git Setup + Project Skeleton", desc: "Initialize a Git repo, create .gitignore, commit the project skeleton. Push to GitHub.", duration: 25 },

  // Stage 2: EDA
  { id: "2-1", stage: 2, title: "Univariate Analysis", desc: "Plot distributions (histograms, box plots) for each numeric feature. Identify skewness + outliers.", duration: 40 },
  { id: "2-2", stage: 2, title: "Bivariate Analysis + Correlations", desc: "Scatter plots, correlation heatmaps. Identify the features most correlated with the target.", duration: 45 },
  { id: "2-3", stage: 2, title: "Categorical Analysis", desc: "Group-by aggregations, bar charts for categorical features. Chi-square tests for independence.", duration: 35 },
  { id: "2-4", stage: 2, title: "EDA Findings Write-up", desc: "Summarize 4-6 key findings from your EDA. What features matter? What needs cleaning? What patterns did you find?", duration: 30 },

  // Stage 3: Feature Engineering
  { id: "3-1", stage: 3, title: "Handling Missing Data", desc: "SimpleImputer, KNN imputer. Decide drop vs impute based on null percentage + feature importance.", duration: 40 },
  { id: "3-2", stage: 3, title: "Encoding Categorical Variables", desc: "OneHotEncoder, OrdinalEncoder, target encoding. When to use each. Avoid the dummy variable trap.", duration: 45 },
  { id: "3-3", stage: 3, title: "Building a Scikit-Learn Pipeline", desc: "Create a ColumnTransformer + Pipeline. Combine numeric + categorical preprocessing. Make it reproducible.", duration: 50 },
  { id: "3-4", stage: 3, title: "Train/Validation Split", desc: "Stratified train/val split. Why stratify? Set up the split so the pipeline sees only training data.", duration: 25 },

  // Stage 4: Model Training
  { id: "4-1", stage: 4, title: "Baseline Models", desc: "Train Linear/DecisionTree/RandomForest/GradientBoosting. Compare cross-validation scores (RMSE/accuracy).", duration: 50 },
  { id: "4-2", stage: 4, title: "Hyperparameter Tuning", desc: "RandomizedSearchCV on the best baseline. Tune n_estimators, max_depth, learning_rate. Use parallel jobs.", duration: 60 },
  { id: "4-3", stage: 4, title: "Model Persistence", desc: "Save the tuned model with joblib. Load + verify. Create a predict() function for inference.", duration: 25 },

  // Stage 5: Evaluation
  { id: "5-1", stage: 5, title: "Test-Set Evaluation", desc: "Score on the held-out test set. Compare with validation. Check for overfitting/underfitting.", duration: 35 },
  { id: "5-2", stage: 5, title: "Residual / Confusion Matrix Analysis", desc: "For regression: residual plots, Q-Q plots. For classification: confusion matrix, precision/recall, ROC curve.", duration: 45 },
  { id: "5-3", stage: 5, title: "Model Explainability with SHAP", desc: "Install SHAP. Generate a beeswarm plot. Explain which features drive individual predictions.", duration: 50 },

  // Stage 6: Deployment
  { id: "6-1", stage: 6, title: "FastAPI Model Endpoint", desc: "Create a FastAPI app with a /predict endpoint. Load the saved model. Accept JSON input, return predictions.", duration: 55 },
  { id: "6-2", stage: 6, title: "Streamlit Dashboard", desc: "Build a Streamlit dashboard with input widgets + a prediction display. Connect to the FastAPI backend.", duration: 50 },
  { id: "6-3", stage: 6, title: "Capstone Demo Prep", desc: "Prepare a 10-minute demo: problem statement, EDA highlights, model choice, evaluation metrics, live API + dashboard. Present to the panel.", duration: 40 },
];

// ── MCQ question bank — 3 questions per module (18 total) ──
export type QuizQuestion = {
  id: string;
  stage: number;
  question: string;
  options: string[];
  correct: number; // index 0-3
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Stage 1: Data Ingestion
  { id: "q1-1", stage: 1, question: "Which Pandas method reads a CSV file into a DataFrame?", options: ["pd.read_excel()", "pd.read_csv()", "pd.load_csv()", "pd.import_csv()"], correct: 1 },
  { id: "q1-2", stage: 1, question: "What does df.shape return?", options: ["Number of rows only", "Number of columns only", "A tuple (rows, columns)", "Data types of all columns"], correct: 2 },
  { id: "q1-3", stage: 1, question: "Which method checks for missing values in a DataFrame?", options: ["df.isnull()", "df.missing()", "df.check_nulls()", "df.isnan()"], correct: 0 },

  // Stage 2: EDA
  { id: "q2-1", stage: 2, question: "Which plot is best for visualizing the distribution of a single numeric variable?", options: ["Pie chart", "Histogram", "Scatter plot", "Bar chart"], correct: 1 },
  { id: "q2-2", stage: 2, question: "What does a correlation heatmap show?", options: ["Missing values", "Pairwise correlations between features", "Data types", "Row counts"], correct: 1 },
  { id: "q2-3", stage: 2, question: "Which statistic measures the asymmetry of a distribution?", options: ["Kurtosis", "Skewness", "Variance", "Standard deviation"], correct: 1 },

  // Stage 3: Feature Engineering
  { id: "q3-1", stage: 3, question: "Which Scikit-Learn class handles missing values by replacing them?", options: ["StandardScaler", "SimpleImputer", "OneHotEncoder", "PCA"], correct: 1 },
  { id: "q3-2", stage: 3, question: "What does OneHotEncoder do?", options: ["Scales numeric features", "Reduces dimensionality", "Converts categorical values to binary columns", "Imputes missing data"], correct: 2 },
  { id: "q3-3", stage: 3, question: "Why use a Scikit-Learn Pipeline?", options: ["To visualize data", "To chain preprocessing + modeling steps reproducibly", "To speed up training", "To reduce memory"], correct: 1 },

  // Stage 4: Model Training
  { id: "q4-1", stage: 4, question: "Which metric is used for regression model evaluation?", options: ["Accuracy", "RMSE", "F1-score", "Precision"], correct: 1 },
  { id: "q4-2", stage: 4, question: "What does cross-validation help prevent?", options: ["Overfitting", "Underfitting", "Data leakage", "Slow training"], correct: 0 },
  { id: "q4-3", stage: 4, question: "Which method saves a trained model to disk?", options: ["model.save()", "joblib.dump()", "model.export()", "pickle.write()"], correct: 1 },

  // Stage 5: Evaluation
  { id: "q5-1", stage: 5, question: "What does a confusion matrix show?", options: ["Feature importance", "True/False positives + negatives", "Training time", "Model complexity"], correct: 1 },
  { id: "q5-2", stage: 5, question: "What does SHAP help with?", options: ["Faster training", "Explaining which features drive predictions", "Reducing dataset size", "Encoding categories"], correct: 1 },
  { id: "q5-3", stage: 5, question: "Which plot is used to check regression residuals for normality?", options: ["Q-Q plot", "Bar chart", "Pie chart", "Heatmap"], correct: 0 },

  // Stage 6: Deployment
  { id: "q6-1", stage: 6, question: "Which Python framework is commonly used to serve ML models as APIs?", options: ["Django", "FastAPI", "Flask-SQLAlchemy", "Tkinter"], correct: 1 },
  { id: "q6-2", stage: 6, question: "What does Docker help with in ML deployment?", options: ["Faster training", "Containerizing the app for reproducible deployment", "Data cleaning", "Feature engineering"], correct: 1 },
  { id: "q6-3", stage: 6, question: "What is a capstone demo?", options: ["A written exam", "A final project presentation to an industry panel", "A coding contest", "A group discussion"], correct: 1 },
];

export const QUIZ_PASS_THRESHOLD = 60; // 60% to pass

// ── College seed list (Indian engineering colleges) ──
// Used to auto-seed the College table on first API call. Students can also
// add new colleges during registration (saved with source = "student-added").
export const COLLEGES_SEED: { name: string; state: string }[] = [
  { name: "VIT Vellore", state: "Tamil Nadu" },
  { name: "VIT Chennai", state: "Tamil Nadu" },
  { name: "VIT Bhopal", state: "Madhya Pradesh" },
  { name: "VIT AP", state: "Andhra Pradesh" },
  { name: "NIT Trichy", state: "Tamil Nadu" },
  { name: "NIT Surathkal", state: "Karnataka" },
  { name: "NIT Warangal", state: "Telangana" },
  { name: "NIT Calicut", state: "Kerala" },
  { name: "NIT Rourkela", state: "Odisha" },
  { name: "NIT Jaipur", state: "Rajasthan" },
  { name: "NIT Nagpur", state: "Maharashtra" },
  { name: "NIT Bhopal", state: "Madhya Pradesh" },
  { name: "BITS Pilani", state: "Rajasthan" },
  { name: "BITS Goa", state: "Goa" },
  { name: "BITS Hyderabad", state: "Telangana" },
  { name: "IIIT Hyderabad", state: "Telangana" },
  { name: "IIIT Bangalore", state: "Karnataka" },
  { name: "IIIT Delhi", state: "Delhi" },
  { name: "IIIT Allahabad", state: "Uttar Pradesh" },
  { name: "IIIT Lucknow", state: "Uttar Pradesh" },
  { name: "IIITDM Kancheepuram", state: "Tamil Nadu" },
  { name: "IIT Madras", state: "Tamil Nadu" },
  { name: "IIT Bombay", state: "Maharashtra" },
  { name: "IIT Delhi", state: "Delhi" },
  { name: "IIT Kanpur", state: "Uttar Pradesh" },
  { name: "IIT Kharagpur", state: "West Bengal" },
  { name: "IIT Roorkee", state: "Uttarakhand" },
  { name: "IIT Guwahati", state: "Assam" },
  { name: "IIT BHU Varanasi", state: "Uttar Pradesh" },
  { name: "IIT Indore", state: "Madhya Pradesh" },
  { name: "IIT Mandi", state: "Himachal Pradesh" },
  { name: "IIT Jodhpur", state: "Rajasthan" },
  { name: "IIT Patna", state: "Bihar" },
  { name: "IIT Ropar", state: "Punjab" },
  { name: "SRM Institute of Technology", state: "Tamil Nadu" },
  { name: "SRM University AP", state: "Andhra Pradesh" },
  { name: "Amrita Vishwa Vidyapeetham", state: "Tamil Nadu" },
  { name: "Manipal Institute of Technology", state: "Karnataka" },
  { name: "Symbiosis Institute of Technology", state: "Maharashtra" },
  { name: "Thapar Institute of Engineering & Technology", state: "Punjab" },
  { name: "RV College of Engineering (RVCE)", state: "Karnataka" },
  { name: "BMS College of Engineering", state: "Karnataka" },
  { name: "PES University", state: "Karnataka" },
  { name: "MS Ramaiah Institute of Technology", state: "Karnataka" },
  { name: "Delhi Technological University (DTU)", state: "Delhi" },
  { name: "NSUT Delhi", state: "Delhi" },
  { name: "IGDTUW Delhi", state: "Delhi" },
  { name: "Indraprastha Institute (IIIT-D)", state: "Delhi" },
  { name: "Jamia Millia Islamia", state: "Delhi" },
  { name: "Jadavpur University", state: "West Bengal" },
  { name: "KIIT Bhubaneswar", state: "Odisha" },
  { name: "SASTRA Thanjavur", state: "Tamil Nadu" },
  { name: "BITS Pilani Goa Campus", state: "Goa" },
  { name: "College of Engineering Pune (COEP)", state: "Maharashtra" },
  { name: "Veermata Jijabai Technological Institute (VJTI)", state: "Maharashtra" },
  { name: "Sardar Patel College of Engineering", state: "Maharashtra" },
  { name: "Nirma University", state: "Gujarat" },
  { name: "Nirma Institute of Technology", state: "Gujarat" },
  { name: "LD College of Engineering", state: "Gujarat" },
  { name: "NIT Surat (SVNIT)", state: "Gujarat" },
  { name: "Dhirubhai Ambani Institute (DA-IICT)", state: "Gujarat" },
  { name: "PDPU Gandhinagar", state: "Gujarat" },
  { name: "Chandigarh University", state: "Punjab" },
  { name: "Thapar University Patiala", state: "Punjab" },
  { name: "Guru Nanak Dev Engineering College", state: "Punjab" },
  { name: "Anna University", state: "Tamil Nadu" },
  { name: "Anna University (CEG)", state: "Tamil Nadu" },
  { name: "Anna University (MIT)", state: "Tamil Nadu" },
  { name: "SSN College of Engineering", state: "Tamil Nadu" },
  { name: "RMK Engineering College", state: "Tamil Nadu" },
  { name: "Sri Sairam Engineering College", state: "Tamil Nadu" },
  { name: "JNTUH College of Engineering", state: "Telangana" },
  { name: "JNTUK Kakinada", state: "Andhra Pradesh" },
  { name: "JNTUA Anantapur", state: "Andhra Pradesh" },
  { name: "CBIT Hyderabad", state: "Telangana" },
  { name: "MGIT Hyderabad", state: "Telangana" },
  { name: "VNR VJIET Hyderabad", state: "Telangana" },
  { name: "BVRIT Hyderabad", state: "Telangana" },
  { name: "UPES Dehradun", state: "Uttarakhand" },
  { name: "Graphic Era University", state: "Uttarakhand" },
  { name: "Amity University Noida", state: "Uttar Pradesh" },
  { name: "Amity University Lucknow", state: "Uttar Pradesh" },
  { name: "Sharda University", state: "Uttar Pradesh" },
  { name: "Galgotias University", state: "Uttar Pradesh" },
  { name: "GL Bajaj Institute", state: "Uttar Pradesh" },
  { name: "AKGEC Ghaziabad", state: "Uttar Pradesh" },
  { name: "KIET Group of Institutions", state: "Uttar Pradesh" },
  { name: "ABES Engineering College", state: "Uttar Pradesh" },
  { name: "JSS Academy of Technical Education", state: "Uttar Pradesh" },
  { name: "Ramaiah Institute of Technology", state: "Karnataka" },
  { name: "Dayananda Sagar College of Engineering", state: "Karnataka" },
  { name: "BNM Institute of Technology", state: "Karnataka" },
  { name: "Nitte Meenakshi Institute", state: "Karnataka" },
  { name: "Symbiosis Centre for Management Studies", state: "Maharashtra" },
  { name: "Mody University", state: "Rajasthan" },
];
