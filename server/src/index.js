require('dotenv').config();
const express = require('express');
const cors = require('cors');
const benchmarkRoutes = require('./routes/benchmarks');
const datasetRoutes = require('./routes/datasets');
const modelRoutes = require('./routes/models');
const leaderboardRoutes = require('./routes/leaderboards');
const submissionRoutes = require('./routes/submissions');

const app = express();
const PORT = process.env.PORT || 5000;
const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(cors({ origin: corsOrigins.includes('*') ? '*' : corsOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API index
app.get('/', (req, res) => {
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
    ],
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/benchmarks', benchmarkRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/models', modelRoutes);
app.use('/api/v1/leaderboards', leaderboardRoutes);
app.use('/api/v1/submissions', submissionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    status: 500,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 CV Benchmarks API running on port ${PORT}`);
  console.log(`🔎 Benchmarks:   http://localhost:${PORT}/api/v1/benchmarks`);
  console.log(`🏆 Leaderboards: http://localhost:${PORT}/api/v1/leaderboards`);
  console.log(`❤️  Health:       http://localhost:${PORT}/health`);
  console.log(`\n`);
});

module.exports = app;
