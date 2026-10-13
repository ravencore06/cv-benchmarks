const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// GET all models
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.id, m.name, m.description, m.organization, m.framework, m.url, m.paper_url,
         COALESCE(
           (SELECT s_org.organization FROM submissions s_org WHERE s_org.model_name = m.name AND s_org.organization IS NOT NULL LIMIT 1),
           m.organization
         ) AS resolved_organization,
         COALESCE(
           (SELECT s.score FROM submissions s WHERE s.model_name = m.name AND s.verification_status = 'verified' ORDER BY s.score DESC LIMIT 1),
           0
         ) AS top_verified_score,
         COALESCE(
           (SELECT COUNT(*) FROM submissions s WHERE s.model_name = m.name AND s.verification_status = 'verified'),
           0
         ) AS verified_evaluation_count,
         COALESCE(
           (SELECT COUNT(*) FROM submissions s WHERE s.model_name = m.name AND s.verification_status = 'synthetic'),
           0
         ) AS synthetic_evaluation_count,
         COALESCE(
           (SELECT s.evaluation_protocol FROM submissions s WHERE s.model_name = m.name ORDER BY s.score DESC LIMIT 1),
           'paper_reported'
         ) AS top_protocol
      FROM models m
      ORDER BY verified_evaluation_count DESC, m.name ASC`
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
