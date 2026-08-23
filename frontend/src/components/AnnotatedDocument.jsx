export default function AnnotatedDocument({ sentences }) {
  if (!sentences || sentences.length === 0) return null;

  return (
    <div className="relative rounded-lg border border-manila/50 bg-paper-dim dark:bg-paper-darkdim dark:border-manila/30 p-6 max-h-96 overflow-y-auto">
      <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink/50 dark:text-paper/50">
        Original text — marked sentences made the cut
      </p>
      <p className="font-body text-[0.95rem] leading-relaxed text-ink/80 dark:text-paper/80">
        {sentences.map((s, i) => (
          <span key={i} className={s.highlighted ? 'marker-highlight' : undefined}>
            {s.text}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}
