# Migration Complete: Summary of Changes

## Overview
All changes are backward-compatible. New columns have DEFAULT values so existing data is unaffected. Synthetic/demo data is explicitly flagged. Paper-reported results are marked as `verified`.

## Changes by File

### 1. `server/src/db/schema.sql`
- **submissions table**: Added `source_url VARCHAR(512)`, `verification_status VARCHAR(50) DEFAULT 'pending'`, `evaluation_protocol VARCHAR(100) DEFAULT 'paper_reported'`, `dataset_split VARCHAR(100)`
- **document_benchmarks table**: Added `task_family VARCHAR(100)`
- **New table**: `review_history` (id, submission_id FK, reviewer, comment, changed_at, change_type)

### 2. `server/src/db/seed_real_data.sql`
- Changed `INSERT INTO submissions (model_name, ...)` → `(model_id, ...)` — now references models by their slug ID (which equals the name)
- All 33 entries now have: `verification_status = 'verified'`, `evaluation_protocol = 'paper_reported'`, and per-entry `source_url` (arXiv abstract URL)
- `dataset_split` left NULL (can be filled in later)

### 3. `server/src/db/seed.js`
- Changed `INSERT INTO submissions (model_name, organization, benchmark_id, score)` → `(model_id, organization, benchmark_id, score, source_url, verification_status, evaluation_protocol, dataset_split)`
- All 92 synthetic records now get: `verification_status = 'synthetic'`, `evaluation_protocol = 'demo_generated'`, `source_url = 'https://github.com/cv-benchmarks/demo'`, `dataset_split = 'demo'`
- Added clear comment: `(demo data — never treat as scientific results)`

### 4. `server/src/routes/benchmarks.js`
- GET `/:id` submissions query now JOINs `models m ON s.model_id = m.id` (instead of `s.model_name = m.name`)
- New submissions include: `source_url`, `verification_status`, `evaluation_protocol`, `dataset_split`

### 5. `server/src/routes/domains.js`
- Benchmark query now includes `best_model_id` and `best_verification_status` (instead of just `best_model`)
- Submissions query now includes: `s.model_id`, `s.source_url`, `s.verification_status`, `s.evaluation_protocol`, `s.dataset_split`
- **Synthetic filtering**: By default, submissions with `verification_status = 'synthetic'` are excluded from the hierarchy. Set `?include_demo=true` API flag to include them.
- Benchmarks now include `task_family` from `document_benchmarks`

### 6. `server/src/routes/models.js`
- New SELECT query includes:
  - `resolved_organization`: org from submissions or model description fallback
  - `top_verified_score`: highest score among `verified` submissions
  - `verified_evaluation_count`: count of `verified` submissions per model
  - `synthetic_evaluation_count`: count of `synthetic` submissions per model
  - `top_protocol`: most recent evaluation protocol

### 7. `client/src/services/api.ts`
- All new fields are **optional** (with type defaults) for full backward compatibility:
  - `Benchmark`: `task_family?: string`
  - `SubmissionDetail`: `model_id`, `source_url`, `verification_status`, `evaluation_protocol`, `dataset_split?: string`
  - `BenchmarkDetail`: unchanged externally (submissions array uses new fields internally)
  - `DomainModel`: `verified_evaluation_count?`, `synthetic_evaluation_count?`, `top_protocol?`
  - `DomainHierarchyNode`: `best_model_id`, `best_verification_status`

### 8. `client/src/pages/BenchmarkDetail.tsx`
- Replaced `sub.paper_url` link with `sub.source_url`
- Added verification status badges next to each submission:
  - `✓ Verified` (green) when `verification_status = 'verified'`
  - `◳ Demo` (red) when `verification_status = 'synthetic'`

## Data Classification After Migration

| Status | Count | Description |
|---|---|---|
| `verified` | 33 | Paper-reported results from `seed_real_data.sql` — scores from arXiv papers |
| `synthetic` | 92 (if seed.js ran on fresh DB) | Demo/placeholder data from `seed.js` — explicitly flagged, filtered from leaderboards by default |
| `pending` | 0 | Default for any new submissions without explicit status |

## Verification
- ✅ TypeScript `tsc --noEmit` passes with zero errors
- ✅ `npm test` in server: 1 test suite, 1 test passes (benchmarkValidator)
- ✅ No existing production data deleted or modified
- ✅ No destructive migrations executed
- ✅ All new columns have DEFAULT values, so existing data is unaffected

## Remaining Steps (Pending)
1. Apply the schema migration to production DB (ALTER TABLE additions only, no data loss)
2. Rerun `seedRunner.js` to normalize existing data with new provenance fields
3. Deploy frontend changes
4. Open platform for new submissions with source citation UI

**All changes are incremental and backward-compatible. The system is ready for approval.**