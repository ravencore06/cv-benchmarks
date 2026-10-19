# DELIVERABLE: Existing Data Audit & Migration Plan

## 1. Report of Existing Data

### A. Real Published Baselines (`seed_real_data.sql`)
- **33 submissions** across 9 benchmark families, from 32 distinct models
- All entries have `paper_url` pointing to arXiv or GitHub releases
- Scores are from actual paper-reported results (e.g., LayoutLMv3-Large on DocVQA ANLS = 0.8336)
- **Verification status**: All are verifiable from primary sources (arXiv papers)

### B. Synthetic/Demo Data (`seed.js`)
- **92 potential records** (23 benchmarks × 4 sample models) generated via formula:
  - `base = 0.9 - (index % 5) * 0.02`
  - `score = Math.round((base - rank * 0.015) * 10000) / 10000`
- **4 sample models**: LayoutLMv3-Large, DocFormer-V2, Donut-Base, TrOCR-Large
- **Guard condition**: `if (existing.rows[0].count > 0)` skips if seed_real_data already ran
- **Critical**: These are **not** scientific results; they are placeholder/demo data
- **Risk**: On a fresh DB without seed_real_data, these would be inserted as real submissions

### C. Database Schema Observations
| Issue | Detail |
|---|---|
| Two benchmark tables | `benchmarks` (SERIAL id, used by `/benchmarks` routes) and `document_benchmarks` (VARCHAR id, used by `/domains/document-ai`) |
| model_name vs model_id | `schema.sql` has `submissions.model_id FK → models.id`, but `seed_real_data.sql` references by `model_name` |
| No provenance tracking | No `source_url`, `verification_status`, `evaluation_protocol`, or `dataset_split` columns |
| No task family grouping | 10 task families not explicitly categorized; `document_benchmarks.task_type` is free-form |
| No separation of result types | Paper-reported and independently reproduced results stored identically |

## 2. Exact Files Requiring Changes

| # | File | Change Required |
|---|---|---|
| 1 | `server/src/db/schema.sql` | Add `verification_status`, `source_url`, `evaluation_protocol`, `dataset_split` to `submissions`; add `task_family` to `document_benchmarks`; add `review_history` table |
| 2 | `server/src/db/seed_real_data.sql` | Set `verification_status = 'verified'`; add `source_url` per entry; add `evaluation_protocol = 'paper_reported'` |
| 3 | `server/src/db/seed.js` | Mark all generated scores with `verification_status = 'synthetic'`; add `evaluation_protocol = 'demo_generated'`; add clear comment guard |
| 4 | `server/src/routes/benchmarks.js` | Include new provenance columns in CREATE/PUT; add optional filtering by `verification_status` |
| 5 | `server/src/routes/domains/document-ai.js` | Include `verification_status`, `source_url`, `evaluation_protocol`, `task_family` in responses; filter out `synthetic` by default |
| 6 | `server/src/routes/models.js` | Join submissions to include `verification_status` and top `score` per status |
| 7 | `client/src/services/api.ts` | Add `verification_status`, `source_url`, `evaluation_protocol`, `dataset_split` to `BenchmarkDetail`, `SubmissionDetail`, `DomainModel` (optional fields with defaults) |
| 8 | `client/src/pages/Submit.js` | Add readonly fields for `source_url`, `evaluation_protocol`, `dataset_split`; `verification_status` auto-set server-side |
| 9 | `server/src/db/seedRunner.js` | Ensure `seed_real_data.sql` runs before `seed.js` guard; add migration note |

## 3. Proposed Migration Plan (Backward-Compatible)

### Phase 1 — Add Provenance Columns (No Data Loss)
```sql
-- Add to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS source_url VARCHAR(512);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS evaluation_protocol VARCHAR(100) DEFAULT 'paper_reported';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS dataset_split VARCHAR(100);

-- Add to document_benchmarks
ALTER TABLE document_benchmarks ADD COLUMN IF NOT EXISTS task_family VARCHAR(100);

-- New: review_history table
CREATE TABLE IF NOT EXISTS review_history (
  id SERIAL PRIMARY KEY,
  submission_id VARCHAR(100) REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer VARCHAR(255),
  comment TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  change_type VARCHAR(50)
);
```

### Phase 2 — Update seed_real_data.sql
- All 33 existing entries get: `verification_status = 'verified'`, `evaluation_protocol = 'paper_reported'`, and per-entry `source_url` (arXiv abstract URL).
- These become the "paper-reported results" category.

### Phase 3 — Update seed.js (Synthetic Data)
- All generated scores get: `verification_status = 'synthetic'`, `evaluation_protocol = 'demo_generated'`, `source_url` pointing to a placeholder or repo URL, `dataset_split = 'demo'`.
- The guard `if (existing.rows[0].count > 0)` prevents re-insertion; add explicit comment: "/* Synthetic demo data — never treat as scientific results */".

### Phase 4 — Reconcile model References
- Ensure `submissions` always use `model_id` FK to `models.id`.
- Update `seed_real_data.sql`: upsert models by name first (`INSERT ... ON CONFLICT (name) DO UPDATE ... RETURNING id`), then reference by `model_id`.
- Deprecate/remove the `model_name` column from `submissions` over time (beyond this migration scope).

### Phase 5 — Update API Routes
- **benchmarks.js**: Pass through new columns in INSERT/PUT responses; add optional `WHERE verification_status != 'synthetic'` filter in GET queries.
- **domains/document-ai.js**: Include `verification_status`, `source_url`, `evaluation_protocol`, `task_family` in hierarchy response. By default exclude `verification_status = 'synthetic'` or add a `?include_demo=true` flag.
- **models.js**: Add `verification_status`-aware evaluation counts and top scores.

### Phase 6 — Frontend Type Updates
- **api.ts**: Add new fields to interfaces as optional (backward-compatible; existing code won't break).
- **Submit.js**: Add readonly input fields for `source_url`, `evaluation_protocol`, `dataset_split`; these are set by the server on creation.
- **BenchmarkDetail.tsx**: Display verification badge: "✓ Verified (paper-reported)" vs "◳ Synthetic (demo)" vs "⟳ Pending".

### Phase 7 — Testing & Approval
1. Run `npm run check` (TypeScript) to ensure no type errors.
2. Run existing validator tests: `npm test` in server.
3. Manually verify in a test DB that:
   - Existing 33 real results retain/override `verification_status = 'verified'`.
   - Synthetic data (if seed.js runs on fresh DB) gets `verification_status = 'synthetic'`.
   - No data is dropped or columns dropped.
4. **Wait for user approval** before considering any data migration complete.

### Phase 8 — Post-Approval
- Apply migrations to production DB.
- Rerun `seedRunner.js` to normalize all existing data.
- Deploy frontend updates.
- Open the platform for new submissions with provenance tracking.

---
**Decision Point**: Please review the above and approve the migration plan. I will not apply any database migrations or bulk-import data until explicit approval is given.