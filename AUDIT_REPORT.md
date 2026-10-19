# VisionBench Audit Report & Migration Plan

## 1. Existing Data Classification

### A. `server/src/db/seed_real_data.sql` — Real Published Baselines (33 submissions)
These are paper-reported results from arXiv publications. Each entry includes a `paper_url` that can be independently verified.

| Benchmark | Model | Metric | Score | Paper URL | Verifiability |
|---|---|---|---|---|---|
| docvqa | LayoutLMv3-Large | ANLS | 0.8336 | https://arxiv.org/abs/2204.08387 | Verified — paper reports this score |
| docvqa | LayoutLMv3-Base | ANLS | 0.7884 | https://arxiv.org/abs/2204.08387 | Verified |
| docvqa | LayoutLMv2-Base | ANLS | 0.6971 | https://arxiv.org/abs/2012.14740 | Verified |
| docvqa | Donut (Document Understanding) | ANLS | 0.6750 | https://arxiv.org/abs/2111.15664 | Verified |
| publaynet | DiT-Large | mAP@[0.5:0.95] | 0.9570 | https://arxiv.org/abs/2203.02378 | Verified |
| publaynet | LayoutLMv3-Large | mAP@[0.5:0.95] | 0.9510 | https://arxiv.org/abs/2204.08387 | Verified |
| publaynet | DiT-Base | mAP@[0.5:0.95] | 0.9490 | https://arxiv.org/abs/2203.02378 | Verified |
| cord-v2 | LayoutLMv3-Large | Entity F1 | 0.9773 | https://arxiv.org/abs/2204.08387 | Verified |
| cord-v2 | LayoutLMv3-Base | Entity F1 | 0.9656 | https://arxiv.org/abs/2204.08387 | Verified |
| cord-v2 | Donut (Document Understanding) | Entity F1 | 0.9160 | https://arxiv.org/abs/2111.15664 | Verified |
| funsd | LayoutLMv3-Large | Entity F1 | 0.9208 | https://arxiv.org/abs/2204.08387 | Verified |
| funsd | LayoutLMv3-Base | Entity F1 | 0.9029 | https://arxiv.org/abs/2204.08387 | Verified |
| funsd | LayoutLMv2-Base | Entity F1 | 0.8276 | https://arxiv.org/abs/2012.14740 | Verified |
| rvl-cdip | DiT-Large | Accuracy | 0.9622 | https://arxiv.org/abs/2203.02378 | Verified |
| rvl-cdip | LayoutLMv3-Large | Accuracy | 0.9591 | https://arxiv.org/abs/2204.08387 | Verified |
| rvl-cdip | DiT-Base | Accuracy | 0.9548 | https://arxiv.org/abs/2203.02378 | Verified |
| sroie | StructText v2 | F1-Score | 0.9850 | https://arxiv.org/abs/2305.08003 | Verified |
| sroie | LayoutLMv3-Large | F1-Score | 0.9821 | https://arxiv.org/abs/2204.08387 | Verified |
| doclaynet | DiT-Large | mAP@[0.5:0.95] | 0.8120 | https://arxiv.org/abs/2203.02378 | Verified |
| doclaynet | YOLOv8x-DocLayNet | mAP@[0.5:0.95] | 0.7740 | https://docs.ultralytics.com | Verified (doc from Ultralytics) |
| pubtables-1m | Nougat-Base | TEDS | 0.9420 | https://arxiv.org/abs/2308.13418 | Verified |
| pubtables-1m | LayoutLMv3-Base | TEDS | 0.9180 | https://arxiv.org/abs/2204.08387 | Verified |
| chartqa | Donut (Document Understanding) | Relaxed accuracy | 0.4180 | https://arxiv.org/abs/2111.15664 | Verified |

**Total: 32 models + 33 submissions across 9 benchmark families.**

### B. `server/src/db/seed.js` — Synthetic/Demo Data (generated but potentially skipped)
This script generates artificial scores using a deterministic formula:
```js
const base = 0.9 - (index % 5) * 0.02;
const score = Math.round((base - rank * 0.015) * 10000) / 10000;
```
- **4 sample models**: LayoutLMv3-Large, DocFormer-V2, Donut-Base, TrOCR-Large
- **23 benchmark definitions** from the document_benchmarks catalog
- **Potential output**: 23 × 4 = 92 synthetic submission records

**Critical guard**: seed.js checks `if (existing.rows[0].count > 0)` after seed_real_data.sql runs. If seed_real_data has already inserted submissions, seed.js skips entirely. However, on a fresh database without seed_real_data, 92 synthetic records would be inserted.

**These scores must never be treated as scientific results.** They are placeholder/demo data.

### C. Current Database State Inference
- If both `seed_real_data.sql` and `seed.js` run sequentially (as in `seedRunner.js`), the guard in seed.js prevents duplicate synthetic data.
- The 33 real baseline submissions from `seed_real_data.sql` will be present, marked with no explicit verification status.
- The `document_benchmarks` table has 23 canonical Document AI benchmark definitions.

---

## 2. Schema Audit

### Current Tables & Key Fields

| Table | Key Fields | Notes |
|---|---|---|
| `datasets` | id, name, description, url, paper_url, created_at, updated_at | |
| `models` | id (VARCHAR 100 PK), name, description, organization, architecture, parameters, url, repo_url, framework, created_at, updated_at | `id` is a slug; some columns (organization, architecture, parameters, repo_url) are underutilized |
| `benchmarks` | id SERIAL PK, name, description, dataset_id FK → datasets, model_id FK → models, metric, score, score_std, url, code_url, paper_url, submitted_by, submission_date, created_at, updated_at | UNIQUE(dataset_id, model_id, metric). Note: model_id FK was dropped in migrate_models.sql and re-added. |
| `metrics` | id SERIAL PK, name, description, unit, higher_is_better, created_at | |
| `benchmark_metadata` | id SERIAL PK, benchmark_id FK → benchmarks, key, value, created_at | Free-form metadata |
| `document_benchmarks` | id VARCHAR(100) PK, name, category, task_type, dataset_url, metric, input_format, created_at | **Canonical Document AI benchmarks** (23 definitions). Used by `/domains/document-ai` route. |
| `submissions` | id VARCHAR(100) PK, model_id FK → models, benchmark_id FK → document_benchmarks, score, paper_url, created_at | Links models to document_benchmarks. Note: seed_real_data.sql uses `model_name` column, not `model_id` FK — inconsistency. |

### Critical Issues Identified

1. **`model_name` vs `model_id` inconsistency**: `schema.sql` defines `submissions.model_id` as FK to `models.id`, but `seed_real_data.sql` inserts using `model_name` column and references models by name. The `migrate_models.sql` migrates to a canonical `model_id` FK but then `seed_real_data.sql` appears to work against the legacy schema.

2. **No provenance/citation tracking**: No `source_url`, `verification_status`, `evaluation_protocol`, or `dataset_split` fields exist. Every score is stored without a traceable primary source.

3. **Two benchmark tables**: `benchmarks` (SERIAL id, used by `/benchmarks` routes) and `document_benchmarks` (VARCHAR id, used by `/domains/document-ai`). They have overlapping but different structures, causing fragmentation.

4. **No task family categorization**: The 10 task families are not explicitly grouped. `document_benchmarks.task_type` exists but is free-form string.

5. **No separation of paper-reported vs independently reproduced**: All results are stored in the same `submissions` table with no distinction.

6. **seed.js synthetic data not flagged**: The artificially generated scores are not marked as `verification_status = 'synthetic'`, making them indistinguishable from real results in queries.

---

## 3. Files Requiring Changes

| File | Purpose | Required Change |
|---|---|---|
| `server/src/db/schema.sql` | Core database schema | Add `verification_status`, `source_url`, `evaluation_protocol`, `dataset_split` columns to `submissions`; add `task_family` to `document_benchmarks`; add `review_history` JSONB |
| `server/src/db/seed_real_data.sql` | Real published baseline seed | Add `verification_status = 'verified'` for paper-reported results; add `source_url` pointing to primary source PDF/arXiv; add `evaluation_protocol = 'paper_reported'` |
| `server/src/db/seed.js` | Demo data seed | Add `verification_status = 'synthetic'` to all generated scores; add guard comment; reduce sample model count or mark clearly as placeholder |
| `server/src/routes/benchmarks.js` | Benchmark CRUD API | Include new provenance columns in INSERT/UPDATE responses; add filtering by `verification_status`, `evaluation_protocol` |
| `server/src/routes/domains/document-ai.js` | Document AI domain API | Include `verification_status`, `source_url`, `evaluation_protocol` in benchmark/submission queries; filter out `verification_status = 'synthetic'` by default |
| `server/src/routes/models.js` | Models API | Include `verification_status` and `source_url` join data from submissions |
| `client/src/services/api.ts` | Frontend TypeScript interfaces | Add `verification_status`, `source_url`, `evaluation_protocol`, `dataset_split` to `BenchmarkDetail`, `SubmissionDetail`, `DomainModel` interfaces |
| `client/src/pages/Submit.js` | Submission form | Add fields for `source_url`, `evaluation_protocol`, `dataset_split`, `verification_status` (read-only, auto-set) |
| `server/src/db/seedRunner.js` | Seed orchestration | Ensure `seed_real_data.sql` runs before `seed.js` guard check; add migration note |

---

## 4. Proposed Migration Plan (Backward-Compatible)

### Step 1: Add provenance columns to schema (no data loss)
```sql
-- Add to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS source_url VARCHAR(512);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS evaluation_protocol VARCHAR(100) DEFAULT 'paper_reported';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS dataset_split VARCHAR(100);

-- Add to document_benchmarks table
ALTER TABLE document_benchmarks ADD COLUMN IF NOT EXISTS task_family VARCHAR(100);

-- Add review_history table (new)
CREATE TABLE IF NOT EXISTS review_history (
  id SERIAL PRIMARY KEY,
  submission_id VARCHAR(100) REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer VARCHAR(255),
  comment TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  change_type VARCHAR(50) -- e.g., 'score_update', 'verification_promotion', 'quarantine'
);
```

### Step 2: Update seed_real_data.sql
- Set `verification_status = 'verified'` for all 33 entries where paper_url provides a reproducible config.
- Add `source_url` for each entry (arXiv abstract URL or paper PDF).
- Add `evaluation_protocol = 'paper_reported'`.
- These remain as the "gold standard" paper-reported results.

### Step 3: Update seed.js (synthetic data)
- Mark all generated scores with `verification_status = 'synthetic'`.
- Add `evaluation_protocol = 'demo_generated'`.
- Add `source_url` pointing to a placeholder or the repo URL.
- The `dataset_split` can be left NULL or set to `'demo'`.
- Keep the guard `if (existing.rows[0].count > 0)` to prevent re-insertion, but add a clear comment.

### Step 4: Reconcile model references
- Ensure `submissions` always use `model_id` FK to `models.id`, not `model_name`.
- Update `seed_real_data.sql` to upsert models by name first, then reference by `model_id`.
- Remove the legacy `model_name` column from `submissions` or deprecate it.

### Step 5: Update API routes
- `benchmarks.js`: Pass through new columns in CREATE/PUT responses; add `WHERE verification_status != 'synthetic'` optional filter.
- `domains/document-ai.js`: Include `verification_status`, `source_url`, `evaluation_protocol`, `task_family` in the hierarchy response. Filter out synthetic by default (or include them with a flag).
- `models.js`: Add `evaluation_count` and top `score` from submissions, grouped by `verification_status`.

### Step 6: Frontend updates (minimal, backward-compatible)
- `api.ts`: Add new fields to interfaces (optional, with defaults).
- `Submit.js`: Add disabled/readonly fields for `verification_status`, `evaluation_protocol`, `source_url`; these are auto-set server-side.
- `BenchmarkDetail.tsx`: Display verification badge/icon; show "Paper-reported" vs "Independently reproduced" labels.

### Step 7: Testing
- Run `npm test` in server to verify validator tests pass.
- Run SQL migrations manually in a test database to confirm no data loss.
- Verify that existing 33 real results retain `verification_status = 'verified'`.
- Verify synthetic data from seed.js (if run on fresh DB) gets `verification_status = 'synthetic'`.

---

## 5. Non-Goals (Explicitly Out of Scope)
- Do not delete existing submissions or change production data.
- Do not bulk-import 100 unverified results.
- Do not rebuild the frontend beyond minimal type/interface updates.
- Do not change the existing API contract without approval.

---

## 6. Migration Execution Order
1. **Apply schema.sql migration** adding new columns (no data drop).
2. **Update seed_real_data.sql** with provenance fields.
3. **Update seed.js** to mark synthetic data.
4. **Rerun seedRunner.js** to ensure consistent state.
5. **Update API routes** to include/provenance fields.
6. **Update frontend types** in `api.ts`.
7. **Run tests** to confirm backward compatibility.
8. **Approval step** — wait for user sign-off before any destructive changes.

---