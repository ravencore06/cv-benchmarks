import React, { useState, useEffect } from 'react';
import { benchmarkService, datasetService, modelService } from '../services/api';
import './Submit.css';

function Submit() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dataset: '',
    model: '',
    metric: '',
    score: '',
    score_std: '',
    url: '',
    code_url: '',
    paper_url: '',
    submitted_by: '',
  });

  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [dsResp, mResp] = await Promise.all([
        datasetService.getAll(),
        modelService.getAll(),
      ]);
      setDatasets(dsResp.data);
      setModels(mResp.data);
    } catch (err) {
      console.error('Error loading dropdowns:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await benchmarkService.create(formData);
      setSuccess(true);
      setFormData({
        name: '',
        description: '',
        dataset: '',
        model: '',
        metric: '',
        score: '',
        score_std: '',
        url: '',
        code_url: '',
        paper_url: '',
        submitted_by: '',
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-page">
      <div className="submit-container">
        <h1>📤 Submit a Benchmark</h1>
        <p className="subtitle">Share your computer vision benchmark results with the community</p>

        {success && (
          <div className="alert alert-success">
            ✅ Benchmark submitted successfully!
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="submit-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Benchmark Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., COCO Detection v8"
              />
            </div>
            <div className="form-group">
              <label htmlFor="metric">Metric *</label>
              <input
                type="text"
                id="metric"
                name="metric"
                value={formData.metric}
                onChange={handleChange}
                required
                placeholder="e.g., mAP, Accuracy"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="score">Score *</label>
              <input
                type="number"
                id="score"
                name="score"
                value={formData.score}
                onChange={handleChange}
                required
                step="0.0001"
                placeholder="e.g., 0.537"
              />
            </div>
            <div className="form-group">
              <label htmlFor="score_std">Score Std Dev</label>
              <input
                type="number"
                id="score_std"
                name="score_std"
                value={formData.score_std}
                onChange={handleChange}
                step="0.0001"
                placeholder="e.g., 0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dataset">Dataset</label>
              <input
                type="text"
                id="dataset"
                name="dataset"
                value={formData.dataset}
                onChange={handleChange}
                placeholder="e.g., COCO, ImageNet"
              />
            </div>
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., YOLOv8, ResNet-50"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your benchmark..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="url">Paper/Blog URL</label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="code_url">Code URL</label>
              <input
                type="url"
                id="code_url"
                name="code_url"
                value={formData.code_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="paper_url">Research Paper URL</label>
            <input
              type="url"
              id="paper_url"
              name="paper_url"
              value={formData.paper_url}
              onChange={handleChange}
              placeholder="https://arxiv.org/abs/..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="submitted_by">Your Name</label>
            <input
              type="text"
              id="submitted_by"
              name="submitted_by"
              value={formData.submitted_by}
              onChange={handleChange}
              placeholder="Your name or organization"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Submitting...' : '📤 Submit Benchmark'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Submit;
