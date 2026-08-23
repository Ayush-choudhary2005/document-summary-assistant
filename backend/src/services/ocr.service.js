const Tesseract = require('tesseract.js');

/**
 * Runs OCR over an image file (scanned document, photo of a page, etc.)
 * and returns the recognized text plus a confidence score so the UI can
 * warn the user when a scan was low quality.
 */
async function extractTextFromImage(filePath, onProgress) {
  const { data } = await Tesseract.recognize(filePath, 'eng', {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const text = (data.text || '').trim();

  if (!text) {
    const err = new Error(
      'OCR could not detect any readable text in this image. Try a higher-resolution scan with good lighting and contrast.'
    );
    err.status = 422;
    throw err;
  }

  return {
    text,
    confidence: Math.round(data.confidence || 0),
    source: 'tesseract-ocr',
  };
}

module.exports = { extractTextFromImage };
