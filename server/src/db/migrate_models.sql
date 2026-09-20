-- One-time migration: canonical model/submission schema.
-- models: id becomes a VARCHAR(100) slug primary key and gains
--         organization / architecture / parameters / repo_url columns.
-- submissions: rebuilt around model_id (FK to models.id) and a slug id.

-- Release the legacy FK so the models.id type can change.
ALTER TABLE benchmarks DROP CONSTRAINT IF EXISTS benchmarks_model_id_fkey;

-- Rebuild models.id as a slug primary key.
ALTER TABLE models ALTER COLUMN id DROP DEFAULT;
ALTER TABLE models ALTER COLUMN id TYPE VARCHAR(100) USING id::text;

-- Add canonical metadata columns.
ALTER TABLE models ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
ALTER TABLE models ADD COLUMN IF NOT EXISTS architecture VARCHAR(255);
ALTER TABLE models ADD COLUMN IF NOT EXISTS parameters VARCHAR(100);
ALTER TABLE models ADD COLUMN IF NOT EXISTS repo_url VARCHAR(512);

-- Existing rows are seed-only; reset before the canonical reseed.
DELETE FROM models;

-- Rebuild submissions around models(id).
DROP TABLE IF EXISTS submissions CASCADE;
CREATE TABLE submissions (
  id VARCHAR(100) PRIMARY KEY,
  model_id VARCHAR(100) REFERENCES models(id) ON DELETE SET NULL,
  benchmark_id VARCHAR(100) NOT NULL REFERENCES document_benchmarks(id) ON DELETE RESTRICT,
  score DOUBLE PRECISION NOT NULL,
  paper_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_submissions_benchmark_score ON submissions(benchmark_id, score DESC);