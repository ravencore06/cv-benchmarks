import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import { benchmarkService } from '../services/api';
import './Benchmarks.css';

function Benchmarks() {
  const [benchmarks, setBenchmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    dataset: '',
    model: '',
    metric: '',
  });

  useEffect(() => {
    loadBenchmarks();
  }, [filters]);

  const loadBenchmarks = async () => {
    try {
      setLoading(true);
      const response = await benchmarkService.getAll(filters);
      setBenchmarks(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Dataset', 'Model', 'Metric', 'Score', 'Submitted By'];
    const rows = benchmarks.map(b => [
      b.name,
      b.dataset || 'N/A',
      b.model || 'N/A',
      b.metric,
      b.score,
      b.submitted_by || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'benchmarks.csv';
    a.click();
  };

  return (
    <div className="benchmarks-page">
      <h1>📊 CV Benchmarks</h1>
      <p className="subtitle">Explore and compare computer vision benchmarks</p>

      <div className="filters-section">
        <div className="filter-group">
          <label>Dataset</label>
          <input
            type="text"
            name="dataset"
            placeholder="Filter by dataset..."
            value={filters.dataset}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Model</label>
          <input
            type="text"
            name="model"
            placeholder="Filter by model..."
            value={filters.model}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Metric</label>
          <input
            type="text"
            name="metric"
            placeholder="Filter by metric..."
            value={filters.metric}
            onChange={handleFilterChange}
          />
        </div>
        <button className="btn-export" onClick={exportToCSV}>
          <FiDownload /> Export CSV
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading benchmarks...</div>
      ) : benchmarks.length === 0 ? (
        <div className="no-results">No benchmarks found. Be the first to submit! 🚀</div>
      ) : (
        <div className="benchmarks-grid">
          {benchmarks.map(benchmark => (
            <div key={benchmark.id} className="benchmark-card">
              <h3>{benchmark.name}</h3>
              <div className="benchmark-meta">
                <span className="badge dataset">{benchmark.dataset || 'Unknown'}</span>
                <span className="badge model">{benchmark.model || 'Unknown'}</span>
              </div>
              <p className="description">{benchmark.description}</p>
              <div className="score-section">
                <div className="metric">{benchmark.metric}</div>
                <div className="score">{benchmark.score.toFixed(4)}</div>
                {benchmark.score_std && (
                  <div className="std">±{benchmark.score_std.toFixed(4)}</div>
                )}
              </div>
              <div className="meta-info">
                {benchmark.submitted_by && <p>By: {benchmark.submitted_by}</p>}
                <p className="date">{new Date(benchmark.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Benchmarks;
