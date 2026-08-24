/**
 * Accepts either the new structured shape ({ text, isBullet }) or a legacy
 * plain string (older history entries saved before this format existed) and
 * normalizes everything to { text, isBullet }.
 */
export function normalizePoints(raw, fallbackText) {
  if (!raw || raw.length === 0) {
    return fallbackText ? [{ text: fallbackText, isBullet: false }] : [];
  }
  return raw.map((p) => (typeof p === 'string' ? { text: p, isBullet: false } : p));
}

/**
 * Groups a flat list of points into renderable runs: consecutive prose
 * points become one paragraph block, while bullet points are grouped into
 * a single list block (each on its own line). This is what lets the UI
 * show flowing paragraphs for narrative content and a real bullet list
 * only where the source document actually had distinct points.
 */
export function segmentPoints(points) {
  const segments = [];

  for (const point of points) {
    const last = segments[segments.length - 1];
    if (point.isBullet) {
      if (last && last.type === 'list') {
        last.items.push(point.text);
      } else {
        segments.push({ type: 'list', items: [point.text] });
      }
    } else if (last && last.type === 'paragraph') {
      last.text = `${last.text} ${point.text}`;
    } else {
      segments.push({ type: 'paragraph', text: point.text });
    }
  }

  return segments;
}
