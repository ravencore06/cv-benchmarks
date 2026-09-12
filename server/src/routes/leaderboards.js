const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// GET leaderboard data
router.get('/', async (req, res) => {
  try {
    const { dataset, metric } = req.query;

    let query = `
      SELECT 
        m.name as model,
        d.name as dataset,
        b.metric,
        b.score,
        b.score_std,
        COUNT(*) as benchmark_count,
        MAX(b.created_at) as latest_submission
      FROM benchmarks b
      LEFT JOIN models m ON b.model_id = m.id
      LEFT JOIN datasets d ON b.dataset_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (dataset) {
      query += ` AND d.name = $${paramCount}`;
      params.push(dataset);
      paramCount++;
    }

    if (metric) {
      query += ` AND b.metric = $${paramCount}`;
      params.push(metric);
      paramCount++;
    }

    query += ` GROUP BY m.name, d.name, b.metric ORDER BY b.score DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
