import { useLocation } from "wouter";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Filter,
  Github,
  Layers3,
  Menu,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

/**
 * Methodology Page for VisionBench
 *
 * Explains how VisionBench defines, evaluates, and reports computer vision benchmarks.
 * Fits the existing VisionBench design system (glass panels, reveal animations, etc.).
 */
export default function MethodologyPage() {
  const location = useLocation();

  return (
    <main className="subpage">
      {/* HEADER / HERO */}
      <section className="page-intro container">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> THE METHODOLOGY
          </div>
          <h1>How VisionBench defines, evaluates, and reports computer vision benchmarks</h1>
          <p>
            Transparent, reproducible, and traceable — our approach to benchmarking vision models.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <a href="/about" className="button button-ghost">
              Back to About <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="section section-light" id="methodology-philosophy">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <div className="eyebrow dark">
                <span className="eyebrow-line" /> BENCHMARK PHILOSOPHY
              </div>
              <h2>Standardized Evaluation</h2>
              <p>
                Every result in VisionBench is anchored to a specific dataset, task, and metric.
                This ensures that comparisons are fair, relevant, and meaningful across different
                models and research groups.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <div className="eyebrow dark">
                <span className="eyebrow-line" /> EVALUATION PROTOCOL
              </div>
              <h2>Evaluation Protocol</h2>
              <p>
                VisionBench follows a consistent protocol for model evaluation: models are
                assessed on clearly defined computer vision tasks using established datasets.
                The evaluation captures the full pipeline from checkpoint to metric calculation,
                ensuring that every score is reproducible and traceable.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <div className="eyebrow dark">
                <span className="eyebrow-line" /> METRICS
              </div>
              <h2>Metrics</h2>
              <p>
                Metrics are defined with their aggregation rules and reporting guidance so that
                every published score carries the same meaning. Common metrics include Top-1
                accuracy, mAP @ 50:95, and mIoU, each with clear definitions and computation
                procedures.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <div className="eyebrow dark">
                <span className="eyebrow-line" /> MODEL SUBMISSIONS
              </div>
              <h2>Model Submissions</h2>
              <p>
                Researchers can submit a result along with the model architecture, checkpoint,
                framework, and evaluation details. Each submission undergoes validation to ensure
                that the reported score is reliable and that the necessary context is provided for
                reproduction.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <div className="eyebrow dark">
                <span className="eyebrow-line" /> REPRODUCIBILITY
              </div>
              <h2>Reproducibility</h2>
              <p>
                Every result is tagged with the dataset version, model checkpoint, framework,
                and training recipe. This traceability ensures that anyone can reproduce the
                evaluation and verify the reported score, building trust in the shared index.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <div className="eyebrow dark">
                <span className="eyebrow-line" /> DATA PROVENANCE
              </div>
              <h2>Data Provenance</h2>
              <p>
                Datasets and their versions are explicitly recorded for each benchmark entry.
                VisionBench maintains dataset cards with stable versions, citation information,
                and provenance tracking so that the origin of every data point is transparent.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <div className="section-heading reveal">
            <div>
              <div className="eyebrow dark">
                <span className="eyebrow-line" /> LEADERBOARD POLICY
              </div>
              <h2>Leaderboard Policy</h2>
              <p>
                The leaderboard ranks submissions by primary metric per dataset/task combination.
                Separate benchmarks are kept distinct from model evaluations: benchmarks define
                the "what" (task and data), while model evaluations report the "how well." This
                clear separation prevents misinterpretation of results and ensures that the
                leaderboard reflects true progress rather than evaluation artifacts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}