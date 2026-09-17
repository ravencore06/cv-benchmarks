const express = require('express');
const Joi = require('joi');
const pool = require('../db/config');

const router = express.Router();
const submissionSchema = Joi.object({
  model_name: Joi.string().trim().max(255).required(),
  organization: Joi.string().trim().max(255).allow('', null),
  benchmark_id: Joi.string().trim().max(100).required(),
  score: Joi.number().required(),
  paper_url: Joi.string().uri().allow('', null),
});

router.post('/', async (req, res) => {
  const { error, value } = submissionSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details.map((detail) => detail.message).join(', ') });
  try {
    const result = await pool.query(
      `INSERT INTO submissions (model_name, organization, benchmark_id, score, paper_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, model_name, organization, benchmark_id, score, paper_url, created_at`,
      [value.model_name, value.organization || null, value.benchmark_id, value.score, value.paper_url || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Unknown benchmark_id.' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
