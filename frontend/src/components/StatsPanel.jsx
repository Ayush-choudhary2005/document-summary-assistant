function Stat({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[0.65rem] uppercase tracking-wide text-ink/45 dark:text-paper/45">
        {label}
      </span>
      <span className="font-mono text-sm text-ink dark:text-paper">{value}</span>
    </div>
  );
}

export default function StatsPanel({ stats }) {
  if (!stats) return null;

  return (
    <div className="rounded-lg border border-dashed border-ink/25 dark:border-paper/25 px-4 py-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Original words" value={stats.originalWordCount.toLocaleString()} />
        <Stat label="Summary words" value={stats.summaryWordCount.toLocaleString()} />
        <Stat label="Reading time saved" value={`${Math.max(0, stats.originalReadingTimeMin - stats.summaryReadingTimeMin)} min`} />
        <Stat label="Compression" value={`${stats.compressionPercent}%`} />
      </div>
    </div>
  );
}
