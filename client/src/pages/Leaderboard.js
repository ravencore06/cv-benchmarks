import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/api';
import './Leaderboard.css';

function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dataset: '',
    metric: '',
  });

  useEffect(() => {
    loadLeaderboard();
  }, [filters]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardService.getAll(filters);
      setLeaderboards(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const groupedByDataset = leaderboards.reduce((acc, item) => {
    if (!acc[item.dataset]) {
      acc[item.dataset] = {};
    }
    if (!acc[item.dataset][item.metric]) {
      acc[item.dataset][item.metric] = [];
    }
    acc[item.dataset][item.metric].push(item);
    return acc;
  }, {});

  return (
    <div className="leaderboard-page">
      <h1>🏆 Leaderboards</h1>
      <p className="subtitle">Top-performing models across datasets</p>

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
          <label>Metric</label>
          <input
            type="text"
            name="metric"
            placeholder="Filter by metric..."
            value={filters.metric}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading leaderboards...</div>
      ) : Object.keys(groupedByDataset).length === 0 ? (
        <div className="no-results">No leaderboards available yet.</div>
      ) : (
        <div className="leaderboards-container">
          {Object.entries(groupedByDataset).map(([dataset, metrics]) =>
            Object.entries(metrics).map(([metric, models]) => (
              <div key={`${dataset}-${metric}`} className="leaderboard-table-wrapper">
                <h2>{dataset} - {metric}</h2>
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Model</th>
                      <th>Score</th>
                      <th>Std Dev</th>
                      <th>Submissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((item, index) => (
                      <tr key={`${item.model}-${index}`} className={`rank-${index}`}>
                        <td className="rank">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `${index + 1}`}
                        </td>
                        <td className="model">{item.model || 'Unknown'}</td>
                        <td className="score">{item.score.toFixed(4)}</td>
                        <td className="std">{item.score_std ? item.score_std.toFixed(4) : '-'}</td>
                        <td className="count">{item.benchmark_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
