const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// Canonical 9 Document AI benchmark family IDs
const CANONICAL_BENCHMARK_IDS = [
  'docvqa',
  'publaynet',
  'cord-v2',
  'funsd',
  'rvl-cdip',
  'sroie',
  'doclaynet',
  'pubtables-1m',
  'chartqa',
];

const placeholders = CANONICAL_BENCHMARK_IDS.map((_, i) => `$${i + 1}`).join(', ');

router.get('/document-ai', async (req, res) => {
  try {
    // 1. Fetch 9 Canonical Document AI Benchmarks with evaluated submission count and top score
    const benchmarksQuery = `
      SELECT 
        db.id,
        db.name,
        db.category,
        db.task_type,
        db.dataset_url,
        db.metric,
        db.input_format,
        COUNT(s.id)::int AS evaluation_count,
        MAX(s.score) AS best_score,
        (
          SELECT s2.model_name 
          FROM submissions s2 
          WHERE s2.benchmark_id = db.id 
          ORDER BY s2.score DESC 
          LIMIT 1
        ) AS best_model
      FROM document_benchmarks db
      LEFT JOIN submissions s ON s.benchmark_id = db.id
      WHERE db.id IN (${placeholders})
      GROUP BY db.id, db.name, db.category, db.task_type, db.dataset_url, db.metric, db.input_format;
    `;

    // 2. Fetch Models Evaluated on Document AI benchmarks
    const modelsQuery = `
      SELECT 
        m.id,
        m.name,
        m.description,
        m.framework,
        m.url,
        m.paper_url,
        COALESCE(
          (SELECT s_org.organization FROM submissions s_org WHERE s_org.model_name = m.name AND s_org.organization IS NOT NULL LIMIT 1),
          SPLIT_PART(m.description, ' · ', 1)
        ) AS organization,
        COUNT(DISTINCT s.id)::int AS evaluation_count,
        ARRAY_AGG(DISTINCT s.benchmark_id) FILTER (WHERE s.benchmark_id IS NOT NULL) AS evaluated_benchmarks
      FROM models m
      INNER JOIN submissions s ON s.model_name = m.name
      WHERE s.benchmark_id IN (${placeholders})
      GROUP BY m.id, m.name, m.description, m.framework, m.url, m.paper_url
      ORDER BY evaluation_count DESC, m.name ASC;
    `;

    // 3. Fetch all Submissions for Document AI benchmarks (for hierarchy & detail)
    const submissionsQuery = `
      SELECT 
        s.id,
        s.model_name,
        s.organization,
        s.benchmark_id,
        s.score,
        s.paper_url,
        s.created_at,
        m.framework AS architecture,
        m.url AS repo_url,
        m.description AS model_description
      FROM submissions s
      LEFT JOIN models m ON s.model_name = m.name
      WHERE s.benchmark_id IN (${placeholders})
      ORDER BY s.benchmark_id, s.score DESC;
    `;

    const [benchmarksResult, modelsResult, submissionsResult] = await Promise.all([
      pool.query(benchmarksQuery, CANONICAL_BENCHMARK_IDS),
      pool.query(modelsQuery, CANONICAL_BENCHMARK_IDS),
      pool.query(submissionsQuery, CANONICAL_BENCHMARK_IDS),
    ]);

    // Sort benchmarks according to CANONICAL_BENCHMARK_IDS order
    const benchmarkMap = new Map(benchmarksResult.rows.map((b) => [b.id, b]));
    const benchmarks = CANONICAL_BENCHMARK_IDS.map((id) => benchmarkMap.get(id)).filter(Boolean);

    const models = modelsResult.rows;
    const submissions = submissionsResult.rows;

    // Calculate dynamic stats
    const benchmark_count = benchmarks.length;
    const model_count = models.length;
    const evaluation_count = submissions.length;
    const task_count = new Set(benchmarks.map((b) => b.task_type)).size;

    // Build hierarchy: Domain -> Benchmark -> Submissions -> Model
    const hierarchy = benchmarks.map((b) => {
      const bSubmissions = submissions
        .filter((s) => s.benchmark_id === b.id)
        .map((s) => ({
          submission_id: s.id,
          model_name: s.model_name,
          organization: s.organization,
          score: s.score,
          paper_url: s.paper_url,
          created_at: s.created_at,
          architecture: s.architecture,
          repo_url: s.repo_url,
          model_description: s.model_description,
        }));

      return {
        benchmark_id: b.id,
        benchmark_name: b.name,
        task_type: b.task_type,
        metric: b.metric,
        dataset_url: b.dataset_url,
        best_score: b.best_score,
        best_model: b.best_model,
        evaluations: bSubmissions,
      };
    });

    res.json({
      domain: 'Document AI',
      subtitle: 'Benchmarking models that understand documents, layouts, tables, forms and charts.',
      stats: {
        benchmark_count,
        model_count,
        evaluation_count,
        task_count,
      },
      benchmarks,
      models,
      submissions,
      hierarchy,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
