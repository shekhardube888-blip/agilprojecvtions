import Link from "next/link";
import {
  ArrowRight,
  Database,
  BarChart3,
  Filter,
  Brain,
  Target,
  Rocket,
  Github,
  GraduationCap,
  CheckCircle2,
  Quote,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── NT-AI — End-to-End ML Project: Housing Price Prediction ──
// This is the in-portal reference architecture that replaces the external
// Medium article link. Authored & curated by NT-AI for the
// AgileProjection · NT-AI Network AI/ML internship.

const AUTHOR = {
  name: "NT-AI",
  role: "AI/ML Lead Mentor · AgileProjection NT-AI Network",
  email: "hr@agileprojection.com",
};

const TECH = [
  "Python 3.11",
  "Pandas",
  "NumPy",
  "Scikit-Learn",
  "Matplotlib",
  "Seaborn",
  "Jupyter",
  "FastAPI",
  "Streamlit",
];

const METRICS = [
  { label: "Dataset", value: "California Housing", sub: "20,640 rows · 10 features" },
  { label: "Target", value: "Median House Value", sub: "Regression (USD)" },
  { label: "Eval Metric", value: "RMSE", sub: "+ cross-validation" },
  { label: "Best Model", value: "Random Forest", sub: "tuned via RandomizedSearchCV" },
];

type Stage = {
  icon: typeof Database;
  step: string;
  week: string;
  title: string;
  desc: string;
  bullets: string[];
  code: string;
};

const STAGES: Stage[] = [
  {
    icon: Database,
    step: "1",
    week: "Week 1",
    title: "Data Ingestion & Setup",
    desc: "Pull the California Housing dataset from Scikit-Learn, load it into a Pandas DataFrame, and set up the project structure (notebooks, src/, data/, models/).",
    bullets: [
      "Load fetch_california_housing() into a DataFrame",
      "Inspect shape, dtypes, head(), describe()",
      "Train/validation stratified split (80/20)",
      "Project layout: notebooks/ · src/ · models/ · data/",
    ],
    code: `from sklearn.datasets import fetch_california_housing
import pandas as pd

housing = fetch_california_housing(as_frame=True)
df = housing.frame
print(df.shape)        # (20640, 9)
print(df.info())       # dtypes + nulls
print(df.describe())  # median, IQR, outliers

# Stratified split on median income (binned)
import numpy as np
from sklearn.model_selection import train_test_split
df["income_cat"] = pd.cut(df.MedInc, bins=[0,1.5,3,4.5,6,np.inf], labels=[1,2,3,4,5])
train, test = train_test_split(df, test_size=0.2, stratify=df.income_cat, random_state=42)`,
  },
  {
    icon: BarChart3,
    step: "2",
    week: "Week 2",
    title: "Exploratory Data Analysis (EDA)",
    desc: "Understand the data before modelling. Plot distributions, correlations, and a geographical scatter to see how location drives price.",
    bullets: [
      "Histograms of every numeric feature (spot skew)",
      "Correlation heatmap — rank features vs. target",
      "Geographical scatter (lat/long, colour = price)",
      "Log-transform long-tailed features if needed",
    ],
    code: `import matplotlib.pyplot as plt
import seaborn as sns

# 1. Distributions
df.hist(bins=40, figsize=(12, 8))
plt.tight_layout(); plt.show()

# 2. Correlation with target
corr = df.corr(numeric_only=True)["MedHouseVal"].sort_values(ascending=False)
print(corr)

# 3. Geo scatter — coastal density matters
df.plot(kind="scatter", x="Longitude", y="Latitude",
        alpha=0.4, s=df.Population/100, c="MedHouseVal",
        cmap="jet", colorbar=True, figsize=(9,7))
plt.show()`,
  },
  {
    icon: Filter,
    step: "3",
    week: "Week 3",
    title: "Feature Engineering & Pipeline",
    desc: "Build a Scikit-Learn Pipeline so preprocessing is reproducible and deploy-safe. Combine numeric imputation + scaling with categorical one-hot in one transformer.",
    bullets: [
      "Feature engineering: rooms_per_household, bedrooms_per_room, population_per_household",
      "Pipeline: SimpleImputer → StandardScaler (numeric)",
      "ColumnTransformer to handle mixed types at once",
      "Full Pipeline wrapping preprocess + model",
    ],
    code: `from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.base import BaseEstimator, TransformerMixin

class FeatureAdder(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None): return self
    def transform(self, X):
        rooms, hh, pop = X[:, 3], X[:, 4], X[:, 5]
        return np.c_[X, rooms / hh, pop / hh, rooms / pop]

num_pipe = Pipeline([
    ("impute", SimpleImputer(strategy="median")),
    ("add_feats", FeatureAdder()),
    ("scale", StandardScaler()),
])
cat_pipe = Pipeline([
    ("impute", SimpleImputer(strategy="most_frequent")),
    ("onehot", OneHotEncoder(handle_unknown="ignore")),
])
prep = ColumnTransformer([("num", num_pipe, num_cols), ("cat", cat_pipe, cat_cols)])`,
  },
  {
    icon: Brain,
    step: "4",
    week: "Week 4",
    title: "Model Training & Tuning",
    desc: "Train several regression baselines, then tune the best with cross-validated random search. Always compare against a dummy baseline.",
    bullets: [
      "Baselines: LinearRegression, DecisionTree, RandomForest, GradientBoosting",
      "K-fold (5) cross-validation with RMSE scoring",
      "RandomizedSearchCV over n_estimators, max_depth, max_features",
      "Persist the tuned model with joblib",
    ],
    code: `from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint

param_dist = {
    "n_estimators": randint(low=30, high=200),
    "max_features": [2, 4, 6, 8],
    "max_depth": [None, 5, 10, 20],
}
search = RandomizedSearchCV(
    RandomForestRegressor(random_state=42),
    param_distributions=param_dist,
    n_iter=20, cv=5, scoring="neg_root_mean_squared_error",
    n_jobs=-1, random_state=42,
)
search.fit(prep.fit_transform(X_train), y_train)
print("Best RMSE:", -search.best_score_)
import joblib; joblib.dump(search.best_estimator_, "models/rf_housing.pkl")`,
  },
  {
    icon: Target,
    step: "5",
    week: "Week 5",
    title: "Evaluation & Explainability",
    desc: "Score on the held-out test set, analyse residuals, and use SHAP to explain which features drive each prediction.",
    bullets: [
      "Test-set RMSE / MAE / R² on untouched data",
      "Residual plot & prediction-vs-actual scatter",
      "Permutation importance for global explainability",
      "SHAP summary plot for local + global insights",
    ],
    code: `from sklearn.metrics import mean_squared_error, r2_score
import shap

preds = model.predict(prep.transform(X_test))
rmse = mean_squared_error(y_test, preds, squared=False)
print(f"Test RMSE: {rmse:.2f}  R²: {r2_score(y_test, preds):.3f}")

explainer = shap.TreeExplainer(model)
shap_values = explainer(prep.transform(X_test))
shap.plots.beeswarm(shap_values)            # global
shap.plots.waterfall(shap_values[0])        # local — one prediction`,
  },
  {
    icon: Rocket,
    step: "6",
    week: "Week 6",
    title: "Deployment & Capstone Demo",
    desc: "Wrap the model behind a FastAPI endpoint and build a Streamlit dashboard so stakeholders can interact with predictions live.",
    bullets: [
      "FastAPI POST /predict endpoint with Pydantic schema",
      "Streamlit dashboard: sliders for inputs, live prediction",
      "Dockerfile + docker-compose for reproducible deploys",
      "Capstone demo to an industry panel + GitHub handoff",
    ],
    code: `# app.py  — FastAPI serving
from fastapi import FastAPI
from pydantic import BaseModel
import joblib, numpy as np

model = joblib.load("models/rf_housing.pkl")
app = FastAPI()

class Features(BaseModel):
    MedInc: float; HouseAge: float; AveRooms: float
    AveBedrms: float; Population: float; AveOccup: float
    Latitude: float; Longitude: float

@app.post("/predict")
def predict(f: Features):
    x = np.array([[f.MedInc, f.HouseAge, f.AveRooms, f.AveBedrms,
                   f.Population, f.AveOccup, f.Latitude, f.Longitude]])
    return {"predicted_price_usd": float(model.predict(x)[0])}`,
  },
];

export function NTAIMLProject() {
  return (
    <section
      id="nt-ai-ml"
      className="py-16 md:py-24 px-5 md:px-[5%] max-w-7xl mx-auto scroll-mt-20"
      aria-labelledby="sdml-h2"
    >
      {/* Author / project banner */}
      <div className="rounded-2xl p-[1px] bg-gradient-to-r from-amber-500/40 via-cyan-500/40 to-blue-600/40 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#1a1400] via-[#071a30] to-[#0a2a30] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <div className="size-16 rounded-full ap-gradient-cyan grid place-items-center text-navy shrink-0 font-bold text-2xl">
              NT
            </div>
            <div className="flex-1">
              <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-1.5">
                Reference Project · Curated by {AUTHOR.name}
              </div>
              <h2 id="sdml-h2" className="font-bold text-2xl md:text-4xl leading-tight">
                {AUTHOR.name}&apos;s End-to-End ML Project —{" "}
                <span className="ap-gradient-text">Housing Price Prediction</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-3xl text-sm md:text-base leading-relaxed">
                A complete, production-style Machine Learning walkthrough — from raw CSV to a
                deployed prediction API. This is the reference architecture every AgileProjection
                AI/ML intern follows across all 80+ projects. Build it, own it, ship it.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/70 border border-border rounded-full px-2.5 py-1">
                  <GraduationCap className="size-3 text-cyan-400" />
                  {AUTHOR.role}
                </span>
                <a
                  href={`mailto:${AUTHOR.email}`}
                  className="inline-flex items-center gap-1.5 text-[11px] text-cyan-300 hover:text-cyan-200 bg-muted/70 border border-border rounded-full px-2.5 py-1"
                >
                  <Mail className="size-3" /> {AUTHOR.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="bg-card border border-border rounded-xl p-5 ap-lift"
          >
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
            <div className="font-bold text-base md:text-lg text-cyan-300 mt-1">{m.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Tech stack */}
      <div className="bg-popover border border-border rounded-xl p-5 mb-10">
        <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-3">
          Tech Stack
        </div>
        <div className="flex flex-wrap gap-2">
          {TECH.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-md bg-secondary border border-border text-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Intro / why this project */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h3 className="font-bold text-2xl md:text-3xl">
          Why this <span className="ap-gradient-text">project?</span>
        </h3>
        <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">
          Housing-price regression is the single best &quot;first end-to-end ML project&quot; —
          it&apos;s tabular, has a clear target, mixes numeric + geographic features, and rewards
          every stage of the pipeline (EDA matters, feature engineering matters, tuning matters).
          Master this, and the same 6-stage recipe transfers to churn, fraud, forecasting, even
          vision and NLP.
        </p>
      </div>

      {/* 6-stage walkthrough */}
      <ol className="relative max-w-4xl mx-auto pl-6 border-l border-border space-y-6">
        {STAGES.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.step} className="relative">
              <span
                className="absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-[#0B1929] bg-cyan-400"
                aria-hidden
              />
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span className="size-10 rounded-lg ap-gradient-cyan grid place-items-center text-navy shrink-0">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center rounded-md ap-gradient-cyan text-navy text-[11px] font-bold px-2 py-0.5">
                        {s.week}
                      </span>
                      <span className="text-[11px] text-muted-foreground">Stage {s.step}</span>
                    </div>
                    <h4 className="text-base font-semibold text-foreground mt-0.5">{s.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.desc}</p>
                <ul className="grid sm:grid-cols-2 gap-1.5 mb-4">
                  {s.bullets.map((b) => (
                    <li key={b} className="text-[12px] text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <pre className="bg-muted border border-border rounded-lg p-4 overflow-x-auto text-[12px] leading-relaxed text-foreground font-mono max-h-80 overflow-y-auto">
                  <code>{s.code}</code>
                </pre>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Author quote */}
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-gradient-to-br from-[#0e1b2e] to-[#0a2a30] border border-border rounded-2xl p-6 md:p-8 text-center">
          <Quote className="size-8 text-cyan-400 mx-auto mb-3" />
          <p className="text-foreground italic text-sm md:text-base leading-relaxed">
            &quot;Don&apos;t just run a notebook — ship a model. The day you deploy your first
            predictor behind a real API is the day you stop being a student and start being an
            engineer.&quot;
          </p>
          <div className="mt-4">
            <div className="font-semibold text-foreground">{AUTHOR.name}</div>
            <div className="text-xs text-muted-foreground">{AUTHOR.role}</div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="text-center mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 h-12 px-6">
          <Link href="#register">
            Build this project with a mentor <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="bg-popover border-border text-foreground hover:text-cyan-300 hover:border-cyan-500/50 h-12 px-6">
          <Link href="#ai-assistant">
            Ask the AI Mentor about this project
          </Link>
        </Button>
        <Button asChild size="lg" variant="ghost" className="text-muted-foreground hover:text-cyan-300 h-12 px-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
            <Github className="size-4" /> Starter repo
          </a>
        </Button>
      </div>
    </section>
  );
}
