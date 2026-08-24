export default function HistoryPanel({ open, history, onClose, onClear, onRemove, onSelect }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close history"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <aside className="relative flex h-full w-full max-w-sm flex-col bg-paper dark:bg-paper-dark border-l border-ink/10 dark:border-paper/10 p-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink dark:text-paper">History</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50 hover:text-moss dark:hover:text-marker"
          >
            Close ✕
          </button>
        </div>

        {history.length === 0 ? (
          <p className="mt-8 text-sm text-ink/60 dark:text-paper/60">
            Nothing summarized yet on this device. Your last 20 summaries will
            show up here — stored locally, never sent anywhere else.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={onClear}
              className="mt-4 self-start font-mono text-xs uppercase tracking-wide text-redact hover:underline"
            >
              Clear all
            </button>
            <ul className="mt-4 flex flex-col gap-3">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-ink/10 dark:border-paper/10 p-3 hover:border-moss dark:hover:border-marker transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(entry)}
                    className="w-full text-left"
                  >
                    <p className="truncate font-medium text-sm text-ink dark:text-paper">
                      {entry.fileName}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-ink/60 dark:text-paper/60">
                      {entry.summary}
                    </p>
                    <p className="mt-1 font-mono text-[0.65rem] uppercase text-ink/40 dark:text-paper/40">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(entry.id)}
                    className="mt-2 font-mono text-[0.65rem] uppercase tracking-wide text-ink/40 dark:text-paper/40 hover:text-redact"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    </div>
  );
}
