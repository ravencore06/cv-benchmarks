import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileText,
  GitCompare,
  Layers,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  benchmarkService,
  type BenchmarkDetail,
  type SubmissionDetail,
} from "../services/api";

function formatScore(score: number | null, metric: string): string {
  if (score === null || score === undefined) return "—";
  if (score <= 1.0) {
    return `${(score * 100).toFixed(1)}%`;
  }
  return score.toFixed(1);
}

const BENCHMARK_DESCRIPTIONS: Record<string, string> = {
  docvqa: "DocVQA measures Visual Question Answering capability over document images containing complex textual, tabular, and graphical layouts.",
  publaynet: "PubLayNet evaluates document layout analysis and element detection across research papers and scientific publications.",
  "cord-v2": "CORD v2 tests key information extraction and receipt understanding across diverse multilingual store receipts.",
  funsd: "FUNSD evaluates form understanding, entity recognition, and semantic relation extraction on noisy scanned business forms.",
  "rvl-cdip": "RVL-CDIP evaluates document classification across 16 document types including letters, forms, invoices, and reports.",
  sroie: "SROIE benchmarks receipt OCR and key information extraction across four key fields: Company, Date, Address, and Total.",
  doclaynet: "DocLayNet evaluates fine-grained document layout analysis across financial reports, legal filings, manuals, and papers.",
  "pubtables-1m": "PubTables-1M tests table detection, structural recognition, and cell bounding box extraction from PDF document pages.",
  chartqa: "ChartQA measures visual reasoning and numerical question answering over diverse visual charts and plot diagrams.",
};

export function BenchmarkDetailPage() {
  const params = useParams<{ benchmarkId: string }>();
  const benchmarkId = params.benchmarkId || "docvqa";

  const [benchmark, setBenchmark] = useState<BenchmarkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    benchmarkService
      .get(benchmarkId)
      .then((res) => {
        if (active) {
          setBenchmark(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || `Benchmark "${benchmarkId}" not found.`);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [benchmarkId]);

  return (
    <main className="subpage benchmark-detail-page">
      {/* NAVIGATION BACK */}
      <div className="container mb-6">
        <Link href="/domains/document-ai" className="text-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#8a95aa", fontSize: "11px" }}>
          <ArrowLeft size={14} /> Back to Document AI Domain
        </Link>
      </div>

      {/* BENCHMARK HEADER HERO */}
      <section className="page-intro container" style={{ paddingBottom: "36px" }}>
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> DOCUMENT AI BENCHMARK DETAIL
          </div>
          <h1>
            {loading ? benchmarkId : benchmark?.name || benchmarkId}
          </h1>
          <p>
            {BENCHMARK_DESCRIPTIONS[benchmarkId.toLowerCase()] || benchmark?.input_format || "Benchmark dataset and leaderboard evaluation protocol."}
          </p>
        </div>
        {benchmark?.dataset_url && (
          <a
            href={benchmark.dataset_url}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-ghost"
          >
            Dataset Source <ExternalLink size={15} />
          </a>
        )}
      </section>

      {/* QUICK STATS */}
      <section className="container mb-12">
        <div className="stats-section glass-panel" style={{ borderRadius: "16px", padding: "0 24px" }}>
          <div className="stats-grid">
            <div className="stat-item">
              <strong style={{ fontSize: "18px", color: "#789cff" }}>
                {loading ? "..." : benchmark?.task_type || "N/A"}
              </strong>
              <span>Task Type</span>
            </div>
            <div className="stat-item">
              <strong style={{ fontSize: "20px", color: "#eef2ff" }}>
                {loading ? "..." : benchmark?.metric || "N/A"}
              </strong>
              <span>Primary Metric</span>
            </div>
            <div className="stat-item">
              <strong style={{ fontSize: "22px", color: "#68d1ae" }}>
                {loading ? "..." : formatScore(benchmark?.best_score ?? null, benchmark?.metric || "")}
              </strong>
              <span>Best Reported Score</span>
            </div>
            <div className="stat-item">
              <strong style={{ fontSize: "22px" }}>
                {loading ? "..." : benchmark?.evaluation_count ?? 0}
              </strong>
              <span>Evaluated Submissions</span>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLISHED EVALUATIONS / LEADERBOARD TABLE */}
      <section className="container mb-16">
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> VERIFIED LEADERBOARD
            </div>
            <h2>
              Published <em>Evaluations</em>
            </h2>
          </div>
        </div>

        <div className="ranking-table-wrap glass-panel">
          <div className="table-heading" style={{ marginBottom: "16px" }}>
            <div>
              <span className="eyebrow dark">
                <span className="eyebrow-line" /> BENCHMARK RESULTS
              </span>
              <h3>Submissions for {benchmark?.name || benchmarkId}</h3>
            </div>
            <span style={{ fontSize: "11px", fontFamily: "DM Mono", color: "#68738a" }}>
              Primary Metric: {benchmark?.metric || "Score"}
            </span>
          </div>

          <div className="ranking-table" style={{ overflowX: "auto" }}>
            <div className="ranking-row table-header" style={{ gridTemplateColumns: "60px 1.8fr 1.4fr 1.2fr 1.6fr 40px" }}>
              <span>RANK</span>
              <span>MODEL NAME</span>
              <span>ORGANIZATION</span>
              <span>SCORE</span>
              <span>ARCHITECTURE / REPO</span>
              <span>PAPER</span>
            </div>

            {loading ? (
              [1, 2, 3].map((i) => (
                <div className="ranking-row" key={i} style={{ gridTemplateColumns: "60px 1.8fr 1.4fr 1.2fr 1.6fr 40px" }}>
                  <span className="skeleton" style={{ height: "16px" }} />
                  <span className="skeleton" style={{ height: "16px" }} />
                  <span className="skeleton" style={{ height: "16px" }} />
                  <span className="skeleton" style={{ height: "16px" }} />
                  <span className="skeleton" style={{ height: "16px" }} />
                </div>
              ))
            ) : error ? (
              <div className="empty-state">
                <p>{error}</p>
              </div>
            ) : !benchmark?.submissions?.length ? (
              <div className="empty-state">
                <h3>No evaluations recorded yet</h3>
                <p>No model submissions have been published for this benchmark yet.</p>
              </div>
            ) : (
              benchmark.submissions.map((sub: SubmissionDetail, idx: number) => {
                const rank = idx + 1;
                return (
                  <div className="ranking-row" key={sub.id} style={{ gridTemplateColumns: "60px 1.8fr 1.4fr 1.2fr 1.6fr 40px" }}>
                    <span className={`table-rank ${rank <= 3 ? "top" : ""}`}>
                      0{rank}
                    </span>
                    <div className="table-model">
                      <div className="mini-avatar avatar-indigo">
                        {sub.model_name.slice(0, 2)}
                      </div>
                      <div>
                        <strong>{sub.model_name}</strong>
                        <small>{sub.architecture || "Model Backbone"}</small>
                      </div>
                    </div>
                    <span style={{ fontSize: "11px", color: "#8a94a6" }}>
                      {sub.organization || "Research Organization"}
                    </span>
                    <div>
                      <strong style={{ fontSize: "14px", color: rank === 1 ? "#68d1ae" : "#eef2ff" }}>
                        {formatScore(sub.score, benchmark.metric)}
                      </strong>
                    </div>
                    <span style={{ fontSize: "11px", color: "#8a94a6" }}>
                      {sub.repo_url ? (
                        <a href={sub.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: "#789cff" }}>
                          View Repository
                        </a>
                      ) : (
                        sub.architecture || "Standard Setup"
                      )}
                    </span>
                    <div>
                      {sub.paper_url && (
                        <a
                          href={sub.paper_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View paper for ${sub.model_name}`}
                          style={{ color: "#789cff" }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* METADATA & DATASET SUITE */}
      {benchmark && (
        <section className="container mb-16">
          <div className="glass-panel" style={{ borderRadius: "16px", padding: "24px" }}>
            <span className="eyebrow dark" style={{ marginBottom: "12px" }}>
              <span className="eyebrow-line" /> BENCHMARK SPECIFICATION
            </span>
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "#f2f4fa" }}>
              Dataset & Protocol Metadata
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "10px", fontFamily: "DM Mono", color: "#68738a", display: "block" }}>INPUT FORMAT</span>
                <strong style={{ fontSize: "13px", color: "#e2e8f0" }}>{benchmark.input_format || "Document Image"}</strong>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "10px", fontFamily: "DM Mono", color: "#68738a", display: "block" }}>CATEGORY</span>
                <strong style={{ fontSize: "13px", color: "#e2e8f0" }}>{benchmark.category || "Document AI"}</strong>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "10px", fontFamily: "DM Mono", color: "#68738a", display: "block" }}>PRIMARY METRIC</span>
                <strong style={{ fontSize: "13px", color: "#e2e8f0" }}>{benchmark.metric}</strong>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: "10px", fontFamily: "DM Mono", color: "#68738a", display: "block" }}>DATASET LINK</span>
                {benchmark.dataset_url ? (
                  <a href={benchmark.dataset_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#789cff", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    Official Dataset <ExternalLink size={12} />
                  </a>
                ) : (
                  <span style={{ fontSize: "12px", color: "#68738a" }}>Not available</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default BenchmarkDetailPage;
