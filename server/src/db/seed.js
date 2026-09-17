const pool = require('./config');

const benchmarks = [
  ['docvqa', 'DocVQA', 'Document Question Answering', 'Visual question answering', 'https://www.docvqa.org/', 'ANLS', 'Document image'],
  ['publaynet', 'PubLayNet', 'Document Layout Analysis', 'Layout detection', 'https://github.com/ibm-aur-nlp/PubLayNet', 'mAP', 'PDF page image'],
  ['cord-v2', 'CORD v2', 'Receipt Understanding', 'Key information extraction', 'https://github.com/clovaai/cord', 'F1', 'Receipt image'],
  ['funsd', 'FUNSD', 'Form Understanding', 'Semantic entity recognition', 'https://guillaumejaume.github.io/FUNSD/', 'F1', 'Scanned form'],
  ['sroie', 'SROIE', 'Receipt Understanding', 'Key information extraction', 'https://rrc.cvc.uab.es/?ch=13', 'F1', 'Receipt image'],
  ['pubtables-1m', 'PubTables-1M', 'Table Understanding', 'Table detection and structure recognition', 'https://github.com/microsoft/table-transformer', 'mAP', 'Document image'],
  ['docbank', 'DocBank', 'Document Layout Analysis', 'Token classification', 'https://doc-analysis.github.io/docbank-page/', 'F1', 'PDF document'],
  ['fintabnet', 'FinTabNet', 'Table Understanding', 'Financial table extraction', 'https://developer.ibm.com/exchanges/data/all/fintabnet/', 'TEDS', 'Financial report image'],
  ['mp-docvqa', 'MP-DocVQA', 'Document Question Answering', 'Multi-page visual question answering', 'https://www.docvqa.org/datasets/mpdocvqa', 'ANLS', 'Multi-page document'],
  ['chartqa', 'ChartQA', 'Chart Understanding', 'Chart question answering', 'https://github.com/vis-nlp/ChartQA', 'Relaxed accuracy', 'Chart image'],
  ['hiertext', 'HierText', 'Scene Text', 'Hierarchical text detection', 'https://github.com/google-research-datasets/hiertext', 'H-mean', 'Natural image'],
  ['dude', 'DUDE', 'Document Question Answering', 'Multi-document question answering', 'https://github.com/hi-primus/dude', 'ANLS', 'Document collection'],
  ['infovqa', 'InfographicVQA', 'Visual Question Answering', 'Infographic question answering', 'https://github.com/sg-vilab/InfographicVQA', 'ANLS', 'Infographic image'],
  ['plotqa', 'PlotQA', 'Chart Understanding', 'Scientific plot question answering', 'https://github.com/NiteshMethani/PlotQA', 'Accuracy', 'Plot image'],
  ['rvl-cdip', 'RVL-CDIP', 'Document Classification', 'Document image classification', 'https://www.cs.cmu.edu/~aharley/rvl-cdip/', 'Accuracy', 'Document image'],
  ['tablebank', 'TableBank', 'Table Understanding', 'Table detection', 'https://doc-analysis.github.io/tablebank-page/', 'mAP', 'Document image'],
  ['xfund', 'XFUND', 'Form Understanding', 'Multilingual form understanding', 'https://github.com/doc-analysis/XFUND', 'F1', 'Scanned form'],
  ['tat-qa', 'TAT-QA', 'Table Question Answering', 'Hybrid table-text question answering', 'https://nextplusplus.github.io/TAT-QA/', 'F1', 'Table and text'],
  ['iiit-ar-13k', 'IIIT-AR-13K', 'Document Layout Analysis', 'Academic document layout analysis', 'https://cvit.iiit.ac.in/research/projects/cvit-projects/iiit-ar-13k', 'mAP', 'Document image'],
  ['doclaynet', 'DocLayNet', 'Document Layout Analysis', 'Layout detection', 'https://github.com/DS4SD/DocLayNet', 'mAP', 'PDF page image'],
];

const sampleModels = [
  { name: 'LayoutLMv3-Large', organization: 'Microsoft Research' },
  { name: 'DocFormer-V2', organization: 'Microsoft Research' },
  { name: 'Donut-Base', organization: 'NAVER CLOVA' },
  { name: 'TrOCR-Large', organization: 'Microsoft Research' },
];

async function seed() {
  for (const benchmark of benchmarks) {
    await pool.query(
      `INSERT INTO document_benchmarks (id, name, category, task_type, dataset_url, metric, input_format)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
      benchmark,
    );
  }
  console.log(`Seeded document benchmark catalog (${benchmarks.length} definitions).`);

  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM submissions');
  if (existing.rows[0].count > 0) {
    console.log('Submissions already present, skipping sample leaderboard data.');
    return;
  }

  let inserted = 0;
  for (let index = 0; index < benchmarks.length; index += 1) {
    const benchmarkId = benchmarks[index][0];
    const base = 0.9 - (index % 5) * 0.02;
    for (let rank = 0; rank < sampleModels.length; rank += 1) {
      const model = sampleModels[rank];
      const score = Math.round((base - rank * 0.015) * 10000) / 10000;
      await pool.query(
        `INSERT INTO submissions (model_name, organization, benchmark_id, score)
         VALUES ($1, $2, $3, $4)`,
        [model.name, model.organization, benchmarkId, score],
      );
      inserted += 1;
    }
  }
  console.log(`Seeded ${inserted} sample leaderboard submissions (demo data).`);
}

seed()
  .catch((error) => {
    const details = [error.name, error.code, error.message].filter(Boolean).join(': ');
    console.error('Database seed check failed:', details || 'Unknown database error');
    process.exitCode = 1;
  })
  .finally(() => pool.end());
