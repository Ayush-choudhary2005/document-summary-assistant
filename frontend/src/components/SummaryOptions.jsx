const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short', hint: 'A few sentences' },
  { value: 'medium', label: 'Medium', hint: 'One tight paragraph' },
  { value: 'long', label: 'Long', hint: 'Full picture' },
];

export default function SummaryOptions({
  length,
  onLengthChange,
  mode,
  onModeChange,
  aiAvailable,
  disabled,
}) {
  return (
    <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">
          Summary length
        </p>
        <div className="mt-2 flex gap-2">
          {LENGTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onLengthChange(opt.value)}
              title={opt.hint}
              className={`rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-50
                ${
                  length === opt.value
                    ? 'border-moss bg-moss text-paper dark:border-marker dark:bg-marker dark:text-ink'
                    : 'border-ink/20 text-ink/70 hover:border-moss dark:border-paper/20 dark:text-paper/70 dark:hover:border-marker'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">
          Summary engine
        </p>
        <label
          className={`mt-2 flex items-center gap-2 text-sm ${
            aiAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
          title={
            aiAvailable
              ? 'Use Claude to rewrite the summary in fresh language'
              : 'Set ANTHROPIC_API_KEY on the server to enable this'
          }
        >
          <input
            type="checkbox"
            disabled={!aiAvailable || disabled}
            checked={mode === 'ai-enhanced'}
            onChange={(e) => onModeChange(e.target.checked ? 'ai-enhanced' : 'extractive')}
            className="h-4 w-4 accent-moss dark:accent-marker"
          />
          AI Enhanced Mode
        </label>
      </div>
    </div>
  );
}
