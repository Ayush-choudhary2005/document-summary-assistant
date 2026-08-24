const { tokenizeWords } = require('../utils/keywords.util');

// Fraction of segments to keep for each requested length.
const LENGTH_RATIOS = {
  short: 0.15,
  medium: 0.3,
  long: 0.5,
};

const MIN_SEGMENTS = { short: 2, medium: 4, long: 6 };

const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'vs', 'etc', 'e.g', 'i.e',
  'inc', 'ltd', 'co', 'fig', 'no', 'st', 'approx',
]);

// Matches a bullet/list marker at the very start of an already-split line —
// safe to treat as a list item regardless of what punctuation follows it.
const BULLET_LINE_REGEX = /^[•●▪‣◦○*]\s+|^[-–—]\s+/;

// Common section-header words in resumes/reports. Matched against exact
// ALL-CAPS and Title-Case forms only (never plain lowercase) so we never
// mistake an ordinary sentence containing "summary" or "overview" for a
// heading — these headers are structural furniture, not content.
const HEADER_KEYWORDS = [
  'EDUCATION', 'EXPERIENCE', 'EXPERIENCES', 'WORK EXPERIENCE', 'PROJECTS',
  'PROJECT', 'SKILLS', 'TECHNICAL SKILLS', 'SOFT SKILLS', 'CERTIFICATIONS',
  'CERTIFICATION', 'ACHIEVEMENTS', 'ACHIEVEMENT', 'AWARDS', 'PUBLICATIONS',
  'SUMMARY', 'OBJECTIVE', 'PROFILE', 'CONTACT', 'LANGUAGES', 'INTERESTS',
  'HOBBIES', 'REFERENCES', 'INTERNSHIPS', 'INTERNSHIP', 'EXTRACURRICULAR',
  'EXTRACURRICULAR ACTIVITIES', 'VOLUNTEER EXPERIENCE', 'LEADERSHIP',
  'PROBLEM SOLVING', 'COURSEWORK', 'RELEVANT COURSEWORK', 'ABSTRACT',
  'INTRODUCTION', 'CONCLUSION', 'METHODOLOGY', 'RESULTS', 'DISCUSSION',
  'APPENDIX', 'BACKGROUND', 'OVERVIEW', 'DECLARATION', 'PERSONAL DETAILS',
  'STRENGTHS', 'POSITIONS OF RESPONSIBILITY',
];
const HEADER_KEYWORDS_LOWER = new Set(HEADER_KEYWORDS.map((k) => k.toLowerCase()));

function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Forces recognized section headers onto their own line even when PDF/OCR
 * extraction glued them onto the surrounding text with no line break —
 * exactly what happens with resumes like "...90.20% EXPERIENCE Web
 * Developer...". Only matches exact ALL-CAPS or Title-Case forms so it
 * never fires on the word appearing naturally inside a sentence.
 */
function insertHeaderLineBreaks(text) {
  let result = text;
  for (const keyword of HEADER_KEYWORDS) {
    for (const variant of [keyword, titleCase(keyword)]) {
      const pattern = new RegExp(`[ \\t]+(${variant})(?=\\s|$)`, 'g');
      result = result.replace(pattern, '\n$1\n');
    }
  }
  return result;
}

/**
 * Splits ONE line of prose into sentences, handling common abbreviations so
 * "Dr. Smith" doesn't get cut mid-title. Operates on a single line (no
 * embedded newlines) so it never has to guess where bullets start.
 */
function splitProseIntoSentences(line) {
  const cleaned = line.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const rough = cleaned.split(/(?<=[.!?])\s+(?=[A-Z0-9"'“])/g);
  const sentences = [];
  let buffer = '';

  for (const piece of rough) {
    buffer = buffer ? `${buffer} ${piece}` : piece;
    const lastWord = buffer.trim().split(' ').pop().replace(/[.!?"'”]+$/, '').toLowerCase();

    if (ABBREVIATIONS.has(lastWord) && buffer.trim().length < 400) {
      continue; // keep accumulating, this wasn't a real sentence boundary
    }

    sentences.push(buffer.trim());
    buffer = '';
  }

  if (buffer.trim()) sentences.push(buffer.trim());
  return sentences;
}

/**
 * A segment is "noise" when it's structural furniture rather than real
 * content worth summarizing — a contact-info line packed with "|" field
 * separators, or a short ALL-CAPS section header like "EDUCATION". These
 * are excluded from candidacy but still shown in the annotated original.
 */
function isNoiseSegment(text) {
  const pipeCount = (text.match(/\|/g) || []).length;
  if (pipeCount >= 2) return true;

  const words = text.split(/\s+/).filter(Boolean);
  const isShoutingHeader = text === text.toUpperCase() && /[A-Z]/.test(text) && words.length <= 6;
  if (isShoutingHeader) return true;

  if (words.length <= 4 && HEADER_KEYWORDS_LOWER.has(text.trim().toLowerCase())) return true;

  return false;
}

/**
 * Breaks raw document text into meaningful units ("segments"): a line
 * starting with a bullet/list marker becomes ONE atomic segment (never
 * split further, since a résumé bullet or feature-list item is meant to be
 * one point), while ordinary paragraph lines are split into sentences.
 * This is what lets bullet-heavy documents (resumes, feature lists) get
 * summarized properly instead of collapsing into a single giant blob.
 */
function buildSegments(text) {
  // Force bullet glyphs and recognized section headers that got glued onto
  // surrounding text during PDF/OCR extraction back onto their own line.
  const withHeaderBreaks = insertHeaderLineBreaks(text);
  const withBulletBreaks = withHeaderBreaks.replace(/[ \t]*([•●▪‣◦○])[ \t]*/g, '\n$1 ');
  const lines = withBulletBreaks.split('\n');

  const segments = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const bulletMatch = line.match(BULLET_LINE_REGEX);
    if (bulletMatch) {
      const content = line.slice(bulletMatch[0].length).trim();
      if (content) {
        segments.push({ text: content, isBullet: true, isNoise: isNoiseSegment(content) });
      }
      continue;
    }

    for (const sentence of splitProseIntoSentences(line)) {
      segments.push({ text: sentence, isBullet: false, isNoise: isNoiseSegment(sentence) });
    }
  }

  return segments.filter((s) => s.text.split(/\s+/).filter(Boolean).length >= 3);
}

/**
 * Scores every segment by the summed frequency of its meaningful words (a
 * lightweight Luhn-style score), with a bonus for bullet points — they're
 * already curated key facts by the document's own author — and a small
 * position bonus for opening/closing content. Noise segments are always
 * scored last so they're never picked, but still exist in the array so
 * indices line up with the full annotated original.
 */
function scoreSegments(segments) {
  const wordFreq = new Map();

  for (const seg of segments) {
    if (seg.isNoise) continue;
    for (const word of tokenizeWords(seg.text)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  const maxFreq = Math.max(1, ...wordFreq.values());

  return segments.map((seg, index) => {
    if (seg.isNoise) {
      return { ...seg, index, score: -Infinity };
    }

    const words = tokenizeWords(seg.text);
    const meaningfulWordCount = words.length || 1;

    let rawScore = 0;
    for (const word of words) {
      rawScore += (wordFreq.get(word) || 0) / maxFreq;
    }
    let score = rawScore / meaningfulWordCount;

    const positionRatio = index / Math.max(1, segments.length - 1);
    if (index === 0) score *= 1.15;
    else if (positionRatio < 0.15) score *= 1.1;
    else if (positionRatio > 0.9) score *= 1.05;

    if (meaningfulWordCount < 4) score *= 0.6;
    if (seg.isBullet) score *= 1.25;

    return { ...seg, index, score };
  });
}

/**
 * Generates an extractive summary: picks the highest-scoring non-noise
 * segments and joins them back into their original order as ONE flowing
 * paragraph of plain text — no bullet points, no list formatting.
 *
 * Still returns `summaryPoints` for shape-compatibility with the rest of
 * the app, but it's always a single-item array `[{ text, isBullet: false }]`.
 */
function summarizeExtractive(text, length = 'medium') {
  const ratio = LENGTH_RATIOS[length] ?? LENGTH_RATIOS.medium;
  const allSegments = buildSegments(text);
  const candidates = allSegments.filter((s) => !s.isNoise);

  if (candidates.length === 0) {
    return { summary: '', summaryPoints: [], selectedSentenceIndices: [] };
  }

  if (candidates.length <= MIN_SEGMENTS[length]) {
    const summary = candidates.map((s) => s.text).join(' ').trim();
    return {
      summary,
      summaryPoints: [{ text: summary, isBullet: false }],
      selectedSentenceIndices: candidates.map((s) => allSegments.indexOf(s)),
    };
  }

  const targetCount = Math.max(MIN_SEGMENTS[length], Math.round(candidates.length * ratio));

  const scored = scoreSegments(allSegments);
  const top = scored.filter((s) => !s.isNoise).sort((a, b) => b.score - a.score).slice(0, targetCount);
  const inOriginalOrder = top.sort((a, b) => a.index - b.index);
  const summary = inOriginalOrder.map((s) => s.text).join(' ').trim();

  return {
    summary,
    summaryPoints: [{ text: summary, isBullet: false }],
    selectedSentenceIndices: inOriginalOrder.map((s) => s.index),
    totalSentences: allSegments.length,
  };
}

/**
 * Same as summarizeExtractive, but also returns the full segment list with
 * a `highlighted` flag on each one. Powers the UI's "annotated original"
 * view, where the exact segments chosen for the summary are marked in the
 * source text — making the extraction transparent instead of a black box.
 */
function summarizeWithAnnotations(text, length = 'medium') {
  const result = summarizeExtractive(text, length);
  const allSegments = buildSegments(text);
  const highlightedSet = new Set(result.selectedSentenceIndices);

  const annotatedSentences = allSegments.map((seg, index) => ({
    text: seg.text,
    isBullet: seg.isBullet,
    highlighted: highlightedSet.has(index),
  }));

  return { ...result, annotatedSentences };
}

// Kept for compatibility — flattened list of segment text, no structure.
function splitIntoSentences(text) {
  return buildSegments(text).map((s) => s.text);
}

module.exports = { summarizeExtractive, summarizeWithAnnotations, splitIntoSentences, buildSegments };
