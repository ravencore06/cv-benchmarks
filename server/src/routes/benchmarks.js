const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { validateBenchmark } = require('../validators/benchmarkValidator');

// GET all benchmarks with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, dataset, model, metric, sort = 'created_at' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.id, b.name, b.description, b.metric, b.score, b.score_std,
        d.name as dataset, m.name as model,
        b.url, b.code_url, b.submitted_by, b.submission_date,
        b.created_at, b.updated_at
      FROM benchmarks b
      LEFT JOIN datasets d ON b.dataset_id = d.id
      LEFT JOIN models m ON b.model_id = m.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (dataset) {
      query += ` AND d.name ILIKE $${paramCount}`;
      params.push(`%${dataset}%`);
      paramCount++;
    }

    if (model) {
      query += ` AND m.name ILIKE $${paramCount}`;
      params.push(`%${model}%`);
      paramCount++;
    }

    if (metric) {
      query += ` AND b.metric ILIKE $${paramCount}`;
      params.push(`%${metric}%`);
      paramCount++;
    }

    query += ` ORDER BY b.${sort} DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM benchmarks b LEFT JOIN datasets d ON b.dataset_id = d.id LEFT JOIN models m ON b.model_id = m.id WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (dataset) {
      countQuery += ` AND d.name ILIKE $${countParamCount}`;
      countParams.push(`%${dataset}%`);
      countParamCount++;
    }
    if (model) {
      countQuery += ` AND m.name ILIKE $${countParamCount}`;
      countParams.push(`%${model}%`);
      countParamCount++;
    }
    if (metric) {
      countQuery += ` AND b.metric ILIKE $${countParamCount}`;
      countParams.push(`%${metric}%`);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single benchmark
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        b.*, d.name as dataset, m.name as model
       FROM benchmarks b
       LEFT JOIN datasets d ON b.dataset_id = d.id
       LEFT JOIN models m ON b.model_id = m.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Benchmark not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new benchmark
router.post('/', async (req, res) => {
  try {
    const { error, value } = validateBenchmark(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, dataset, model, metric, score, score_std, url, code_url, submitted_by } = value;

    // Get or create dataset
    let datasetId = null;
    if (dataset) {
      const dsResult = await pool.query(
        'INSERT INTO datasets (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
        [dataset]
      );
      datasetId = dsResult.rows[0].id;
    }

    // Get or create model
    let modelId = null;
    if (model) {
      const mResult = await pool.query(
        'INSERT INTO models (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = $1 RETURNING id',
        [model]
      );
      modelId = mResult.rows[0].id;
    }

    // Insert benchmark
    const result = await pool.query(
      `INSERT INTO benchmarks (name, description, dataset_id, model_id, metric, score, score_std, url, code_url, submitted_by, submission_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [name, description, datasetId, modelId, metric, score, score_std, url, code_url, submitted_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update benchmark
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, metric, score, score_std, url, code_url } = req.body;

    const result = await pool.query(
      `UPDATE benchmarks 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description),
           metric = COALESCE($3, metric),
           score = COALESCE($4, score),
           score_std = COALESCE($5, score_std),
           url = COALESCE($6, url),
           code_url = COALESCE($7, code_url),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, description, metric, score, score_std, url, code_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Benchmark not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE benchmark
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM benchmarks WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Benchmark not found' });
    }

    res.json({ message: 'Benchmark deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
