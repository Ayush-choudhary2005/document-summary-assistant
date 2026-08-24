const multer = require('multer');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function errorHandler(err, req, res, next) {
  console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. Check the size limit in the server .env file.'
        : err.message;
    return res.status(400).json({ success: false, error: message });
  }

  const status = err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong while processing your document.'
      : err.message;

  res.status(status).json({ success: false, error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
}

module.exports = { asyncHandler, errorHandler, notFoundHandler };
