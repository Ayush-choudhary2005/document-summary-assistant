const fs = require('fs/promises');
const pdfParse = require('pdf-parse');

/**
 * Extracts text from a PDF file while preserving paragraph structure as
 * closely as pdf-parse's layout data allows: consecutive lines are joined
 * into paragraphs, and blank lines / page breaks are kept as paragraph
 * separators instead of being collapsed into one wall of text.
 */
async function extractTextFromPdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);

  const rawText = data.text || '';

  const normalized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!normalized) {
    const err = new Error(
      'No extractable text was found in this PDF. It may be a scanned document — try uploading it as an image instead so OCR can read it.'
    );
    err.status = 422;
    throw err;
  }

  return {
    text: normalized,
    pageCount: data.numpages || 1,
    source: 'pdf-parse',
  };
}

module.exports = { extractTextFromPdf };
