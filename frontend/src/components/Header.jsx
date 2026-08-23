import ThemeToggle from './ThemeToggle.jsx';

export default function Header({ theme, onToggleTheme, onShowHistory, historyCount }) {
  return (
    <header className="relative border-b border-ink/10 dark:border-paper/10">
      <div className="mx-auto flex max-w-5xl items-start justify-between px-6 py-8 sm:py-12">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-moss dark:text-marker">
            Doc No. 001 — Reading Desk
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-medium leading-[1.05] text-ink dark:text-paper">
            Read less.
            <br />
            <span className="italic">Know more.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink/70 dark:text-paper/70">
            Drop in a PDF or a photo of a page. We'll pull the text, mark the
            sentences that matter, and hand you a summary — no account, no
            waiting room.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            onClick={onShowHistory}
            className="font-mono text-xs uppercase tracking-wide text-ink/60 dark:text-paper/60 hover:text-moss dark:hover:text-marker underline decoration-dotted underline-offset-4"
          >
            History{historyCount > 0 ? ` (${historyCount})` : ''}
          </button>
        </div>
      </div>
    </header>
  );
}
