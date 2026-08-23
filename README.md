# Document Summary Assistant

Upload a PDF or a photo of a scanned page, and get back a clean, smart
summary — with the exact sentences it picked highlighted right on the
original text, so the summarization is never a black box.

Built for the _Technical Assessment Project — Software Engineer Position_
brief (Document Upload → Text Extraction → Summary Generation → UI/UX →
Hosting), plus a handful of extra features layered on top.

---

## Features

### From the brief

- **Document upload** — drag-and-drop or file picker, PDF + image formats.
- **PDF parsing** — extracts text while preserving paragraph structure.
- **OCR for images** — scanned pages / photos are read with Tesseract OCR.
- **Smart summaries** — short / medium / long length options, key points
  captured automatically.
- **Simple, responsive UI** — works from phone to desktop.
- **Deployable** — ready for Vercel (frontend) + Render/Railway (backend).
- **Production-quality basics** — centralized error handling, upload
  validation, loading states, `.env`-driven config.

### Extra features (not in the brief)

| Feature                      | What it does                                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Annotated original view**  | Shows the source text with the exact sentences chosen for the summary highlighted, like a real highlighter mark — makes the extraction transparent.                                 |
| **AI Enhanced Mode**         | Optional toggle that swaps the local extractive summarizer for an abstractive, freshly-worded summary from the Claude API (only appears if the server owner configures an API key). |
| **Keyword / tag extraction** | Auto-pulls the most important terms from the document into a tag cloud.                                                                                                             |
| **Document stats**           | Word counts, reading time, and compression ratio for original vs. summary.                                                                                                          |
| **Export summary**           | Download the summary as `.txt`, `.md`, or `.pdf`.                                                                                                                                   |
| **Copy to clipboard**        | One click to copy the summary.                                                                                                                                                      |
| **Local history**            | Your last 20 summaries are saved in the browser (`localStorage`) — nothing server-side, nothing sent anywhere.                                                                      |
| **Batch upload**             | Drop in multiple files at once and get a summary for each.                                                                                                                          |
| **Dark mode**                | Persisted theme toggle, respects `prefers-color-scheme` on first visit.                                                                                                             |
| **Accessibility floor**      | Visible keyboard focus states, `prefers-reduced-motion` respected, semantic roles on dynamic regions.                                                                               |

---

## Architecture

```
document-summary-assistant/
├── backend/                 Express API (Node.js)
│   ├── server.js            Entry point
│   └── src/
│       ├── routes/          /api/documents/* route definitions
│       ├── controllers/     Request orchestration
│       ├── services/        pdf.service, ocr.service, summary.service,
│       │                    aiSummary.service (business logic)
│       ├── middleware/      multer upload config + centralized error handler
│       ├── utils/           keyword extraction, text stats
│       └── config/          env-driven configuration
│
└── frontend/                 React 18 + Vite + Tailwind CSS
    └── src/
        ├── api/              axios client for the backend
        ├── components/       Header, FileUpload, SummaryOptions,
        │                     SummaryResult, AnnotatedDocument, KeywordCloud,
        │                     StatsPanel, HistoryPanel, BatchResults…
        ├── hooks/             useTheme, useHistory
        └── utils/             export.util (txt / md / pdf)
```

**Request flow:** browser uploads a file → Express validates it (type/size)
→ `pdf.service` or `ocr.service` extracts raw text → `summary.service` runs
a Luhn-style extractive summarizer (or `aiSummary.service` calls Claude, if
AI Enhanced Mode is on) → keywords + stats are computed → one JSON response
goes back to the client, which renders the summary, the annotated original,
the tag cloud, and the stats panel.

### Why extractive summarization by default?

The default summarizer needs **no API key and no internet call** — it
tokenizes sentences, scores them by weighted word frequency (with small
bonuses for opening/closing sentences), and keeps the top-scoring ones in
their original order. That means the app is fully usable out of the box,
for free, forever. AI Enhanced Mode is layered on top as an opt-in upgrade
for anyone who wants a more natural, rewritten summary and is willing to
supply a Claude API key.

---

## Getting started

### Prerequisites

- Node.js **18+**
- npm 9+

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/document-summary-assistant.git
cd document-summary-assistant

# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Run in development

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` and drop in a document.

### 3. (Optional) Enable AI Enhanced Mode

Add your Anthropic API key to `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-5
```

Restart the backend — the "AI Enhanced Mode" checkbox in the UI will
automatically unlock.

---

## API reference

| Method | Endpoint                         | Body                                                                                                                 | Description                                                             |
| ------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| GET    | `/api/health`                    | —                                                                                                                    | Health check                                                            |
| GET    | `/api/documents/capabilities`    | —                                                                                                                    | Reports max upload size, supported types, whether AI mode is configured |
| POST   | `/api/documents/summarize`       | `multipart/form-data`: `document` (file), `length` (`short`\|`medium`\|`long`), `mode` (`extractive`\|`ai-enhanced`) | Summarizes a single document                                            |
| POST   | `/api/documents/summarize-batch` | `multipart/form-data`: `documents` (up to 10 files), `length`                                                        | Summarizes multiple documents in one call                               |

Example response from `/api/documents/summarize`:

```json
{
  "success": true,
  "data": {
    "fileName": "report.pdf",
    "extractionSource": "pdf-parse",
    "summary": "…",
    "summaryMode": "extractive",
    "summaryLength": "medium",
    "annotatedSentences": [{ "text": "…", "highlighted": true }],
    "keywords": [{ "text": "revenue", "count": 7 }],
    "stats": {
      "originalWordCount": 1204,
      "summaryWordCount": 210,
      "compressionPercent": 83
    }
  }
}
```

---

## ☁️ Deployment

**Backend → Render / Railway / Fly.io**

1. Push this repo to GitHub.
2. Create a new Web Service, root directory `backend`.
3. Build command: `npm install` · Start command: `npm start`.
4. Set the environment variables from `backend/.env.example`.

**Frontend → Vercel / Netlify**

1. New project, root directory `frontend`.
2. Build command: `npm run build` · Output directory: `dist`.
3. Set `VITE_API_BASE_URL` to your deployed backend URL (e.g.
   `https://your-api.onrender.com/api`).

Update `CORS_ORIGIN` in the backend's environment variables to match your
deployed frontend URL once both are live.

---

## Approach write-up (≤200 words)

I split the app into a stateless Express API and a Vite/React frontend so
each half can be deployed and scaled independently. Text extraction is
format-aware: `pdf-parse` handles PDFs, and `tesseract.js` runs OCR for
scanned images, so both required input types funnel into the same plain-text
pipeline. For summarization, I deliberately defaulted to a **local,
dependency-free extractive algorithm** (frequency-weighted sentence scoring,
Luhn-style) instead of requiring a paid AI API — it keeps the app free,
fast, and usable offline, while still producing coherent summaries because
selected sentences are re-ordered back into their original sequence. I
layered an optional **AI Enhanced Mode** on top using the Claude API for
anyone who wants abstractive, rewritten summaries.

Beyond the brief, I focused on **transparency and trust**: the "annotated
original" view shows exactly which sentences were extracted, so the tool
never feels like a black box. I also added keyword extraction, document
stats, multi-format export, batch processing, and a local-only history —
all designed to make the tool genuinely useful for repeat, real-world use,
not just a demo.

---

## 🧪 Limitations & possible next steps

- OCR accuracy depends on scan quality; very low-confidence results are
  flagged in the UI but not auto-corrected.
- Extractive summaries occasionally skip connective phrasing since
  sentences are lifted verbatim — AI Enhanced Mode solves this by rewriting.
- No persistent server-side storage/auth by design (stateless, privacy
  friendly); a "shareable link" feature would need a database.

## License

MIT — see [LICENSE](./LICENSE).
