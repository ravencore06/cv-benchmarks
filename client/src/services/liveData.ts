import { useEffect, useState } from "react";
import { benchmarkService, leaderboardService } from "./api";

export interface BenchmarkCard {
  id: string;
  model: string;
  dataset: string;
  task: string;
  metric: string;
  score: string;
  date: string;
  tags: string[];
  delta: string;
}

export interface RankingRow {
  rank: number;
  model: string;
  org: string;
  score: string;
  std: string;
  submissions: number;
  width: number;
  color: string;
}

export interface LeaderboardMap {
  names: string[];
  boards: Record<string, RankingRow[]>;
  metrics: Record<string, string>;
}

const PALETTE = ["blue", "violet", "indigo", "slate", "teal"];

function formatScore(score: number): string {
  if (score <= 1) return `${(score * 100).toFixed(1)}%`;
  return score.toFixed(1);
}

export async function loadBenchmarkCards(): Promise<BenchmarkCard[]> {
  const list = await benchmarkService.list({ limit: 100 });
  const entries = await leaderboardService.list();
  const topByBenchmark = new Map<string, { model_name: string; organization: string | null; score: number }>();
  for (const entry of entries) {
    if (!topByBenchmark.has(entry.benchmark_id)) {
      topByBenchmark.set(entry.benchmark_id, {
        model_name: entry.model_name,
        organization: entry.organization,
        score: entry.score,
      });
    }
  }
  return list.data.map((benchmark) => {
    const top = topByBenchmark.get(benchmark.id);
    return {
      id: benchmark.id,
      model: top?.model_name ?? benchmark.name,
      dataset: benchmark.name,
      task: benchmark.task_type,
      metric: benchmark.metric,
      score: top ? formatScore(top.score) : "—",
      date: "—",
      tags: [benchmark.category, top?.organization].filter(Boolean) as string[],
      delta: "—",
    };
  });
}

export async function loadLeaderboards(): Promise<LeaderboardMap> {
  const [list, entries] = await Promise.all([
    benchmarkService.list({ limit: 100 }),
    leaderboardService.list(),
  ]);
  const nameById = new Map(list.data.map((benchmark) => [benchmark.id, benchmark]));
  const grouped = new Map<string, RankingRow[]>();
  const metrics: Record<string, string> = {};
  for (const entry of entries) {
    const rows = grouped.get(entry.benchmark_id) ?? [];
    const benchmark = nameById.get(entry.benchmark_id);
    const name = benchmark?.name ?? entry.benchmark_id;
    metrics[name] = benchmark?.metric ?? "Score";
    rows.push({
      rank: rows.length + 1,
      model: entry.model_name,
      org: entry.organization ?? "",
      score: formatScore(entry.score),
      std: "",
      submissions: entries.filter((e) => e.benchmark_id === entry.benchmark_id).length,
      width: Math.max(4, Math.min(100, Math.round(entry.score * 100))),
      color: PALETTE[rows.length % PALETTE.length],
    });
    grouped.set(entry.benchmark_id, rows);
  }
  const boards: Record<string, RankingRow[]> = {};
  Array.from(grouped.entries()).forEach(([id, rows]) => {
    const name = nameById.get(id)?.name ?? id;
    boards[name] = rows;
  });
  return { names: Object.keys(boards), boards, metrics };
}

export interface LiveData {
  benchmarks: BenchmarkCard[] | null;
  leaderboards: LeaderboardMap | null;
  loading: boolean;
}

export function useLiveData(): LiveData {
  const [benchmarks, setBenchmarks] = useState<BenchmarkCard[] | null>(null);
  const [leaderboards, setLeaderboards] = useState<LeaderboardMap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadBenchmarkCards(), loadLeaderboards()])
      .then(([cards, boards]) => {
        if (cancelled) return;
        setBenchmarks(cards);
        setLeaderboards(boards);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { benchmarks, leaderboards, loading };
}