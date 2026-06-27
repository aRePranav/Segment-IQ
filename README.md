# SegmentIQ AI

Real-time customer segmentation. Upload a transaction CSV (or use the live
sample), and get four named, actionable customer segments — backed by RFM
feature engineering, K-Means clustering, and three independent validation
metrics, not a guess.

Built by **R Pranav**, building on the [Customer-Segmentation](https://github.com/aRePranav/Customer-Segmentation) project foundation.

```
segmentiq/
├── core/          shared segmentation engine (single source of truth)
├── ml/            training script + sample dataset artifacts
├── backend/       FastAPI service
└── frontend/      Next.js site (the portfolio-facing UI)
```

## What's real here

- The sample dataset is the actual **Online Retail** dataset (~542,000 raw
  transactions, cleaned down to **4,338 real customers**) — not synthetic
  data. `ml/train.py` is the exact script that produced
  `backend/app/artifacts/sample_rfm.csv`.
- `/segment` runs the live pipeline on every request — RFM engineering,
  99th-percentile outlier capping, log-transform, scaling, K-Means++ — for
  both the sample dataset and any CSV you upload. Every run writes a real
  row to the database; nothing is pre-baked.
- Elbow, Silhouette, and Davies-Bouldin are computed across k=2-10 on every
  run, not hardcoded. **One honest finding worth knowing:** pure silhouette
  maximization on this data actually favors k=2-3, not k=4 — but a 2-cluster
  split is just "high value vs. low value" with little marketing use. k=4
  was chosen deliberately for business actionability, and the product says
  so explicitly in the Validation section rather than overstating
  statistical agreement that doesn't fully hold up under the real numbers.
- The 3D visualization plots real Recency/Frequency/Monetary coordinates
  per customer, colored by their actual assigned cluster.

## 1. Local development

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Check `http://localhost:8000/health` and `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000`.

## 2. Deploying for a live link

### Step A — Push to GitHub

```bash
git init
git add .
git commit -m "SegmentIQ AI: full-stack customer segmentation platform"
git branch -M main
git remote add origin https://github.com/aRePranav/Customer-Segmentation.git
git push -u origin main
```

(Or point `origin` at a fresh empty repo if you'd rather keep this separate.)

### Step B — Backend on Render

1. [render.com](https://render.com) → **New +** → **Web Service** → connect
   the repo.
2. **Root directory:** `backend`
3. **Runtime:** Docker (uses the included `Dockerfile`) — or without Docker:
   **Build command:** `pip install -r requirements.txt`, **Start command:**
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Env var: `SEGMENTIQ_ALLOWED_ORIGINS=*` for now (tighten after Step C).
5. Deploy, copy the URL (e.g. `https://segmentiq-api.onrender.com`).

Same caveat as any free-tier service: the filesystem isn't guaranteed to
survive redeploys, and the service sleeps after 15 minutes idle (first
request after that takes 30-60s to wake up). For a portfolio demo this is
normal and fine — the loading state in the UI handles it gracefully.

### Step C — Frontend on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import
   the repo.
2. **Root directory:** `frontend`
3. Env var: `NEXT_PUBLIC_API_URL` = your Render URL from Step B.
4. Deploy. This URL is what goes in your portfolio.

### Step D — Lock down CORS

Back in Render, set `SEGMENTIQ_ALLOWED_ORIGINS` to your real Vercel URL and
redeploy.

## 3. Retraining / regenerating the sample artifacts

```bash
cd ml
pip install pandas scikit-learn joblib
python3 train.py   # expects OnlineRetail.csv at the path set in train.py
```

Copy the resulting `artifacts/sample_rfm.csv`,
`artifacts/sample_transactions_preview.csv` into
`backend/app/artifacts/` and redeploy.

> `core/segmentation.py` is duplicated into `backend/app/core/` so the
> backend ships as a self-contained service. If you change the pipeline
> logic, update both copies (or symlink them in your own fork).

## 4. API reference

| Endpoint | Method | Description |
|---|---|---|
| `/segment` | POST | `file` (CSV) or `use_sample=true` → full segmentation result |
| `/sample-data` | GET | Metadata about the sample dataset |
| `/sample-data/template` | GET | Downloadable example CSV in the expected format |
| `/analytics` | GET | Global aggregate stats across all runs |
| `/history` | GET | Recent runs (`?limit=10`) |
| `/health` | GET | Health check |

Interactive docs at `/docs` once running.

## 5. Tech stack

Python · pandas · scikit-learn · FastAPI · SQLite · Next.js · TypeScript ·
Tailwind CSS · Framer Motion · Three.js / React Three Fiber · Recharts
