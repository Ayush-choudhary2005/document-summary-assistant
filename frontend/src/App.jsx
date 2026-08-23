import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import FileUpload from './components/FileUpload.jsx';
import SummaryOptions from './components/SummaryOptions.jsx';
import LoadingState from './components/LoadingState.jsx';
import SummaryResult from './components/SummaryResult.jsx';
import BatchResults from './components/BatchResults.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useHistory } from './hooks/useHistory.js';
import { fetchCapabilities, summarizeDocument, summarizeBatch } from './api/documentApi.js';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { history, addEntry, clearHistory, removeEntry } = useHistory();

  const [files, setFiles] = useState([]);
  const [length, setLength] = useState('medium');
  const [mode, setMode] = useState('extractive');
  const [capabilities, setCapabilities] = useState({ aiEnhancedModeAvailable: false });

  const [stage, setStage] = useState(null); // null | 'uploading' | 'extracting' | 'summarizing'
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    fetchCapabilities()
      .then(setCapabilities)
      .catch(() => setCapabilities({ aiEnhancedModeAvailable: false }));
  }, []);

  const isBusy = stage !== null;

  const handleFilesSelected = (newFiles) => {
    setFiles(newFiles);
    setResult(null);
    setBatchResults(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setError(null);
    setResult(null);
    setBatchResults(null);

    try {
      if (files.length > 1) {
        setStage('extracting');
        const data = await summarizeBatch({ files, length });
        setBatchResults(data);
      } else {
        setStage('uploading');
        const data = await summarizeDocument({
          file: files[0],
          length,
          mode,
          onUploadProgress: (pct) => {
            setProgress(pct);
            if (pct >= 100) setStage('extracting');
          },
        });
        setResult(data);
        addEntry(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setStage(null);
      setProgress(null);
    }
  };

  const handleSelectHistoryEntry = (entry) => {
    setResult({
      fileName: entry.fileName,
      summary: entry.summary,
      summaryPoints: entry.summaryPoints,
      summaryLength: entry.summaryLength,
      summaryMode: entry.summaryMode,
      keywords: entry.keywords,
      stats: entry.stats,
      annotatedSentences: null,
    });
    setBatchResults(null);
    setHistoryOpen(false);
  };

  return (
    <div className="min-h-screen bg-grid bg-grid bg-fixed">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onShowHistory={() => setHistoryOpen(true)}
        historyCount={history.length}
      />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <FileUpload files={files} onFilesSelected={handleFilesSelected} disabled={isBusy} />

        <SummaryOptions
          length={length}
          onLengthChange={setLength}
          mode={mode}
          onModeChange={setMode}
          aiAvailable={capabilities.aiEnhancedModeAvailable}
          disabled={isBusy || files.length > 1}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={files.length === 0 || isBusy}
          className="mt-6 w-full sm:w-auto rounded-md bg-moss dark:bg-marker px-6 py-2.5 font-medium text-paper dark:text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {files.length > 1 ? `Summarize ${files.length} documents` : 'Summarize document'}
        </button>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-redact/30 bg-redact/10 px-4 py-3 text-sm text-redact"
          >
            {error}
          </p>
        )}

        {isBusy && <div className="mt-8"><LoadingState stage={stage} progress={progress} /></div>}

        {!isBusy && result && <SummaryResult result={result} />}
        {!isBusy && batchResults && <BatchResults results={batchResults} />}
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-6 font-mono text-xs text-ink/40 dark:text-paper/40">
        Runs a local extractive summarizer by default — no data leaves your
        server unless AI Enhanced Mode is turned on.
      </footer>

      <HistoryPanel
        open={historyOpen}
        history={history}
        onClose={() => setHistoryOpen(false)}
        onClear={clearHistory}
        onRemove={removeEntry}
        onSelect={handleSelectHistoryEntry}
      />
    </div>
  );
}
