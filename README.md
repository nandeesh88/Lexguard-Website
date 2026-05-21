# LexGuard v2 — Adversarial Contract Intelligence

Five adversarial AI agents dissect every clause of any contract and tell you exactly what to reject, negotiate, or accept — in plain English.

---

## What's New in v2

| Feature | v1 | v2 |
|---|---|---|
| File formats | PDF, TXT | PDF, DOCX, TXT |
| AI agents | 4 | 5 (+ Ambiguity Agent) |
| Benchmark comparison | No | Yes, per clause |
| Scenario simulation | No | Yes, per clause |
| Ambiguity detection | No | Vague terms flagged |
| Contradiction detection | No | Flagged across clauses |

---

## Features

- **Clause Extraction** — automatically parses every distinct clause from uploaded documents
- **Adversarial Debate** — an Attacker (consumer rights lawyer) and Defender (corporate lawyer) argue each clause in plain English
- **Ambiguity Detection** — flags vague language like "reasonable time", "at our discretion", "may change at any time" with a 0–100 ambiguity score
- **Benchmark Comparison** — compares each clause against industry standards (e.g. "broader than 85% of standard employment contracts")
- **Scenario Simulation** — shows real-world consequences in second-person (e.g. "If you sign this, you cannot work at any tech company in India for 2 years")
- **Judge Verdict** — neutral risk score 0–100, risk level (HIGH / MEDIUM / LOW), and a final recommendation: REJECT / NEGOTIATE / ACCEPT
- **Multi-format Support** — PDF, DOCX, TXT, or paste raw text directly

---
** Demo video** - https://drive.google.com/file/d/17CdPpxyaSknNXBRv9RRT7EYItEx1doko/view?usp=drive_link
---
## Agent Pipeline

```
User uploads PDF / DOCX / TXT
            ↓
     FastAPI Backend
            ↓
  1. ExtractorAgent    →  finds all clauses
  2. AttackerAgent     →  consumer rights lawyer attacks each clause
  3. DefenderAgent     →  corporate lawyer defends each clause
  4. AmbiguityAgent    →  flags vague terms, contradictions, loopholes
  5. JudgeAgent        →  risk score, benchmark, scenario, verdict
            ↓
     React Frontend
  - Overall risk dashboard
  - Per-clause sidebar
  - 4-tab detail view: Debate / Ambiguity / Benchmark / Scenario
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Backend | FastAPI + Python 3.11 |
| PDF parsing | PyMuPDF |
| DOCX parsing | python-docx |
| LLM | Gemini API (gemini-2.0-flash) |
| Agent framework | Custom multi-agent pipeline |
| Frontend | React + Vite |
| Fonts | Crimson Pro + Syne |
| IDE | Antigravity |
| Backend deploy | GCP Cloud Run |
| Frontend deploy | Firebase Hosting |

---

## Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```
API_KEY=your_key_here
```

Start the server:
```bash
uvicorn main:app --reload --port 8000
```

Verify:
```bash
curl http://localhost:8000/health
# {"status":"ok","service":"LexGuard v2","agents":5}
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000
```

Start:
```bash
npm run dev
# http://localhost:3000
```

---

## Deployment

### Backend — GCP Cloud Run

```bash
cd backend
gcloud run deploy lexguard-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars API_KEY=your_key_here
```

### Frontend — Firebase Hosting

```bash
cd frontend
# Set VITE_API_URL to your Cloud Run URL in .env
npm run build
firebase init hosting  # public dir: dist, SPA: yes
firebase deploy
```

---

## Supported File Formats

| Format | Method |
|---|---|
| .pdf | PyMuPDF text extraction |
| .docx | python-docx paragraph + table extraction |
| .txt | Plain UTF-8 decode |
| Paste | Raw text input directly in UI |

---

## Agent Output Schema

Each clause returns the following after the full pipeline:

```json
{
  "id": 1,
  "title": "Non-Compete Clause",
  "text": "Original clause text...",
  "attack": "Consumer rights lawyer argument...",
  "defense": "Corporate lawyer counter-argument...",
  "ambiguity": {
    "vague_terms": ["reasonable time", "at our discretion"],
    "has_contradiction": false,
    "contradiction_note": "",
    "ambiguity_score": 72,
    "plain_warning": "This clause uses at our discretion 3 times with no definition."
  },
  "risk_level": "HIGH",
  "risk_score": 84,
  "verdict": "This clause gives the company unchecked power...",
  "recommendation": "REJECT",
  "benchmark": "This non-compete is broader than 85% of standard employment contracts in India.",
  "scenario": "If you sign this, you cannot work at any tech company in India for 2 years after leaving, even if you are fired."
}
```

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `Geimini_API_KEY` | backend/.env | API key for LLM calls |
| `VITE_API_URL` | frontend/.env | Backend base URL |

---

**LexGuard** is a multi-agent AI system that reads contracts the way a lawyer would — identifying risk, flagging ambiguity, comparing industry standards, and simulating real-world consequences so anyone can make an informed decision before signing.
