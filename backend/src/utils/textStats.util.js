const AVERAGE_READING_WPM = 200;

function countWords(text) {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

function estimateReadingTimeMinutes(wordCount) {
  return Math.max(1, Math.ceil(wordCount / AVERAGE_READING_WPM));
}

function buildStats(originalText, summaryText) {
  const originalWords = countWords(originalText);
  const summaryWords = countWords(summaryText);
  const compressionRatio = originalWords > 0 ? summaryWords / originalWords : 0;

  return {
    originalWordCount: originalWords,
    originalCharCount: originalText.length,
    originalReadingTimeMin: estimateReadingTimeMinutes(originalWords),
    summaryWordCount: summaryWords,
    summaryCharCount: summaryText.length,
    summaryReadingTimeMin: estimateReadingTimeMinutes(summaryWords),
    compressionPercent: Math.round((1 - compressionRatio) * 100),
  };
}

module.exports = { countWords, estimateReadingTimeMinutes, buildStats };
