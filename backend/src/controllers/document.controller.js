const fs = require('fs/promises');
const path = require('path');

const { extractTextFromPdf } = require('../services/pdf.service');
const { extractTextFromImage } = require('../services/ocr.service');
const { summarizeExtractive, summarizeWithAnnotations } = require('../services/summary.service');
const { summarizeWithAI, isAvailable: aiAvailable } = require('../services/aiSummary.service');
const { extractKeywords } = require('../utils/keywords.util');
const { buildStats } = require('../utils/textStats.util');

const VALID_LENGTHS = new Set(['short', 'medium', 'long']);

async function extractText(file) {
  const isPdf = file.mimetype === 'application/pdf';
  return isPdf ? extractTextFromPdf(file.path) : extractTextFromImage(file.path);
}

async function safeUnlink(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
    // Non-fatal — temp OS storage gets cleaned up eventually regardless.
  }
}

/**
 * POST /api/documents/summarize
 * Handles a single document: extract text (PDF parsing or OCR), then
 * generate a summary (extractive by default, or AI-enhanced if requested
 * and configured).
 */
async function summarizeDocument(req, res) {
  if (!req.file) {
    const err = new Error('No file was uploaded. Attach a PDF or image under the "document" field.');
    err.status = 400;
    throw err;
  }

  const length = VALID_LENGTHS.has(req.body.length) ? req.body.length : 'medium';
  const useAI = req.body.mode === 'ai-enhanced';

  try {
    const extraction = await extractText(req.file);

    let summaryResult;
    let annotatedSentences = null;
    if (useAI) {
      summaryResult = await summarizeWithAI(extraction.text, length);
    } else {
      const result = summarizeWithAnnotations(extraction.text, length);
      summaryResult = { summary: result.summary, mode: 'extractive' };
      annotatedSentences = result.annotatedSentences;
    }

    const keywords = extractKeywords(extraction.text, 12);
    const stats = buildStats(extraction.text, summaryResult.summary);

    res.json({
      success: true,
      data: {
        fileName: req.file.originalname,
        extractionSource: extraction.source,
        pageCount: extraction.pageCount || null,
        ocrConfidence: extraction.confidence ?? null,
        originalText: extraction.text,
        summary: summaryResult.summary,
        summaryMode: summaryResult.mode,
        summaryLength: length,
        annotatedSentences,
        keywords,
        stats,
      },
    });
  } finally {
    await safeUnlink(req.file.path);
  }
}

/**
 * POST /api/documents/summarize-batch
 * EXTRA FEATURE: processes multiple documents in one request so users can
 * drag a whole folder of scans in at once.
 */
async function summarizeBatch(req, res) {
  if (!req.files || req.files.length === 0) {
    const err = new Error('No files were uploaded. Attach one or more files under the "documents" field.');
    err.status = 400;
    throw err;
  }

  const length = VALID_LENGTHS.has(req.body.length) ? req.body.length : 'medium';

  const results = await Promise.all(
    req.files.map(async (file) => {
      try {
        const extraction = await extractText(file);
        const result = summarizeExtractive(extraction.text, length);
        const keywords = extractKeywords(extraction.text, 8);
        const stats = buildStats(extraction.text, result.summary);

        return {
          fileName: file.originalname,
          success: true,
          summary: result.summary,
          keywords,
          stats,
        };
      } catch (err) {
        return { fileName: file.originalname, success: false, error: err.message };
      } finally {
        await safeUnlink(file.path);
      }
    })
  );

  res.json({ success: true, data: results });
}

function getCapabilities(req, res) {
  res.json({
    success: true,
    data: {
      aiEnhancedModeAvailable: aiAvailable(),
      maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 15),
      supportedTypes: ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'],
    },
  });
}

module.exports = { summarizeDocument, summarizeBatch, getCapabilities };
