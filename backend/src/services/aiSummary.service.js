const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

let client = null;
if (config.anthropic.enabled) {
  client = new Anthropic({ apiKey: config.anthropic.apiKey });
}

const LENGTH_INSTRUCTIONS = {
  short: 'in 2-3 concise sentences',
  medium: 'in one tight paragraph (5-7 sentences)',
  long: 'in 2-3 well-organized paragraphs covering all major points',
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

  const instruction = LENGTH_INSTRUCTIONS[length] || LENGTH_INSTRUCTIONS.medium;

  // Guard against sending an enormous document straight through.
  const trimmedText = text.length > 60000 ? `${text.slice(0, 60000)}\n[...truncated]` : text;

  const response = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content:
          `Summarize the following document ${instruction}. ` +
          'Capture the main ideas and key points. Respond with only the summary text, no preamble.\n\n' +
          `---DOCUMENT---\n${trimmedText}`,
      },
    ],
  });

  const summary = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  return { summary, mode: 'ai-enhanced', model: config.anthropic.model };
}

module.exports = { summarizeWithAI, isAvailable: () => Boolean(client) };
