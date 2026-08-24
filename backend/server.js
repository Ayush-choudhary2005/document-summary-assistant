const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const config = require('./src/config');
const documentRoutes = require('./src/routes/document.routes');
const { errorHandler, notFoundHandler } = require('./src/middleware/error.middleware');

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
  })
);
app.use(express.json());

// Basic abuse protection — document processing (OCR especially) is CPU heavy.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again shortly.' },
});
app.use('/api/', limiter);

// Friendly root route — this API is meant to be called from the frontend,
// not visited directly, but a bare 404 on "/" confuses people checking
// whether the deploy worked. Point them to the real health check instead.
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Document Summary Assistant API is running.',
    healthCheck: '/api/health',
    docs: 'See README.md for the full API reference.',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/documents', documentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Document Summary Assistant API listening on port ${config.port} [${config.nodeEnv}]`);
});
