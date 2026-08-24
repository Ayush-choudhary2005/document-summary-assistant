const STAGE_LABELS = {
  uploading: 'Uploading document…',
  extracting: 'Reading the page (parsing / OCR)…',
  summarizing: 'Marking the key sentences…',
};

export default function LoadingState({ stage, progress }) {
  const label = STAGE_LABELS[stage] || 'Working…';

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 rounded-lg border border-ink/10 dark:border-paper/10 px-6 py-14 text-center"
    >
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-ink/15 dark:border-paper/15 border-t-moss dark:border-t-marker" />
      </div>
      <p className="font-display text-lg text-ink dark:text-paper">{label}</p>
      {typeof progress === 'number' && (
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
          <div
            className="h-full bg-moss dark:bg-marker transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
