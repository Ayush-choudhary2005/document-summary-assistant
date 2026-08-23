const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

let client = null;
if (config.anthropic.enabled) {
  client = new Anthropic({ apiKey: config.anthropic.apiKey });
}

const POINT_COUNT_INSTRUCTIONS = {
  short: '3-4 bullet points',
  medium: '5-7 bullet points',
  long: '8-12 bullet points, grouping related ideas together',
};

/**
 * EXTRA FEATURE: "AI Enhanced Mode".
 * When an ANTHROPIC_API_KEY is configured, this produces an abstractive
 * summary (written in fresh language, not just copied sentences) using
 * Claude. This is fully optional — the app's default extractive summarizer
 * requires no API key and works offline.
 */
async function summarizeWithAI(text, length = 'medium') {
  if (!client) {
    const err = new Error(
      'AI Enhanced Mode is not configured on this server. Set ANTHROPIC_API_KEY in backend/.env to enable it.'
    );
    err.status = 503;
    throw err;
  }

  const pointInstruction = POINT_COUNT_INSTRUCTIONS[length] || POINT_COUNT_INSTRUCTIONS.medium;

  // Guard against sending an enormous document straight through.
  const trimmedText = text.length > 60000 ? `${text.slice(0, 60000)}\n[...truncated]` : text;

  const response = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content:
          `Summarize the following document as ${pointInstruction}. ` +
          'Each point must be on its own line, starting with "- ", written as a complete, ' +
          'standalone sentence covering one distinct idea (never merge two ideas into one bullet, ' +
          'and never split one idea across two bullets). ' +
          'Respond with only the bullet points, no heading, no preamble, no closing remarks.\n\n' +
          `---DOCUMENT---\n${trimmedText}`,
      },
    ],
  });

  const rawText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  const summaryPoints = rawText
    .split('\n')
    .map((line) => line.replace(/^[\s•*-]+/, '').trim())
    .filter(Boolean);

  const summary = summaryPoints.join('\n\n');

  return { summary, summaryPoints, mode: 'ai-enhanced', model: config.anthropic.model };
}

module.exports = { summarizeWithAI, isAvailable: () => Boolean(client) };
