const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// GET leaderboard data
router.get('/', async (req, res) => {
  try {
    const params = [];
    const filters = [];
    if (req.query.benchmark_id) {
      params.push(req.query.benchmark_id);
      filters.push(`s.benchmark_id = $${params.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `
      WITH ranked_submissions AS (
        SELECT
          s.benchmark_id,
          s.model_name,
          s.organization,
          s.score,
          DENSE_RANK() OVER (PARTITION BY s.benchmark_id ORDER BY s.score DESC) AS rank
        FROM submissions s
        ${where}
      )
      SELECT model_name, organization, benchmark_id, score, rank
      FROM ranked_submissions
      ORDER BY benchmark_id, rank, model_name`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
