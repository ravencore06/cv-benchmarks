import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) || "/api/v1";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export interface Benchmark {
  id: string;
  name: string;
  category: string;
  task_type: string;
  dataset_url: string | null;
  metric: string;
  input_format: string;
}

export interface SubmissionDetail {
  id: string;
  model_name: string;
  organization: string | null;
  benchmark_id: string;
  score: number;
  paper_url: string | null;
  created_at: string;
  model_description?: string;
  architecture?: string;
  repo_url?: string;
}

export interface BenchmarkDetail extends Benchmark {
  submissions: SubmissionDetail[];
  best_score: number | null;
  evaluation_count: number;
  evaluated_models_count: number;
}

export interface DomainBenchmark extends Benchmark {
  evaluation_count: number;
  best_score: number | null;
  best_model: string | null;
}

export interface DomainModel {
  id: number | string;
  name: string;
  description: string | null;
  organization: string | null;
  framework: string | null;
  url: string | null;
  paper_url: string | null;
  evaluation_count: number;
  evaluated_benchmarks: string[];
}

export interface DomainHierarchyNode {
  benchmark_id: string;
  benchmark_name: string;
  task_type: string;
  metric: string;
  dataset_url: string | null;
  best_score: number | null;
  best_model: string | null;
  evaluations: SubmissionDetail[];
}

export interface DocumentAiDomainData {
  domain: string;
  subtitle: string;
  stats: {
    benchmark_count: number;
    model_count: number;
    evaluation_count: number;
    task_count: number;
  };
  benchmarks: DomainBenchmark[];
  models: DomainModel[];
  submissions: SubmissionDetail[];
  hierarchy: DomainHierarchyNode[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BenchmarkList {
  data: Benchmark[];
  pagination: Pagination;
}

export interface BenchmarkQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  task_type?: string;
  metric?: string;
}

export interface LeaderboardEntry {
  benchmark_id: string;
  model_name: string;
  organization: string | null;
  score: number;
  rank: number;
}

export interface SubmissionInput {
  model_name: string;
  organization?: string | null;
  benchmark_id: string;
  score: number;
  paper_url?: string | null;
}

export const benchmarkService = {
  list: (params: BenchmarkQuery = {}) =>
    api.get<BenchmarkList>("/benchmarks", { params }).then((res) => res.data),
  getAll: (params: BenchmarkQuery = {}) => benchmarkService.list(params),
  get: (id: string) =>
    api.get<BenchmarkDetail>(`/benchmarks/${id}`).then((res) => res.data),
  create: (payload: unknown) =>
    api.post("/benchmarks", payload).then((res) => res.data),
};

export const datasetService = {
  getAll: () => api.get("/datasets").then((res) => res.data),
  create: (payload: unknown) =>
    api.post("/datasets", payload).then((res) => res.data),
};

export const modelService = {
  getAll: () => api.get<DomainModel[]>("/models").then((res) => res.data),
  create: (payload: unknown) =>
    api.post("/models", payload).then((res) => res.data),
};

export const leaderboardService = {
  list: (benchmarkId?: string) =>
    api
      .get<LeaderboardEntry[]>("/leaderboards", {
        params: benchmarkId ? { benchmark_id: benchmarkId } : {},
      })
      .then((res) => res.data),
};

export const submissionService = {
  create: (payload: SubmissionInput) =>
    api.post("/submissions", payload).then((res) => res.data),
};

export const domainService = {
  getDocumentAi: () =>
    api.get<DocumentAiDomainData>("/domains/document-ai").then((res) => res.data),
};

export default api;
