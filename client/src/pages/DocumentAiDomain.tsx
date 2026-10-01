import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  FileText,
  GitCompare,
  Layers,
  Network,
  ShieldCheck,
  Table,
  Trophy,
} from "lucide-react";
import {
  domainService,
  type DocumentAiDomainData,
  type DomainBenchmark,
  type DomainHierarchyNode,
  type DomainModel,
} from "../services/api";

function formatScoreDisplay(score: number | null, metric: string): string {
  if (score === null || score === undefined) return "—";
  if (score <= 1.0) {
    return `${(score * 100).toFixed(1)}%`;
  }
  return score.toFixed(1);
}

// Fixed descriptions for canonical Document AI benchmarks if DB field is short
const BENCHMARK_DESCRIPTIONS: Record<string, string> = {
  docvqa: "Visual question answering on real-world document images containing printed, handwritten, and structural content.",
  publaynet: "Document layout detection benchmark derived from PubMed Central for segmenting text, titles, figures, and tables.",
  "cord-v2": "Consolidated Receipt Dataset for receipt understanding, key-information extraction, and parsing.",
  funsd: "Form Understanding in Noisy Scanned Documents for spatial text detection, entity recognition, and linking.",
  "rvl-cdip": "16-class document image classification dataset from the Tobacco litigation archive for document categorisation.",
  sroie: "Scanned Receipts Information Extraction for receipt OCR and 4-field key information parsing.",
  doclaynet: "Diverse document layout analysis benchmark covering financial, scientific, legal, and manual document types.",
  "pubtables-1m": "Large-scale dataset for table detection, table structure recognition, and cell alignment.",
  chartqa: "Question answering over complex business, scientific, and statistical charts.",
};

export function DocumentAiDomainPage() {
  const [data, setData] = useState<DocumentAiDomainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBenchmark, setExpandedBenchmark] = useState<string | null>("docvqa");

  useEffect(() => {
    let active = true;
    domainService
      .getDocumentAi()
      .then((res) => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Failed to load Document AI domain data.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedBenchmark((prev) => (prev === id ? null : id));
  };

  return (
    <main className="subpage domain-page">
      {/* HEADER / HERO */}
      <section className="page-intro container">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> DOCUMENT AI DOMAIN OVERVIEW
          </div>
          <h1>
            Document <em>AI</em>
          </h1>
          <p>
            Benchmarking models that understand documents, layouts, tables, forms and charts.
          </p>
        </div>
        <Link href="/explore" className="button button-ghost">
          Browse Index <ArrowRight size={15} />
        </Link>
      </section>

      {/* STATS COUNTER */}
      <section className="container mb-12">
        <div className="stats-section glass-panel" style={{ borderRadius: "16px", padding: "0 24px" }}>
          <div className="stats-grid">
            <div className="stat-item">
              <strong>{loading ? "..." : data?.stats.benchmark_count ?? 9}</strong>
              <span>Benchmarks</span>
            </div>
            <div className="stat-item">
              <strong>{loading ? "..." : data?.stats.model_count ?? 10}</strong>
              <span>Evaluated Models</span>
            </div>
            <div className="stat-item">
              <strong>{loading ? "..." : data?.stats.evaluation_count ?? 23}</strong>
              <span>Published Evaluations</span>
            </div>
            <div className="stat-item">
              <strong>{loading ? "..." : data?.stats.task_count ?? 7}</strong>
              <span>Tasks Covered</span>
            </div>
          </div>
        </div>
      </section>

      {/* BENCHMARK EXPLORER SECTION */}
      <section className="container section-light-wrap mb-16">
        <div className="section-heading compact">
          <div>
            <div className="eyebrow dark">
              <span className="eyebrow-line" /> BENCHMARK EXPLORER
            </div>
            <h2 style={{ color: "#f2f4fa" }}>
              Document AI <em>Benchmarks</em>
            </h2>
          </div>
          <span className="muted" style={{ fontSize: "12px", fontFamily: "DM Mono" }}>
            9 Canonical Families
          </span>
        </div>

        {loading ? (
          <div className="feature-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="feature-card skeleton-card" key={i}>
                <div className="skeleton skeleton-icon" />
                <div className="skeleton-lines mt-4">
                  <span className="skeleton" />
                  <span className="skeleton short" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        ) : (
          <div className="feature-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
            {data?.benchmarks.map((benchmark: DomainBenchmark) => (
              <article className="feature-card glass-panel" key={benchmark.id} style={{ display: "flex", flexDirection: "column", minHeight: "260px" }}>
                <div className="flex justify-between items-start mb-3" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="tag-row">
                    <span style={{ color: "#789cff", borderColor: "rgba(114,156,255,0.2)", background: "rgba(114,156,255,0.08)" }}>
                      {benchmark.task_type}
                    </span>
                  </span>
                  <span style={{ fontSize: "10px", fontFamily: "DM Mono", color: "#68738a", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: "5px" }}>
                    Metric: {benchmark.metric}
                  </span>
                </div>

                <h3 style={{ fontSize: "18px", margin: "10px 0 6px", fontWeight: "700", color: "#f2f4fa" }}>
                  {benchmark.name}
                </h3>

                <p style={{ fontSize: "12px", color: "#8a94a6", lineHeight: "1.6", margin: "0 0 16px", flex: "1" }}>
                  {BENCHMARK_DESCRIPTIONS[benchmark.id] || benchmark.input_format || "Canonical document benchmark evaluation suite."}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: "auto" }}>
                  <div>
                    <span style={{ display: "block", fontSize: "9px", fontFamily: "DM Mono", color: "#637087" }}>
                      BEST REPORTED SCORE
                    </span>
                    <strong style={{ fontSize: "16px", color: "#68d1ae", letterSpacing: "-0.04em" }}>
                      {formatScoreDisplay(benchmark.best_score, benchmark.metric)}
                    </strong>
                    {benchmark.best_model && (
                      <span style={{ display: "block", fontSize: "9px", color: "#8a95aa" }}>
                        by {benchmark.best_model}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "block", fontSize: "9px", fontFamily: "DM Mono", color: "#637087" }}>
                      EVALUATIONS
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1" }}>
                      {benchmark.evaluation_count} runs
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
                  <Link
                    href={`/benchmarks/${benchmark.id}`}
                    className="text-link"
                    style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "5px", color: "#789cff" }}
                  >
                    View benchmark <ArrowRight size={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* DOMAIN-LEVEL RESULTS TABLE */}
      <section className="container mb-16">
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> DOMAIN RESULTS SUMMARY
            </div>
            <h2>
              Document AI <em>Results</em>
            </h2>
          </div>
        </div>

        <div className="ranking-table-wrap glass-panel">
          <div className="table-heading" style={{ marginBottom: "16px" }}>
            <div>
              <span className="eyebrow dark">
                <span className="eyebrow-line" /> VERIFIED BACKEND EVALUATIONS
              </span>
              <h3>Benchmark-level metrics</h3>
            </div>
          </div>

          <div className="ranking-table" style={{ overflowX: "auto" }}>
            <div className="ranking-row table-header" style={{ gridTemplateColumns: "1.4fr 1.6fr 1fr 1fr 1.2fr 1.4fr" }}>
              <span>BENCHMARK</span>
              <span>TASK TYPE</span>
              <span>METRIC</span>
              <span>EVALUATIONS</span>
              <span>BEST SCORE</span>
              <span>TOP EVALUATED MODEL</span>
            </div>

            {loading
              ? [1, 2, 3].map((i) => (
                  <div className="ranking-row" key={i} style={{ gridTemplateColumns: "1.4fr 1.6fr 1fr 1fr 1.2fr 1.4fr" }}>
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                  </div>
                ))
              : data?.benchmarks.map((row: DomainBenchmark) => (
                  <div className="ranking-row" key={row.id} style={{ gridTemplateColumns: "1.4fr 1.6fr 1fr 1fr 1.2fr 1.4fr" }}>
                    <div style={{ fontWeight: "700", color: "#eef2ff" }}>
                      <Link href={`/benchmarks/${row.id}`} style={{ color: "#eef2ff" }}>
                        {row.name}
                      </Link>
                    </div>
                    <span style={{ fontSize: "11px", color: "#8a94a6" }}>{row.task_type}</span>
                    <span className="table-muted">{row.metric}</span>
                    <span className="table-muted">{row.evaluation_count} published</span>
                    <div>
                      <strong style={{ color: "#68d1ae", fontSize: "13px" }}>
                        {formatScoreDisplay(row.best_score, row.metric)}
                      </strong>
                    </div>
                    <span style={{ fontSize: "11px", color: "#b0bace" }}>
                      {row.best_model || "No submissions yet"}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* MODEL COVERAGE SECTION */}
      <section className="container mb-16">
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> MODEL COVERAGE
            </div>
            <h2>
              Models <em>Evaluated</em>
            </h2>
          </div>
        </div>

        <div className="ranking-table-wrap glass-panel">
          <div className="table-heading" style={{ marginBottom: "16px" }}>
            <div>
              <span className="eyebrow dark">
                <span className="eyebrow-line" /> ARCHITECTURES & ORGANIZATIONS
              </span>
              <h3>Canonical Document AI Models</h3>
            </div>
          </div>

          <div className="ranking-table" style={{ overflowX: "auto" }}>
            <div className="ranking-row table-header" style={{ gridTemplateColumns: "1.8fr 1.4fr 1.6fr 1.2fr 1fr 40px" }}>
              <span>MODEL NAME</span>
              <span>ORGANIZATION</span>
              <span>ARCHITECTURE</span>
              <span>PARAMETERS</span>
              <span>EVALUATIONS</span>
              <span></span>
            </div>

            {loading
              ? [1, 2, 3].map((i) => (
                  <div className="ranking-row" key={i} style={{ gridTemplateColumns: "1.8fr 1.4fr 1.6fr 1.2fr 1fr 40px" }}>
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                    <span className="skeleton" style={{ height: "16px" }} />
                  </div>
                ))
              : data?.models.map((model: DomainModel) => {
                  const paramMatch = model.description?.match(/(\d+M|\d+B|params N\/A)/i);
                  const paramStr = paramMatch ? paramMatch[0] : "N/A";
                  return (
                    <div className="ranking-row" key={model.id} style={{ gridTemplateColumns: "1.8fr 1.4fr 1.6fr 1.2fr 1fr 40px" }}>
                      <div className="table-model">
                        <div className="mini-avatar avatar-indigo">
                          {model.name.slice(0, 2)}
                        </div>
                        <div>
                          <strong>{model.name}</strong>
                          <small>{model.framework || "Transformer"}</small>
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", color: "#8a94a6" }}>
                        {model.organization || "Independent"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#8a94a6" }}>
                        {model.framework || "N/A"}
                      </span>
                      <span className="table-muted">{paramStr}</span>
                      <span className="table-muted" style={{ color: "#a5b4fc" }}>
                        {model.evaluation_count} benchmarks
                      </span>
                      <div>
                        {model.paper_url && (
                          <a
                            href={model.paper_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View paper for ${model.name}`}
                            style={{ color: "#789cff" }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </section>

      {/* MODEL -> BENCHMARK RELATIONSHIP HIERARCHY */}
      <section className="container mb-16">
        <div className="section-heading compact">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> CONCEPTUAL STRUCTURE
            </div>
            <h2>
              Domain → Benchmark → <em>Evaluations</em> → Model
            </h2>
          </div>
        </div>

        <div className="glass-panel" style={{ borderRadius: "16px", padding: "24px" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", background: "rgba(114,156,255,0.12)", border: "1px solid rgba(114,156,255,0.2)", borderRadius: "8px", color: "#97b9ff", fontSize: "11px", fontWeight: "700" }}>
              <Layers size={14} /> Document AI (Domain)
            </div>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {data?.hierarchy.map((node: DomainHierarchyNode) => {
              const isExpanded = expandedBenchmark === node.benchmark_id;
              return (
                <div
                  key={node.benchmark_id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    background: "rgba(13,16,24,0.6)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => toggleExpand(node.benchmark_id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      background: "transparent",
                      color: "#f2f4fa",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {isExpanded ? <ChevronDown size={16} color="#789cff" /> : <ChevronRight size={16} color="#68738a" />}
                      <div>
                        <strong style={{ fontSize: "14px", color: "#f2f4fa" }}>
                          {node.benchmark_name}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#78849b", marginLeft: "10px" }}>
                          ({node.task_type} · Metric: {node.metric})
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "11px", color: "#68d1ae", fontFamily: "DM Mono" }}>
                        Best: {formatScoreDisplay(node.best_score, node.metric)}
                      </span>
                      <span style={{ fontSize: "10px", color: "#8a94a6", background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: "5px" }}>
                        {node.evaluations.length} models
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div style={{ padding: "0 20px 16px 48px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      {node.evaluations.length === 0 ? (
                        <p style={{ fontSize: "11px", color: "#68738a", margin: "12px 0 0" }}>
                          No published evaluations yet for this benchmark.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                          {node.evaluations.map((sub) => (
                            <div
                              key={sub.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 14px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.05)",
                                borderRadius: "8px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Code2 size={14} color="#789cff" />
                                <div>
                                  <strong style={{ fontSize: "12px", color: "#eef2ff" }}>
                                    {sub.model_name}
                                  </strong>
                                  <span style={{ fontSize: "10px", color: "#78849b", marginLeft: "8px" }}>
                                    {sub.organization || "Research Org"}
                                  </span>
                                </div>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <strong style={{ fontSize: "13px", color: "#68d1ae", fontFamily: "DM Mono" }}>
                                  {formatScoreDisplay(sub.score, node.metric)}
                                </strong>
                                {sub.paper_url && (
                                  <a
                                    href={sub.paper_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#789cff", fontSize: "10px", display: "inline-flex", alignItems: "center", gap: "3px" }}
                                  >
                                    Paper <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default DocumentAiDomainPage;
