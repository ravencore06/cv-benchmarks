require('dotenv').config();
const express = require('express');
const cors = require('cors');
const benchmarkRoutes = require('./routes/benchmarks');
const datasetRoutes = require('./routes/datasets');
const modelRoutes = require('./routes/models');
const leaderboardRoutes = require('./routes/leaderboards');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/benchmarks', benchmarkRoutes);
app.use('/api/v1/datasets', datasetRoutes);
app.use('/api/v1/models', modelRoutes);
app.use('/api/v1/leaderboards', leaderboardRoutes);

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
  console.log(`📝 Documentation: http://localhost:${PORT}/api/v1`);
  console.log(`\n`);
});

module.exports = app;
