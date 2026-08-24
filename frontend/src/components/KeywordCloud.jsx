export default function KeywordCloud({ keywords }) {
  if (!keywords || keywords.length === 0) return null;

  const maxCount = Math.max(...keywords.map((k) => k.count));

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">
        Key terms
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {keywords.map((kw) => {
          const weight = kw.count / maxCount;
          const isTop = weight > 0.7;
          return (
            <span
              key={kw.text}
              className={`rounded-full border px-3 py-1 font-mono text-xs lowercase tracking-wide
                ${
                  isTop
                    ? 'border-moss bg-moss/10 text-moss dark:border-marker dark:bg-marker/10 dark:text-marker'
                    : 'border-ink/15 text-ink/60 dark:border-paper/15 dark:text-paper/60'
                }`}
            >
              {kw.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
