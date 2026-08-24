import { normalizePoints, segmentPoints } from '../utils/points.util.js';

export default function BatchResults({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <section className="mt-8 flex flex-col gap-4">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">
        Batch results — {results.length} document{results.length !== 1 ? 's' : ''}
      </p>
      {results.map((r, i) => {
        const segments = r.success ? segmentPoints(normalizePoints(r.summaryPoints, r.summary)) : [];
        return (
          <article
            key={`${r.fileName}-${i}`}
            className="rounded-lg border border-ink/10 dark:border-paper/10 p-5"
          >
            <h3 className="font-display text-lg text-ink dark:text-paper truncate">{r.fileName}</h3>
            {r.success ? (
              <>
                <div className="mt-2 space-y-2">
                  {segments.map((segment, si) =>
                    segment.type === 'paragraph' ? (
                      <p key={si} className="text-sm text-ink/80 dark:text-paper/80">
                        {segment.text}
                      </p>
                    ) : (
                      <ul key={si} className="space-y-1.5">
                        {segment.items.map((item, pi) => (
                          <li key={pi} className="flex gap-2 text-sm text-ink/80 dark:text-paper/80">
                            <span
                              className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-moss dark:bg-marker"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </div>
                {r.keywords?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.keywords.map((kw) => (
                      <span
                        key={kw.text}
                        className="rounded-full border border-ink/15 dark:border-paper/15 px-2.5 py-0.5 font-mono text-[0.65rem] text-ink/60 dark:text-paper/60"
                      >
                        {kw.text}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="mt-2 font-mono text-xs text-redact">{r.error}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
