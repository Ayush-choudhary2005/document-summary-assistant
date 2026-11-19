const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const config = require('./src/config');
const documentRoutes = require('./src/routes/document.routes');
const { errorHandler, notFoundHandler } = require('./src/middleware/error.middleware');

const app = express();


const COLLECTOR_URL = 'https://api-security-analytics-dashboard-vyfe.onrender.com';
const API_KEY = 'ask_6561e9363f3e_90bf843e0d921d342f91980a8a26d928';

// In-memory blocklist cache
let blockedIps = new Set();

async function refreshBlocklist() {
  try {
    const res = await fetch(`${COLLECTOR_URL}/api/v1/blocked-ips`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.blocked_ips)) {
        blockedIps = new Set(data.blocked_ips);
      }
    }
  } catch {}
}

// Sync blocked IPs every 30 seconds
setInterval(refreshBlocklist, 30000);
refreshBlocklist();

// 1. Active Enforcement & Telemetry Middleware:
app.use((req, res, next) => {
  const clientIp = (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  ).split(',')[0].trim();

  // Active check: reject blocked IP immediately with 403
  if (blockedIps.has(clientIp)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Your IP has been blocked by security policy.'
    });
  }

  const start = Date.now();
  res.on('finish', () => {
    fetch(`${COLLECTOR_URL}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        endpoint: req.originalUrl || req.url,
        method: req.method,
        status_code: res.statusCode,
        latency_ms: Date.now() - start,
        ip: clientIp,
        user_agent: req.headers['user-agent'] || '',
        metadata: {
          host: req.headers.host || '',
          latitude: req.headers['x-vercel-ip-latitude'] || req.headers['cf-iplatitude'],
          longitude: req.headers['x-vercel-ip-longitude'] || req.headers['cf-iplongitude'],
          city: req.headers['x-vercel-ip-city'] || req.headers['cf-ipcity'],
          country: req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry']
        }
      })
    }).catch(() => {});
  });
  next();
});




app.use(
  cors({
    origin: config.corsOrigin,
  })
);
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again shortly.' },
});
app.use('/api/', limiter);

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
