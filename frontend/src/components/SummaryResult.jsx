import { useState } from 'react';
import AnnotatedDocument from './AnnotatedDocument.jsx';
import KeywordCloud from './KeywordCloud.jsx';
import StatsPanel from './StatsPanel.jsx';
import { exportAsTxt, exportAsMarkdown, exportAsPdf, copyToClipboard } from '../utils/export.util.js';

export default function SummaryResult({ result }) {
  const [copied, setCopied] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  if (!result) return null;

  const handleCopy = async () => {
    await copyToClipboard(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="relative mt-8 rounded-xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-paper-darkdim p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-moss dark:text-marker">
            {result.summaryMode === 'ai-enhanced' ? 'AI-enhanced summary' : 'Extractive summary'} · {result.summaryLength}
          </p>
          <h2 className="mt-1 font-display text-2xl text-ink dark:text-paper truncate max-w-md">
            {result.fileName}
          </h2>
        </div>

        {typeof result.ocrConfidence === 'number' && result.ocrConfidence < 65 && (
          <span className="rounded-full bg-redact/10 px-3 py-1 font-mono text-xs text-redact">
            Low scan quality (OCR confidence {result.ocrConfidence}%)
          </span>
        )}
      </div>

      <p className="mt-5 font-display text-lg leading-relaxed text-ink dark:text-paper whitespace-pre-line">
        {result.summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-ink/20 dark:border-paper/20 px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:border-moss dark:hover:border-marker transition-colors"
        >
          {copied ? 'Copied ✓' : 'Copy summary'}
        </button>
        <button
          type="button"
          onClick={() => exportAsTxt(result.fileName, result.summary)}
          className="rounded-md border border-ink/20 dark:border-paper/20 px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:border-moss dark:hover:border-marker transition-colors"
        >
          Export .txt
        </button>
        <button
          type="button"
          onClick={() =>
            exportAsMarkdown(result.fileName, result.summary, result.keywords?.map((k) => k.text))
          }
          className="rounded-md border border-ink/20 dark:border-paper/20 px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:border-moss dark:hover:border-marker transition-colors"
        >
          Export .md
        </button>
        <button
          type="button"
          onClick={() => exportAsPdf(result.fileName, result.summary)}
          className="rounded-md border border-ink/20 dark:border-paper/20 px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:border-moss dark:hover:border-marker transition-colors"
        >
          Export .pdf
        </button>
        {result.annotatedSentences && (
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="ml-auto rounded-md bg-moss/10 dark:bg-marker/10 text-moss dark:text-marker px-3 py-1.5 text-xs font-mono uppercase tracking-wide hover:bg-moss/20 dark:hover:bg-marker/20 transition-colors"
          >
            {showOriginal ? 'Hide marked-up original' : 'Show marked-up original'}
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-5">
        <StatsPanel stats={result.stats} />
        <KeywordCloud keywords={result.keywords} />
        {showOriginal && <AnnotatedDocument sentences={result.annotatedSentences} />}
      </div>
    </section>
  );
}
