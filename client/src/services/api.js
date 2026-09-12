import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const benchmarkService = {
  getAll: (params) => api.get('/benchmarks', { params }),
  getById: (id) => api.get(`/benchmarks/${id}`),
  create: (data) => api.post('/benchmarks', data),
  update: (id, data) => api.put(`/benchmarks/${id}`, data),
  delete: (id) => api.delete(`/benchmarks/${id}`),
};

export const datasetService = {
  getAll: () => api.get('/datasets'),
  create: (data) => api.post('/datasets', data),
};

export const modelService = {
  getAll: () => api.get('/models'),
  create: (data) => api.post('/models', data),
};

export const leaderboardService = {
  getAll: (params) => api.get('/leaderboards', { params }),
};

export default api;
