# ⚖️ LexGuard v2 — Adversarial Contract Intelligence System

> Five adversarial AI agents dissect every clause — and tell you exactly what to reject, negotiate, or accept.

---

## What's New in v2

| Feature | v1 | v2 |
|---|---|---|
| File formats | PDF + TXT | **PDF + DOCX + TXT** |
| AI agents | 4 | **5 (+ Ambiguity Agent)** |
| Benchmark comparison | ✕ | **✓ per clause** |
| Scenario simulation | ✕ | **✓ per clause** |
| Ambiguity detection | ✕ | **✓ vague terms flagged** |
| Contradiction detection | ✕ | **✓ flagged across clauses** |
| UI | Dark blue | **Warm parchment / legal doc aesthetic** |

---

## 🏗️ Architecture (v2)

```
User uploads PDF / DOCX / TXT  (or pastes text)
              ↓
       FastAPI Backend
              ↓
    ┌─────────────────────────────────────┐
    │         5-Agent Pipeline            │
    │                                     │
    │  1. ExtractorAgent                  │
    │     → finds all clauses (JSON)      │
    │                                     │
    │  2. AttackerAgent                   │
    │     → attacks each clause           │
    │       (consumer rights lawyer)      │
    │                                     │
    │  3. DefenderAgent                   │
    │     → defends each clause           │
    │       (corporate lawyer)            │
    │                                     │
    │  4. AmbiguityAgent  ← NEW           │
    │     → flags vague terms, loopholes  │
    │       contradictions, ambiguity     │
    │       score 0-100                   │
    │                                     │
    │  5. JudgeAgent (enhanced)           │
    │     → risk score + verdict          │
    │     → benchmark comparison  ← NEW   │
    │     → scenario simulation   ← NEW   │
    │     → REJECT / NEGOTIATE / ACCEPT   │
    └─────────────────────────────────────┘
              ↓
    React Frontend shows:
    - Risk dashboard (overall score + stats)
    - Per-clause sidebar list
    - 4-tab detail view:
        ⚔ Debate (attacker vs defender vs judge)
        ⌖ Ambiguity (vague terms, contradictions)
        ⊞ Benchmark (vs industry standards)
        ⚡ Scenario (real-world consequence)
```

---

## 🚀 Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+
- Gemini API key (free at ai.google.dev)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — paste your GEMINI_API_KEY

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Test:
```bash
curl http://localhost:8000/health
# → {"status":"ok","service":"LexGuard v2","agents":5}
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# → http://localhost:3000
```

---

## 📄 Supported File Formats

| Format | Notes |
|---|---|
| `.pdf` | Text-based PDFs via PyMuPDF |
| `.docx` | Word documents via python-docx |
| `.txt` | Plain text |
| Paste | Paste raw contract text directly |

---

## 🤖 Agent Outputs

Each clause gets these fields after the pipeline:

```json
{
  "id": 1,
  "title": "Non-Compete Clause",
  "text": "Original clause text...",
  "attack": "Consumer rights lawyer's argument...",
  "defense": "Corporate lawyer's counter-argument...",
  "ambiguity": {
    "vague_terms": ["reasonable time", "at our discretion"],
    "has_contradiction": false,
    "contradiction_note": "",
    "ambiguity_score": 72,
    "plain_warning": "This clause uses 'at our discretion' 3 times with no definition."
  },
  "risk_level": "HIGH",
  "risk_score": 84,
  "verdict": "This clause gives the company unchecked power...",
  "recommendation": "REJECT",
  "benchmark": "This non-compete is broader than 85% of standard employment contracts in India.",
  "scenario": "If you sign this, you cannot work at any tech company in India for 2 years after leaving, even if you're fired."
}
```

---

## 🚀 Deploy to GCP Cloud Run

### Backend

```bash
cd backend
chmod +x deploy.sh
export GEMINI_API_KEY=your_key_here
./deploy.sh
```

### Frontend (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
cd frontend
# Set VITE_API_URL=https://your-cloud-run-url.app in .env
npm run build
firebase init hosting  # select: build/ as public dir, SPA: yes
firebase deploy
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| LLM | Gemini 1.5 Flash |
| Backend | FastAPI + Python |
| PDF parsing | PyMuPDF |
| DOCX parsing | python-docx ← new |
| Frontend | React + Vite |
| Fonts | Crimson Pro + Syne |
| Deploy | GCP Cloud Run + Firebase |
