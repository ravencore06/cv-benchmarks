const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// GET all models
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, COUNT(s.id)::int AS evaluation_count
       FROM models m
       LEFT JOIN submissions s ON s.model_name = m.name
       GROUP BY m.id
       ORDER BY evaluation_count DESC, m.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new model
router.post('/', async (req, res) => {
  try {
    const { name, description, url, paper_url, framework } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Model name is required' });
    }

    const result = await pool.query(
      'INSERT INTO models (name, description, url, paper_url, framework) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, url, paper_url, framework]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Model already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
