const STOPWORDS = new Set(
  (
    'a about above after again against all am an and any are aren as at be because been ' +
    'before being below between both but by can cannot could did do does doing down during ' +
    'each few for from further had has have having he her here hers herself him himself his ' +
    'how i if in into is it its itself just me more most my myself no nor not now of off on ' +
    'once only or other our ours ourselves out over own same she should so some such than that ' +
    'the their theirs them themselves then there these they this those through to too under ' +
    'until up very was we were what when where which while who whom why will with would you ' +
    'your yours yourself yourselves also may might shall must one two three per within without ' +
    'upon been being still yet however therefore thus'
  ).split(' ')
);

function tokenizeWords(text) {
  return (text.toLowerCase().match(/[a-z][a-z'-]{1,}/g) || []).filter(
    (w) => !STOPWORDS.has(w) && w.length > 2
  );
}

/**
 * Extracts the most frequent, meaningful words/phrases from the document to
 * power the keyword tag cloud. Uses simple term-frequency scoring with a
 * light bonus for capitalized terms in the original text (likely proper
 * nouns / named entities).
 */
function extractKeywords(originalText, limit = 10) {
  const words = tokenizeWords(originalText);
  const freq = new Map();

  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  // Bonus for words that frequently appear capitalized in the source
  // (a cheap proxy for proper nouns / key entities).
  const capitalizedCounts = new Map();
  const capMatches = originalText.match(/\b[A-Z][a-zA-Z'-]{2,}\b/g) || [];
  for (const w of capMatches) {
    const lw = w.toLowerCase();
    if (!STOPWORDS.has(lw)) {
      capitalizedCounts.set(lw, (capitalizedCounts.get(lw) || 0) + 1);
    }
  }

  const scored = [...freq.entries()].map(([word, count]) => {
    const capBonus = (capitalizedCounts.get(word) || 0) * 0.5;
    return { word, score: count + capBonus, count };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => ({
    text: item.word,
    count: item.count,
  }));
}

module.exports = { tokenizeWords, extractKeywords, STOPWORDS };
