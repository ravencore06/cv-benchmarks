const express = require('express');
const router = express.Router();
const pool = require('../db/config');
const { validateBenchmark } = require('../validators/benchmarkValidator');

const sortableColumns = new Set(['created_at', 'updated_at', 'score', 'name', 'metric']);
const selectBenchmarks = `
  SELECT b.id, b.name, b.description, b.metric, b.score, b.score_std,
    d.name AS dataset, m.name AS model, b.url, b.code_url, b.paper_url,
    b.submitted_by, b.submission_date, b.created_at, b.updated_at
  FROM benchmarks b
  LEFT JOIN datasets d ON b.dataset_id = d.id
  LEFT JOIN models m ON b.model_id = m.id`;

router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const filters = [];
    const params = [];
    const addFilter = (column, value) => {
      if (!value) return;
      params.push(`%${value}%`);
      filters.push(`${column} ILIKE $${params.length}`);
    };
    addFilter('name', req.query.search);
    addFilter('category', req.query.category);
    addFilter('task_type', req.query.task_type);
    addFilter('metric', req.query.metric);
    const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
    const countResult = await pool.query(`SELECT COUNT(*) FROM document_benchmarks${where}`, params);
    params.push(limit, (page - 1) * limit);
    const dataResult = await pool.query(`SELECT id, name, category, task_type, dataset_url, metric, input_format FROM document_benchmarks${where} ORDER BY name LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    const total = Number(countResult.rows[0].count);
    res.json({ data: dataResult.rows, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`${selectBenchmarks} WHERE b.id = $1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Benchmark not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { error, value } = validateBenchmark(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const dataset = value.dataset ? await pool.query('INSERT INTO datasets (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id', [value.dataset]) : null;
    const model = value.model ? await pool.query('INSERT INTO models (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id', [value.model]) : null;
    const result = await pool.query(
      `INSERT INTO benchmarks (name, description, dataset_id, model_id, metric, score, score_std, url, code_url, paper_url, submitted_by, submission_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
      [value.name, value.description, dataset?.rows[0].id || null, model?.rows[0].id || null, value.metric, value.score, value.score_std, value.url, value.code_url, value.paper_url, value.submitted_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(error.code === '23505' ? 409 : 500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const allowed = ['name', 'description', 'metric', 'score', 'score_std', 'url', 'code_url', 'paper_url'];
    const changes = allowed.filter((field) => req.body[field] !== undefined);
    if (!changes.length) return res.status(400).json({ error: 'No editable fields supplied' });
    const params = changes.map((field) => req.body[field]);
    const assignments = changes.map((field, index) => `${field} = $${index + 1}`);
    params.push(req.params.id);
    const result = await pool.query(`UPDATE benchmarks SET ${assignments.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`, params);
    if (!result.rows.length) return res.status(404).json({ error: 'Benchmark not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM benchmarks WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Benchmark not found' });
    res.json({ message: 'Benchmark deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
