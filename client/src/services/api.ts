import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.DEV ? "http://localhost:5000/api/v1" : "https://server-ravens-projects-0947faa8.vercel.app/api/v1");

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
    api.get<Benchmark>(`/benchmarks/${id}`).then((res) => res.data),
  create: (payload: unknown) =>
    api.post("/benchmarks", payload).then((res) => res.data),
};

export const datasetService = {
  getAll: () => api.get("/datasets").then((res) => res.data),
  create: (payload: unknown) =>
    api.post("/datasets", payload).then((res) => res.data),
};

export const modelService = {
  getAll: () => api.get("/models").then((res) => res.data),
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

export default api;
