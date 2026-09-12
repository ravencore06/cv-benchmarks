const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// GET all datasets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM datasets ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new dataset
router.post('/', async (req, res) => {
  try {
    const { name, description, url, paper_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Dataset name is required' });
    }

    const result = await pool.query(
      'INSERT INTO datasets (name, description, url, paper_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, url, paper_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Dataset already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
