-- Create tables for CV Benchmarks platform

CREATE TABLE IF NOT EXISTS datasets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  url VARCHAR(512),
  paper_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS models (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  organization VARCHAR(255),
  description TEXT,
  architecture VARCHAR(255),
  parameters VARCHAR(100),
  url VARCHAR(512),
  paper_url VARCHAR(512),
  repo_url VARCHAR(512),
  framework VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS benchmarks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dataset_id INTEGER REFERENCES datasets(id),
  model_id VARCHAR(100) REFERENCES models(id),
  metric VARCHAR(100) NOT NULL,
  score FLOAT NOT NULL,
  score_std FLOAT,
  url VARCHAR(512),
  code_url VARCHAR(512),
  paper_url VARCHAR(512),
  submitted_by VARCHAR(255),
  submission_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(dataset_id, model_id, metric)
);

CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  unit VARCHAR(50),
  higher_is_better BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS benchmark_metadata (
  id SERIAL PRIMARY KEY,
  benchmark_id INTEGER REFERENCES benchmarks(id) ON DELETE CASCADE,
  key VARCHAR(255),
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_benchmarks (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  task_type VARCHAR(100) NOT NULL,
  dataset_url VARCHAR(512),
  metric VARCHAR(100) NOT NULL,
  input_format VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(100) PRIMARY KEY,
  model_id VARCHAR(100) REFERENCES models(id) ON DELETE SET NULL,
  benchmark_id VARCHAR(100) NOT NULL REFERENCES document_benchmarks(id) ON DELETE RESTRICT,
  score DOUBLE PRECISION NOT NULL,
  paper_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_benchmarks_dataset ON benchmarks(dataset_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_model ON benchmarks(model_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_metric ON benchmarks(metric);
CREATE INDEX IF NOT EXISTS idx_benchmarks_score ON benchmarks(score DESC);
CREATE INDEX IF NOT EXISTS idx_benchmarks_created ON benchmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_benchmark_score ON submissions(benchmark_id, score DESC);