try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional in production environments
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const benchmarkRoutes = require('./routes/benchmarks');
const datasetRoutes = require('./routes/datasets');
const modelRoutes = require('./routes/models');
const leaderboardRoutes = require('./routes/leaderboards');
const submissionRoutes = require('./routes/submissions');
const domainRoutes = require('./routes/domains');

const app = express();
const PORT = process.env.PORT || 5000;
const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        process.env.NODE_ENV !== 'production' ||
        corsOrigins.includes('*') ||
        corsOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Info Endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'CV Benchmarks API',
    version: 'v1',
    endpoints: [
      '/health',
      '/api/v1/benchmarks',
      '/api/v1/datasets',
      '/api/v1/models',
      '/api/v1/leaderboards',
      '/api/v1/submissions',
      '/api/v1/domains/document-ai',
    ],
  });
});

// API Routes
app.use('/api/v1/benchmarks', benchmarkRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/models', modelRoutes);
app.use('/api/v1/leaderboards', leaderboardRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/domains', domainRoutes);

// Static frontend serving & SPA fallback
function getStaticPath() {
  const possiblePaths = [
    path.join(__dirname, 'public'),
    path.join(__dirname, '../public'),
    path.join(process.cwd(), 'dist/public'),
    path.join(process.cwd(), 'client/dist'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
      return p;
    }
  }
  return null;
}

const staticPath = getStaticPath();
if (staticPath) {
  console.log(`📁 Serving static frontend from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    status: 500,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 CV Benchmarks server running on port ${PORT}`);
    console.log(`🔎 Benchmarks:   http://localhost:${PORT}/api/v1/benchmarks`);
    console.log(`🏆 Leaderboards: http://localhost:${PORT}/api/v1/leaderboards`);
    console.log(`❤️  Health:       http://localhost:${PORT}/health`);
    console.log(`\n`);
  });
}

module.exports = app;

