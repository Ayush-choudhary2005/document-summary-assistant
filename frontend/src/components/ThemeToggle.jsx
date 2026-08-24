export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="group flex items-center gap-2 rounded-full border border-ink/15 dark:border-paper/20 px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-ink/70 dark:text-paper/70 hover:border-moss hover:text-moss dark:hover:text-marker dark:hover:border-marker transition-colors"
    >
      <span
        className={`inline-block h-2 w-2 rounded-full transition-colors ${
          isDark ? 'bg-marker' : 'bg-moss'
        }`}
      />
      {isDark ? 'Night desk' : 'Day desk'}
    </button>
  );
}
