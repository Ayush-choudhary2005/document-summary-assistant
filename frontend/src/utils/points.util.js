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
