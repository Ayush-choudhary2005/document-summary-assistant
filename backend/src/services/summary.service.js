const { tokenizeWords, STOPWORDS } = require('../utils/keywords.util');

// Fraction of sentences to keep for each requested length.
const LENGTH_RATIOS = {
  short: 0.15,
  medium: 0.3,
  long: 0.5,
};

const MIN_SENTENCES = { short: 2, medium: 4, long: 6 };

const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'vs', 'etc', 'e.g', 'i.e',
  'inc', 'ltd', 'co', 'fig', 'no', 'st', 'approx',
]);

/**
 * Splits raw text into sentences without pulling in a heavy NLP dependency.
 * Handles common abbreviations so "Dr. Smith" doesn't get cut mid-title.
 */
function splitIntoSentences(text) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
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

  return sentences.filter((s) => s.split(' ').filter(Boolean).length >= 3);
}

/**
 * Scores every sentence by the summed frequency of its meaningful words
 * (a lightweight version of the classic Luhn algorithm), with small
 * position bonuses for opening/closing sentences, which tend to carry
 * topic sentences and conclusions.
 */
function scoreSentences(sentences) {
  const wordFreq = new Map();

  for (const sentence of sentences) {
    for (const word of tokenizeWords(sentence)) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  const maxFreq = Math.max(1, ...wordFreq.values());

  return sentences.map((sentence, index) => {
    const words = tokenizeWords(sentence);
    const meaningfulWordCount = words.length || 1;

    let rawScore = 0;
    for (const word of words) {
      rawScore += (wordFreq.get(word) || 0) / maxFreq;
    }

    // Normalize so long sentences don't win purely on word count.
    let score = rawScore / meaningfulWordCount;

    // Position bonus: openings set up the topic, closings often conclude it.
    const positionRatio = index / Math.max(1, sentences.length - 1);
    if (index === 0) score *= 1.35;
    else if (positionRatio < 0.15) score *= 1.15;
    else if (positionRatio > 0.9) score *= 1.1;

    // Mild penalty for very short filler sentences.
    if (meaningfulWordCount < 4) score *= 0.6;

    return { sentence, index, score };
  });
}

/**
 * Generates an extractive summary: picks the highest-scoring sentences,
 * then re-orders them back into their original sequence so the summary
 * still reads coherently top to bottom.
 */
function summarizeExtractive(text, length = 'medium') {
  const ratio = LENGTH_RATIOS[length] ?? LENGTH_RATIOS.medium;
  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    return { summary: '', selectedSentenceIndices: [] };
  }

  if (sentences.length <= MIN_SENTENCES[length]) {
    return {
      summary: sentences.join(' '),
      selectedSentenceIndices: sentences.map((_, i) => i),
    };
  }

  const targetCount = Math.max(
    MIN_SENTENCES[length],
    Math.round(sentences.length * ratio)
  );

  const scored = scoreSentences(sentences);
  const topSentences = [...scored].sort((a, b) => b.score - a.score).slice(0, targetCount);
  const inOriginalOrder = topSentences.sort((a, b) => a.index - b.index);

  return {
    summary: inOriginalOrder.map((s) => s.sentence).join(' '),
    selectedSentenceIndices: inOriginalOrder.map((s) => s.index),
    totalSentences: sentences.length,
  };
}

/**
 * Same as summarizeExtractive, but also returns the full sentence list with
 * a `highlighted` flag on each one. Powers the UI's "annotated original"
 * view, where the exact sentences chosen for the summary are marked in the
 * source text — making the extraction transparent instead of a black box.
 */
function summarizeWithAnnotations(text, length = 'medium') {
  const result = summarizeExtractive(text, length);
  const sentences = splitIntoSentences(text);
  const highlightedSet = new Set(result.selectedSentenceIndices);

  const annotated = sentences.map((sentence, index) => ({
    text: sentence,
    highlighted: highlightedSet.has(index),
  }));

  return { ...result, annotatedSentences: annotated };
}

module.exports = { summarizeExtractive, summarizeWithAnnotations, splitIntoSentences };
