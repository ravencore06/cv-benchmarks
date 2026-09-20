import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Code2,
  Database,
  Download,
  ExternalLink,
  FileText,
  Filter,
  GitCompareArrows,
  Github,
  Layers3,
  LineChart,
  Menu,
  Network,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  UploadCloud,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { SpeedInsights } from "@vercel/speed-insights/react";

const benchmarks = [
  { id: "b1", model: "DINOv2 ViT-L/14", dataset: "ImageNet-1K", task: "Image classification", metric: "Top-1 accuracy", score: "86.3%", date: "Sep 10, 2026", tags: ["PyTorch", "SSL"], delta: "+1.8%" },
  { id: "b2", model: "SigLIP 2 So400m", dataset: "ImageNet-1K", task: "Image classification", metric: "Top-1 accuracy", score: "85.9%", date: "Sep 08, 2026", tags: ["JAX", "Vision-Language"], delta: "+0.6%" },
  { id: "b3", model: "InternImage-H", dataset: "COCO 2017", task: "Object detection", metric: "mAP @ 50:95", score: "65.4", date: "Sep 05, 2026", tags: ["PyTorch", "Detection"], delta: "+2.1" },
  { id: "b4", model: "SAM 2 Large", dataset: "SA-1B", task: "Segmentation", metric: "mIoU", score: "81.2", date: "Sep 03, 2026", tags: ["Meta", "Promptable"], delta: "+0.9" },
  { id: "b5", model: "EVA-02 ViT-g", dataset: "ImageNet-22K", task: "Image classification", metric: "Top-1 accuracy", score: "89.7%", date: "Aug 29, 2026", tags: ["OpenCLIP", "Pretraining"], delta: "+1.4%" },
  { id: "b6", model: "Depth Anything V2", dataset: "NYUv2", task: "Monocular depth", metric: "δ < 1.25", score: "92.6%", date: "Aug 25, 2026", tags: ["Depth", "Dense Prediction"], delta: "+1.2%" },
];

const rankings = [
  { rank: 1, model: "DINOv2 ViT-L/14", org: "Meta AI Research", score: "86.3%", std: "± 0.11", submissions: 14, width: 96, color: "blue" },
  { rank: 2, model: "EVA-02 ViT-g", org: "BAAI", score: "85.9%", std: "± 0.16", submissions: 9, width: 91, color: "violet" },
  { rank: 3, model: "SigLIP 2 So400m", org: "Google DeepMind", score: "85.1%", std: "± 0.21", submissions: 17, width: 87, color: "indigo" },
  { rank: 4, model: "ConvNeXt V2 Huge", org: "Meta AI Research", score: "84.6%", std: "± 0.18", submissions: 22, width: 81, color: "slate" },
  { rank: 5, model: "ViT-G/14", org: "OpenAI Community", score: "83.8%", std: "± 0.25", submissions: 7, width: 74, color: "slate" },
  { rank: 6, model: "Swin V2 Giant", org: "Microsoft Research", score: "83.1%", std: "± 0.29", submissions: 11, width: 68, color: "slate" },
];
const leaderboardData: Record<string, typeof rankings> = {
  "ImageNet-1K": rankings,
  "COCO 2017": [
    { rank: 1, model: "InternImage-H", org: "OpenDataLab", score: "65.4", std: "± 0.18", submissions: 12, width: 96, color: "blue" },
    { rank: 2, model: "DINOv2 ViT-L/14", org: "Meta AI Research", score: "64.7", std: "± 0.22", submissions: 9, width: 91, color: "violet" },
    { rank: 3, model: "Grounding DINO", org: "IDEA Research", score: "63.9", std: "± 0.27", submissions: 18, width: 87, color: "indigo" },
    { rank: 4, model: "Mask2Former H", org: "Meta AI Research", score: "62.8", std: "± 0.31", submissions: 16, width: 81, color: "slate" },
    { rank: 5, model: "ViTDet H", org: "Google Research", score: "61.9", std: "± 0.35", submissions: 8, width: 74, color: "slate" },
    { rank: 6, model: "Swin V2 Giant", org: "Microsoft Research", score: "60.8", std: "± 0.39", submissions: 11, width: 68, color: "slate" },
  ],
  "SA-1B": [
    { rank: 1, model: "SAM 2 Large", org: "Meta AI Research", score: "81.2", std: "± 0.14", submissions: 15, width: 96, color: "blue" },
    { rank: 2, model: "SAM 2 Hiera Large", org: "Meta AI Research", score: "79.8", std: "± 0.19", submissions: 13, width: 91, color: "violet" },
    { rank: 3, model: "HQ-SAM", org: "Tencent AI Lab", score: "78.9", std: "± 0.24", submissions: 10, width: 87, color: "indigo" },
    { rank: 4, model: "SegGPT", org: "ByteDance Research", score: "77.6", std: "± 0.29", submissions: 7, width: 81, color: "slate" },
    { rank: 5, model: "SEEM", org: "Microsoft Research", score: "76.4", std: "± 0.33", submissions: 9, width: 74, color: "slate" },
    { rank: 6, model: "Mask2Former H", org: "Meta AI Research", score: "75.8", std: "± 0.38", submissions: 16, width: 68, color: "slate" },
  ],
};

const features = [
  { icon: Search, title: "Search every result", copy: "Query across datasets, models, tasks, and metrics with filters built for research." },
  { icon: GitCompareArrows, title: "Compare precisely", copy: "Put model runs side by side with context on setup, variance, and provenance." },
  { icon: Trophy, title: "Trust the leaderboard", copy: "See the strongest submissions with transparent methodology and reproducibility signals." },
  { icon: Users, title: "Contribute together", copy: "Publish a result, add a baseline, or curate an evaluation protocol with the community." },
  { icon: Download, title: "Export the signal", copy: "Download clean CSV and JSON slices for papers, dashboards, or internal research." },
  { icon: Github, title: "Open by default", copy: "Follow provenance back to code, checkpoints, and dataset cards without the guesswork." },
];

const categories = [
  { icon: Database, eyebrow: "01 / DATASETS", title: "Datasets", value: "284", copy: "Curated evaluation suites with stable versions and dataset cards.", tone: "blue" },
  { icon: Boxes, eyebrow: "02 / MODELS", title: "Models", value: "1,920", copy: "Architectures, checkpoints, and training recipes from the field.", tone: "violet" },
  { icon: BarChart3, eyebrow: "03 / METRICS", title: "Metrics", value: "76", copy: "Metrics with definitions, aggregation rules, and reporting guidance.", tone: "teal" },
];

const revealStyle = (delay = 0): CSSProperties => ({ "--delay": `${delay}ms` } as CSSProperties);

function useReveal() {
  const [location] = useLocation();
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [location]);
}

function Logo() {
  return <Link href="/" className="brand" aria-label="VisionBench home"><span className="brand-mark"><span /></span><span>vision<span className="brand-accent">bench</span></span></Link>;
}

function Header() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setMenuOpen(false), [location]);
  const isHome = location === "/";
  return (
    <header className={`site-header ${scrolled || !isHome ? "is-scrolled" : ""}`}>
      <div className="header-inner">
        <Logo />
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <Link href="/explore" className={location === "/explore" ? "active" : ""}>Explore</Link>
          <Link href="/leaderboards" className={location === "/leaderboards" ? "active" : ""}>Leaderboards</Link>
          <a href="/about#methodology">Methodology</a>
          <Link href="/about" className={location === "/about" ? "active" : ""}>About</Link>
        </nav>
        <div className="header-actions">
          <Link href="/submit" className="text-link">Submit result <ArrowUpRightIcon /></Link>
          <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle menu" aria-expanded={menuOpen}><Menu size={20} /></button>
        </div>
      </div>
    </header>
  );
}

function ArrowUpRightIcon() { return <ArrowDownRight size={15} className="arrow-up-right" />; }

function Footer() {
  return <footer className="footer" id="about"><div className="footer-grid container"><div><Logo /><p className="footer-copy">An open measurement layer for computer vision research.</p><div className="socials"><a href="https://github.com" aria-label="GitHub"><Github size={16} /></a><a href="https://huggingface.co" aria-label="Hugging Face"><Network size={16} /></a><a href="mailto:hello@visionbench.dev" aria-label="Email"><ExternalLink size={16} /></a></div></div><div><p className="footer-label">Platform</p><Link href="/explore">Explore benchmarks</Link><Link href="/leaderboards">Leaderboards</Link><Link href="/submit">Submit a result</Link></div><div><p className="footer-label">Resources</p><Link href="/about">About VisionBench</Link><a href="/about#methodology">Methodology</a><a href="https://github.com">Open data</a></div><div className="footer-status"><span className="status-dot" /> All systems operational <span className="footer-version">v0.9.4 · Sep 2026</span></div></div><div className="container footer-bottom"><span>© 2026 VisionBench</span><span>Built for better baselines.</span></div></footer>;
}

function Layout({ children }: { children: React.ReactNode }) {
  useReveal();
  return <div className="app-shell"><Header />{children}<Footer /></div>;
}

function HomePage() {
  return <>
    <main>
      <section className="hero-section">
        <div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-grid" /><div className="hero-noise" />
        <div className="container hero-layout">
          <div className="hero-copy reveal" style={revealStyle(40)}>
            <div className="eyebrow"><span className="eyebrow-line" /> THE OPEN VISION EVALUATION LAYER</div>
            <h1>Measure vision.<br /><em>Advance</em> intelligence.</h1>
            <p className="hero-lede">Discover, compare, and contribute the computer-vision benchmarks that move the field forward.</p>
            <div className="hero-actions"><Link href="/explore" className="button button-primary">Explore benchmarks <ArrowRight size={17} /></Link><Link href="/submit" className="button button-ghost">Submit results <UploadCloud size={17} /></Link></div>
            <div className="hero-footnote"><span className="live-pulse" /> Live index <span className="footnote-separator" /> Updated 4 min ago <span className="footnote-separator" /> <a href="#methodology">How it works <ArrowRight size={13} /></a></div>
          </div>
          <div className="hero-visual reveal" style={revealStyle(160)} aria-label="Live benchmark pulse visualization">
            <div className="visual-label label-left">LIVE BENCHMARK PULSE</div><div className="visual-label label-right">SEP 13 · 20:57 UTC</div>
            <div className="pulse-panel glass-panel">
              <div className="pulse-header"><div><span className="panel-kicker">IMAGENET-1K / TOP-1</span><div className="pulse-value">86.3<span>%</span></div></div><div className="positive-stat">+1.8% <ArrowUpRightIcon /></div></div>
              <div className="pulse-chart"><div className="chart-grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 500 150" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="pulseGradient" x1="0" x2="1"><stop offset="0%" stopColor="#6aa5ff" /><stop offset="100%" stopColor="#aa8cff" /></linearGradient></defs><path d="M0 128 C30 126 38 110 65 115 C92 120 94 97 120 103 C148 110 155 80 180 90 C203 99 220 68 244 77 C272 87 278 51 306 62 C331 73 345 48 365 53 C390 59 406 25 430 35 C451 43 468 17 500 10" fill="none" stroke="url(#pulseGradient)" strokeWidth="3" strokeLinecap="round" /><path d="M0 128 C30 126 38 110 65 115 C92 120 94 97 120 103 C148 110 155 80 180 90 C203 99 220 68 244 77 C272 87 278 51 306 62 C331 73 345 48 365 53 C390 59 406 25 430 35 C451 43 468 17 500 10 L500 150 L0 150 Z" fill="url(#pulseGradient)" opacity=".09" /></svg></div>
              <div className="pulse-foot"><span>Aug 28</span><span>Sep 06</span><span>Sep 13</span></div>
              <div className="pulse-divider" /><div className="pulse-meta"><div><span className="meta-icon"><Activity size={14} /></span><div><strong>2,418</strong><small>submissions indexed</small></div></div><div><span className="meta-icon violet"><Zap size={14} /></span><div><strong>+12.4%</strong><small>avg. score velocity</small></div></div></div>
            </div>
            <div className="node node-one" /><div className="node node-two" /><div className="node node-three" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
          </div>
        </div>
        <div className="hero-scroll"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /></div>
      </section>

      <section className="stats-section"><div className="container stats-grid">{[["284", "Benchmarks"], ["1,920", "Models"], ["76", "Datasets"], ["12.4k", "Submissions"]].map(([value, label], i) => <div key={label} className="stat-item reveal" style={revealStyle(i * 70)}><strong>{value}</strong><span>{label}</span></div>)}</div></section>

      <section className="section section-light" id="methodology"><div className="container"><div className="section-heading reveal"><div><div className="eyebrow dark"><span className="eyebrow-line" /> BUILT FOR THE WAY RESEARCH ACTUALLY MOVES</div><h2>From first baseline<br />to <em>final result.</em></h2></div><p>VisionBench turns scattered evaluation artifacts into a shared, searchable layer of evidence. Every result has context. Every comparison has a trail.</p></div><div className="feature-grid">{features.map(({ icon: Icon, title, copy }, i) => <article className="feature-card reveal" style={revealStyle(i * 55)} key={title}><div className="feature-icon"><Icon size={19} /></div><h3>{title}</h3><p>{copy}</p><span className="card-arrow"><ArrowUpRightIcon /></span></article>)}</div></div></section>

      <section className="section category-section"><div className="container"><div className="section-heading compact reveal"><div><div className="eyebrow"><span className="eyebrow-line" /> ONE INDEX, EVERY LENS</div><h2>Make the <em>signal</em> legible.</h2></div><Link href="/explore" className="text-link">Browse the index <ArrowRight size={15} /></Link></div><div className="category-grid">{categories.map(({ icon: Icon, eyebrow, title, value, copy, tone }, i) => <Link href="/explore" className={`category-card ${tone} reveal`} style={revealStyle(i * 90)} key={title}><div className="category-top"><span>{eyebrow}</span><Icon size={18} /></div><div className="category-value">{value}</div><h3>{title}</h3><p>{copy}</p><span className="category-link">Explore {title.toLowerCase()} <ArrowRight size={14} /></span></Link>)}</div></div></section>

      <section className="section recent-section"><div className="container"><div className="section-heading compact reveal"><div><div className="eyebrow dark"><span className="eyebrow-line" /> FRESH FROM THE INDEX</div><h2>Results worth <em>seeing.</em></h2></div><Link href="/explore" className="text-link">View all results <ArrowRight size={15} /></Link></div><div className="recent-list">{benchmarks.slice(0, 4).map((item, i) => <div className="recent-row reveal" style={revealStyle(i * 60)} key={item.id}><div className="recent-rank">0{i + 1}</div><div className="recent-main"><strong>{item.model}</strong><span>{item.dataset} <i>·</i> {item.task}</span></div><div className="recent-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="recent-score"><strong>{item.score}</strong><span>{item.metric}</span></div><div className="recent-trend">{item.delta} <ArrowUpRightIcon /></div></div>)}</div></div></section>

      <section className="cta-section"><div className="cta-glow" /><div className="container cta-inner reveal"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR RESULT BELONGS IN THE RECORD</div><h2>Make your benchmark<br /><em>count.</em></h2></div><div className="cta-side"><p>Help the field build on what came before. Submit a result with enough context for someone else to trust it, reproduce it, and go further.</p><Link href="/submit" className="button button-primary">Submit a result <ArrowRight size={17} /></Link></div></div></section>
    </main>
  </>;
}

function PageIntro({ eyebrow, title, copy, action }: { eyebrow: string; title: React.ReactNode; copy: string; action?: React.ReactNode }) {
  return <div className="page-intro container reveal"><div><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div><h1>{title}</h1><p>{copy}</p></div>{action}</div>;
}

function ExplorerPage() {
  const [query, setQuery] = useState("");
  const [dataset, setDataset] = useState("All datasets");
  const [task, setTask] = useState("All tasks");
  const [metric, setMetric] = useState("All metrics");
  const [framework, setFramework] = useState("All frameworks");
  const [dateRange, setDateRange] = useState("Any date");
  const [compare, setCompare] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [sortBy, setSortBy] = useState("Latest score");
  const [page, setPage] = useState(1);
  const [compareOpen, setCompareOpen] = useState(false);
  const pageSize = 4;
  const filters = [dataset !== "All datasets" ? dataset : "", task !== "All tasks" ? task : "", metric !== "All metrics" ? metric : "", framework !== "All frameworks" ? framework : "", dateRange !== "Any date" ? dateRange : ""].filter(Boolean);
  const filtered = useMemo(() => {
    const result = benchmarks.filter((item) => {
      const haystack = `${item.model} ${item.dataset} ${item.task} ${item.metric} ${item.tags.join(" ")}`.toLowerCase();
      const frameworkMatch = framework === "All frameworks" || item.tags.some((tag) => tag.toLowerCase() === framework.toLowerCase());
      const itemDate = new Date(item.date);
      const indexDate = new Date("2026-09-13T20:57:00Z");
      const dateMatch = dateRange === "Any date" || (dateRange === "Past 7 days" && indexDate.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000) || (dateRange === "Past 30 days" && indexDate.getTime() - itemDate.getTime() <= 30 * 24 * 60 * 60 * 1000) || (dateRange === "This year" && itemDate.getFullYear() === indexDate.getFullYear());
      return haystack.includes(query.toLowerCase()) && (dataset === "All datasets" || item.dataset === dataset) && (task === "All tasks" || item.task === task) && (metric === "All metrics" || item.metric === metric) && frameworkMatch && dateMatch;
    });
    return [...result].sort((a, b) => sortBy === "Highest score" ? Number.parseFloat(b.score) - Number.parseFloat(a.score) : sortBy === "Oldest first" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  }, [query, dataset, task, metric, framework, dateRange, sortBy]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selectedItems = benchmarks.filter((item) => compare.includes(item.id));
  const changeFilter = (fn: (value: string) => void, value: string) => { setLoading(true); fn(value); setPage(1); window.setTimeout(() => setLoading(false), 300); };
  const clearAll = () => { setQuery(""); setDataset("All datasets"); setTask("All tasks"); setMetric("All metrics"); setFramework("All frameworks"); setDateRange("Any date"); setSortBy("Latest score"); setPage(1); };
  const removeFilter = (filter: string) => { if (filter === dataset) setDataset("All datasets"); else if (filter === task) setTask("All tasks"); else if (filter === metric) setMetric("All metrics"); else if (filter === framework) setFramework("All frameworks"); else setDateRange("Any date"); setPage(1); };
  return <main className="subpage"><PageIntro eyebrow="THE BENCHMARK INDEX" title={<>Find the <em>evidence.</em></>} copy="Search across models, datasets, tasks, and metrics. Compare results with the context to know what actually moved the score." action={<Link href="/submit" className="button button-primary">Submit a result <UploadCloud size={16} /></Link>} />
    <section className="explorer-section container"><div className="explorer-toolbar glass-panel reveal"><div className="search-box"><Search size={18} /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search models, datasets, tasks..." aria-label="Search benchmarks" /><kbd>⌘ K</kbd></div><div className="filter-row"><div className="filter-label"><SlidersHorizontal size={15} /> Filters</div><select value={dataset} onChange={(e) => changeFilter(setDataset, e.target.value)}><option>All datasets</option><option>ImageNet-1K</option><option>COCO 2017</option><option>SA-1B</option><option>NYUv2</option></select><select value={task} onChange={(e) => changeFilter(setTask, e.target.value)}><option>All tasks</option><option>Image classification</option><option>Object detection</option><option>Segmentation</option><option>Monocular depth</option></select><select value={metric} onChange={(e) => changeFilter(setMetric, e.target.value)}><option>All metrics</option><option>Top-1 accuracy</option><option>mAP @ 50:95</option><option>mIoU</option><option>δ &lt; 1.25</option></select><button className={`filter-button ${showMoreFilters ? "selected" : ""}`} onClick={() => setShowMoreFilters((open) => !open)}><Filter size={15} /> More filters <span className="filter-count">{filters.length}</span></button></div>{showMoreFilters && <div className="more-filter-panel"><label><span>Framework</span><select value={framework} onChange={(e) => changeFilter(setFramework, e.target.value)}><option>All frameworks</option><option>PyTorch</option><option>JAX</option><option>TensorFlow</option><option>Meta</option></select></label><label><span>Date added</span><select value={dateRange} onChange={(e) => changeFilter(setDateRange, e.target.value)}><option>Any date</option><option>Past 7 days</option><option>Past 30 days</option><option>This year</option></select></label><button className="clear-inline" onClick={clearAll}>Reset filters</button></div>}</div>
      <div className="result-head reveal"><div><span className="result-count">{filtered.length}</span> results <span className="muted">/ ranked by {sortBy.toLowerCase()}</span></div><div className="result-tools"><select className="sort-select" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}><option>Latest score</option><option>Highest score</option><option>Oldest first</option></select><div className="view-toggle"><button className={viewMode === "cards" ? "active" : ""} onClick={() => setViewMode("cards")} aria-label="Card view"><Layers3 size={15} /></button><button className={viewMode === "table" ? "active" : ""} onClick={() => setViewMode("table")} aria-label="Table view"><BarChart3 size={15} /></button></div></div></div>
      {filters.length > 0 && <div className="active-filters reveal"><span>Active filters</span>{filters.map((filter) => <button key={filter} onClick={() => removeFilter(filter)}>{filter} <X size={12} /></button>)}<button className="clear-filters" onClick={clearAll}>Clear all</button></div>}
      <div className={`result-list ${viewMode === "table" ? "table-result-list" : ""}`}>{loading ? [1, 2, 3].map((n) => <div className="result-card skeleton-card" key={n}><div className="skeleton skeleton-icon" /><div className="skeleton-lines"><span className="skeleton" /><span className="skeleton short" /></div><div className="skeleton skeleton-score" /></div>) : paged.length ? paged.map((item, i) => viewMode === "table" ? <div className="result-table-row reveal" style={revealStyle(i * 35)} key={item.id}><span className="table-model-name"><Code2 size={15} /> {item.model}</span><span>{item.dataset}</span><span>{item.task}</span><strong>{item.score}</strong><button className={`compare-button ${compare.includes(item.id) ? "selected" : ""}`} onClick={() => setCompare((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}>{compare.includes(item.id) ? <Check size={14} /> : <GitCompareArrows size={14} />} {compare.includes(item.id) ? "Added" : "Compare"}</button></div> : <div className="result-card reveal" style={revealStyle(i * 45)} key={item.id}><div className="result-model-icon"><Code2 size={19} /></div><div className="result-details"><div className="result-title-row"><h3>{item.model}</h3><span className="verified"><ShieldCheck size={13} /> verified</span></div><p>{item.dataset} <i>·</i> {item.task}</p><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}<span className="date-tag"><Clock3 size={12} /> {item.date}</span></div></div><div className="result-metric"><span>{item.metric}</span><strong>{item.score}</strong><small>{item.delta} vs. prior best <ArrowUpRightIcon /></small></div><button className={`compare-button ${compare.includes(item.id) ? "selected" : ""}`} onClick={() => setCompare((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}>{compare.includes(item.id) ? <Check size={15} /> : <GitCompareArrows size={15} />} {compare.includes(item.id) ? "Added" : "Compare"}</button></div>) : <div className="empty-state reveal"><div className="empty-icon"><Search size={20} /></div><h3>No results found</h3><p>Try a different search or clear the active filters to explore the full index.</p><button className="button button-ghost dark-ghost" onClick={clearAll}>Clear search <RotateCcwIcon /></button></div>}</div>
      <div className="pagination reveal"><span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div><button disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ArrowRight size={15} className="rotate-left" /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} className={page === pageNumber ? "page-active" : ""} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}><ArrowRight size={15} /></button></div></div>
    </section>
    {compare.length > 0 && <div className="compare-tray"><div><span className="compare-tray-icon"><GitCompareArrows size={16} /></span><strong>{compare.length} result{compare.length > 1 ? "s" : ""} selected</strong><span>{compare.length < 2 ? "Choose one more to compare side by side." : "Ready for a side-by-side read."}</span></div><div><button className="tray-clear" onClick={() => setCompare([])}>Clear</button><button className="button button-primary small" disabled={compare.length < 2} onClick={() => setCompareOpen(true)}>Compare now <ArrowRight size={15} /></button></div></div>}
    {compareOpen && <div className="compare-modal-backdrop" role="presentation" onClick={() => setCompareOpen(false)}><div className="compare-modal glass-panel" role="dialog" aria-modal="true" aria-labelledby="compare-title" onClick={(event) => event.stopPropagation()}><div className="compare-modal-header"><div><span className="eyebrow"><span className="eyebrow-line" /> SIDE-BY-SIDE READ</span><h2 id="compare-title">Compare selected results</h2></div><button onClick={() => setCompareOpen(false)} aria-label="Close comparison"><X size={18} /></button></div><div className="compare-grid">{selectedItems.map((item) => <div className="compare-column" key={item.id}><div className="compare-column-icon"><Code2 size={18} /></div><h3>{item.model}</h3><p>{item.dataset} · {item.task}</p><strong>{item.score}</strong><span>{item.metric}</span><div className="compare-stat"><small>Latest delta</small><b>{item.delta}</b></div><div className="compare-stat"><small>Submitted</small><b>{item.date}</b></div><div className="tag-row">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>)}</div></div></div>}
  </main>;
}

function RotateCcwIcon() { return <Activity size={15} />; }

function LeaderboardsPage() {
  const [board, setBoard] = useState("ImageNet-1K");
  const [boardMetric, setBoardMetric] = useState("Top-1 accuracy");
  const [exportNotice, setExportNotice] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const activeRankings = leaderboardData[board] ?? rankings;
  const metricLabel = board === "COCO 2017" ? "mAP @ 50:95" : board === "SA-1B" ? "mIoU" : boardMetric;
  const exportBoard = () => { setExportNotice(true); window.setTimeout(() => setExportNotice(false), 2600); };
  return <main className="subpage"><PageIntro eyebrow="THE LEADERBOARD" title={<>See who is <em>moving the line.</em></>} copy="A transparent view of the strongest reported results, ordered by the metrics that matter." action={<button className="button button-ghost" onClick={exportBoard}><Download size={16} /> Export board</button>} />
    <section className="leaderboard-section container"><div className="board-controls glass-panel reveal"><div><span className="control-label">DATASET</span><select value={board} onChange={(e) => { setBoard(e.target.value); setSelectedModel(null); }}><option>ImageNet-1K</option><option>COCO 2017</option><option>SA-1B</option></select></div><div><span className="control-label">PRIMARY METRIC</span><select value={boardMetric} onChange={(e) => setBoardMetric(e.target.value)}><option>Top-1 accuracy</option><option>mAP @ 50:95</option><option>mIoU</option></select></div><div className="board-updated"><span className="live-pulse" /> Live board <small>Updated 4 min ago</small></div></div>{exportNotice && <div className="board-notice reveal is-visible"><CheckCircle2 size={15} /> Export prepared for {board} · {metricLabel}</div>}
      <div className="podium-grid">{activeRankings.slice(0, 3).map((item, i) => <article className={`podium-card podium-${i + 1} reveal`} style={revealStyle(i * 80)} key={item.rank}><div className="podium-top"><span className={`rank-badge rank-${item.rank}`}>{item.rank === 1 ? <Trophy size={15} /> : `0${item.rank}`}</span><span className="podium-delta">+{i === 0 ? "1.8" : i === 1 ? "1.4" : "0.6"}%</span></div><div className={`avatar-mark avatar-${item.color}`}>{item.model.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div><h3>{item.model}</h3><p>{item.org}</p><strong className="podium-score">{item.score}</strong><span className="podium-metric">{board} · {metricLabel}</span><div className="podium-footer"><span><FileText size={13} /> {item.submissions} submissions</span><span><Activity size={13} /> stable</span></div></article>)}</div>
      <div className="ranking-table-wrap glass-panel reveal"><div className="table-heading"><div><span className="eyebrow dark"><span className="eyebrow-line" /> FULL RANKING · {board.toUpperCase()}</span><h2>All submissions</h2></div><a className="text-link" href="/about#methodology">View methodology <ArrowRight size={15} /></a></div><div className="ranking-table"><div className="ranking-row table-header"><span>RANK</span><span>MODEL</span><span>SCORE</span><span>STD. DEV.</span><span>SUBMISSIONS</span><span /></div>{activeRankings.map((item) => <div className="ranking-row" key={item.rank}><span className={`table-rank ${item.rank <= 3 ? "top" : ""}`}>{String(item.rank).padStart(2, "0")}</span><div className="table-model"><div className={`mini-avatar avatar-${item.color}`}>{item.model.slice(0, 1)}</div><div><strong>{item.model}</strong><small>{item.org}</small></div></div><div className="table-score"><strong>{item.score}</strong><div className="score-bar"><i style={{ width: `${item.width}%` }} /></div></div><span className="table-muted">{item.std}</span><span className="table-muted">{item.submissions}</span><button className="row-more" onClick={() => setSelectedModel(item.model)} aria-label={`View ${item.model} details`}><ArrowRight size={15} /></button></div>)}</div>{selectedModel && <div className="board-detail"><div><span className="eyebrow dark"><span className="eyebrow-line" /> SELECTED SUBMISSION</span><h3>{selectedModel}</h3><p>Verified result · {board} · {metricLabel}</p></div><div className="detail-quick-stats"><span><b>14</b> runs</span><span><b>0.11</b> std. dev.</span><span><b>98%</b> reproducibility</span></div><button className="row-more" onClick={() => setSelectedModel(null)}><X size={16} /></button></div>}</div>
    </section>
  </main>;
}


function AboutPage() {
  const principles = [
    { icon: ShieldCheck, number: "01", title: "Evidence over hype", copy: "Every score is anchored to a dataset, task, metric, and reproducible context so progress can be inspected—not just announced." },
    { icon: GitCompareArrows, number: "02", title: "Comparisons with context", copy: "We make the details around a result visible: variance, protocol, code, checkpoint, and the decisions that shaped the number." },
    { icon: Users, number: "03", title: "Built in the open", copy: "Vision research moves faster when baselines, failures, and improvements are easy for the whole community to build on." },
  ];
  const timeline = [
    { year: "2024", title: "The first index", copy: "VisionBench starts as a small shared sheet for tracking vision model results." },
    { year: "2025", title: "Protocols become public", copy: "Dataset cards, metric definitions, and reproducibility signals become part of every record." },
    { year: "2026", title: "A measurement layer", copy: "The index grows into an open interface for discovering, comparing, and contributing benchmarks." },
  ];
  return <main className="subpage about-page"><section className="about-hero container reveal"><div><div className="eyebrow"><span className="eyebrow-line" /> ABOUT VISIONBENCH</div><h1>Make progress<br /><em>legible.</em></h1><p>VisionBench is an open measurement layer for computer vision—a shared place to understand what changed, why it matters, and what to try next.</p><div className="hero-actions"><Link href="/explore" className="button button-primary">Explore the index <ArrowRight size={16} /></Link><Link href="/submit" className="button button-ghost">Contribute a result <UploadCloud size={16} /></Link></div></div><div className="about-signal glass-panel"><div className="signal-top"><span className="panel-kicker">THE INDEX / LIVE SIGNAL</span><span className="live-pulse" /></div><div className="signal-number">12.4<span>k</span></div><p>submissions indexed across the open vision ecosystem</p><div className="signal-bars"><i style={{ height: "38%" }} /><i style={{ height: "51%" }} /><i style={{ height: "46%" }} /><i style={{ height: "66%" }} /><i style={{ height: "58%" }} /><i style={{ height: "79%" }} /><i style={{ height: "72%" }} /><i style={{ height: "94%" }} /></div><div className="signal-footer"><span>Aug 2025</span><span>Sep 2026</span></div></div></section><section id="methodology" className="about-statement section-light"><div className="container about-statement-grid reveal"><div><div className="eyebrow dark"><span className="eyebrow-line" /> WHY WE EXIST</div><h2>The field has no shortage of results.<br /><em>It needs a better record.</em></h2></div><p>Important findings still live across papers, repositories, spreadsheets, and threads. That makes it difficult to tell whether a new number is genuinely better—or simply measured differently. VisionBench brings the evidence into one navigable, inspectable layer.</p></div></section><section className="section about-principles"><div className="container"><div className="section-heading compact reveal"><div><div className="eyebrow"><span className="eyebrow-line" /> THE VISIONBENCH POINT OF VIEW</div><h2>Simple principles.<br /><em>Higher signal.</em></h2></div><span className="about-section-note">A public good for better baselines.</span></div><div className="principle-grid">{principles.map(({ icon: Icon, number, title, copy }, i) => <article className="principle-card reveal" style={revealStyle(i * 70)} key={number}><div className="principle-top"><span>{number}</span><Icon size={19} /></div><h3>{title}</h3><p>{copy}</p><span className="principle-line" /></article>)}</div></div></section><section className="section about-timeline"><div className="container"><div className="section-heading compact reveal"><div><div className="eyebrow dark"><span className="eyebrow-line" /> A SHORT HISTORY</div><h2>From scattered notes<br />to <em>shared signal.</em></h2></div><a className="text-link" href="https://github.com">See the open source repo <ExternalLink size={14} /></a></div><div className="timeline">{timeline.map(({ year, title, copy }, i) => <div className="timeline-item reveal" style={revealStyle(i * 80)} key={year}><div className="timeline-year">{year}</div><div className="timeline-marker"><span /></div><div className="timeline-copy"><h3>{title}</h3><p>{copy}</p></div></div>)}</div></div></section><section className="about-team"><div className="container about-team-inner reveal"><div><div className="eyebrow"><span className="eyebrow-line" /> BUILT WITH THE COMMUNITY</div><h2>Better measurement<br /><em>is a team sport.</em></h2></div><div className="about-team-copy"><p>VisionBench is shaped by researchers, engineers, and open-source maintainers who believe benchmark infrastructure should be as thoughtful as the models it measures.</p><a href="mailto:hello@visionbench.dev" className="button button-ghost">Start a conversation <ArrowRight size={16} /></a></div></div></section></main>;
}

function SubmissionPage() {
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); if (!model.trim()) { setError("Add a model name to continue."); setStep(1); return; } setError(""); setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const steps = [[1, "Model details"], [2, "Evaluation"], [3, "Results"], [4, "Review"]] as const;
  if (submitted) return <main className="subpage submit-page"><div className="success-state container reveal is-visible"><div className="success-orbit"><div className="success-icon"><CheckCircle2 size={31} /></div></div><div className="eyebrow"><span className="eyebrow-line" /> RECEIVED AND IN REVIEW</div><h1>Your result is<br /><em>in the record.</em></h1><p>Thanks for contributing to the shared measurement layer. We’ll validate the submission and publish it to the index when the checks pass.</p><div className="success-meta"><div><span>Submission ID</span><strong>VB-2026-0913-042</strong></div><div><span>Estimated review</span><strong>~ 1 business day</strong></div></div><div className="hero-actions"><Link href="/explore" className="button button-primary">Explore the index <ArrowRight size={16} /></Link><button className="button button-ghost" onClick={() => setSubmitted(false)}>Submit another</button></div></div></main>;
  return <main className="subpage submit-page"><PageIntro eyebrow="CONTRIBUTE A RESULT" title={<>Put your work<br /><em>on the map.</em></>} copy="Share the result, the setup, and enough context for someone else to reproduce the comparison." /><section className="submit-layout container"><aside className="submit-sidebar"><div className="progress-label"><span>SUBMISSION FLOW</span><strong>{step} / 4</strong></div><div className="progress-track"><i style={{ width: `${step * 25}%` }} /></div><nav className="step-nav">{steps.map(([number, label]) => <button key={number} className={step === number ? "active" : step > number ? "complete" : ""} onClick={() => setStep(number as number)}><span>{step > number ? <Check size={14} /> : number}</span>{label}</button>)}</nav><div className="submit-aside-note"><CircleHelp size={16} /><div><strong>Need a hand?</strong><p>Read the <a href="#methodology">submission guide</a> or contact our research team.</p></div></div></aside><form className="submit-form glass-panel" onSubmit={submit}><div className="form-header"><div><span className="eyebrow dark"><span className="eyebrow-line" /> STEP {step.toString().padStart(2, "0")}</span><h2>{steps[step - 1][1]}</h2></div><span className="autosave"><Check size={13} /> Autosaved</span></div>{step === 1 && <div className="form-section"><Field label="Model name" required description="Use the public name researchers will recognize." error={error}><input value={model} onChange={(e) => { setModel(e.target.value); setError(""); }} placeholder="e.g. DINOv2 ViT-L/14" /></Field><div className="field-grid"><Field label="Organization" description="Optional · team, lab, or company"><input placeholder="e.g. Meta AI Research" /></Field><Field label="Framework"><select><option>PyTorch</option><option>JAX</option><option>TensorFlow</option><option>Other</option></select></Field></div><Field label="Checkpoint or code URL" description="Link to weights, repository, or an archival release."><div className="input-with-icon"><ExternalLink size={15} /><input placeholder="https://github.com/..." /></div></Field></div>}{step === 2 && <div className="form-section"><div className="field-grid"><Field label="Dataset" required><select><option>ImageNet-1K</option><option>COCO 2017</option><option>SA-1B</option><option>NYUv2</option></select></Field><Field label="Dataset version"><input placeholder="e.g. 1.0 / 2012" /></Field></div><Field label="Task" required><select><option>Image classification</option><option>Object detection</option><option>Segmentation</option><option>Monocular depth</option><option>Image retrieval</option></select></Field><Field label="Evaluation protocol" description="Mention splits, preprocessing, resolution, and any non-default choices."><textarea placeholder="Describe the evaluation setup..." /></Field></div>}{step === 3 && <div className="form-section"><div className="field-grid"><Field label="Primary metric" required><select><option>Top-1 accuracy</option><option>mAP @ 50:95</option><option>mIoU</option><option>δ &lt; 1.25</option></select></Field><Field label="Score" required><input placeholder="e.g. 86.3" /></Field></div><div className="field-grid"><Field label="Standard deviation"><input placeholder="e.g. 0.11" /></Field><Field label="Number of runs"><input placeholder="e.g. 3" /></Field></div><Field label="Methodology notes" description="What should a reader know to interpret this score?"><textarea placeholder="Add details on training, inference, and reproducibility..." /></Field></div>}{step === 4 && <div className="form-section review-section"><div className="review-callout"><ShieldCheck size={19} /><div><strong>Almost ready to publish.</strong><p>We’ll run automated checks for formatting, duplicate records, and link availability before review.</p></div></div><div className="review-list"><div><span>Model</span><strong>{model || "Your model name"}</strong><CheckCircle2 size={16} /></div><div><span>Evaluation</span><strong>ImageNet-1K · Image classification</strong><CheckCircle2 size={16} /></div><div><span>Visibility</span><strong>Public in the VisionBench index</strong><CheckCircle2 size={16} /></div></div><label className="checkbox-row"><input type="checkbox" defaultChecked /><span>I confirm this result is reported accurately and linked materials are shareable.</span></label></div>}<div className="form-footer">{step > 1 ? <button type="button" className="button button-ghost dark-ghost" onClick={() => setStep((current) => current - 1)}>Back</button> : <span className="form-hint">Required fields are marked with *</span>}{step < 4 ? <button type="button" className="button button-primary" onClick={() => { if (step === 1 && !model.trim()) { setError("Add a model name to continue."); return; } setStep((current) => current + 1); }}>Continue <ArrowRight size={16} /></button> : <button type="submit" className="button button-primary">Submit for review <ArrowRight size={16} /></button>}</div></form></section></main>;
}

function Field({ label, required, description, error, children }: { label: string; required?: boolean; description?: string; error?: string; children: React.ReactNode }) {
  return <label className={`field ${error ? "has-error" : ""}`}><span className="field-label">{label}{required && <b> *</b>}</span>{description && <span className="field-description">{description}</span>}{children}{error && <span className="field-error">{error}</span>}</label>;
}

function App() {
  return (
    <>
      <Layout><Switch><Route path="/" component={HomePage} /><Route path="/explore" component={ExplorerPage} /><Route path="/leaderboards" component={LeaderboardsPage} /><Route path="/about" component={AboutPage} /><Route path="/submit" component={SubmissionPage} /><Route component={HomePage} /></Switch></Layout>
      <SpeedInsights />
    </>
  );
}

export default App;

// Kept local to avoid pulling in a second icon package for a single control.
function ArrowUpRight() { return null; }

// Type-safe alias for the small icon used in link endings.
void ArrowUpRight;
void BookOpen;
void LineChart;
void Plus;
