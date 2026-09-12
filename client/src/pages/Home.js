import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>🎯 CV Benchmarks Platform</h1>
          <p>Gather, compare, and share computer vision benchmarks from around the world</p>
          <div className="hero-buttons">
            <Link to="/benchmarks" className="btn btn-primary">
              Explore Benchmarks →
            </Link>
            <Link to="/submit" className="btn btn-secondary">
              Submit Results
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Comprehensive Database</h3>
            <p>Access thousands of computer vision benchmarks in one place</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Advanced Search</h3>
            <p>Filter by dataset, model, and metric to find exactly what you need</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Leaderboards</h3>
            <p>See how different models perform across various datasets</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Community Driven</h3>
            <p>Submit your own benchmarks and contribute to the community</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>Export Data</h3>
            <p>Download benchmark data in CSV format for analysis</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Open Source</h3>
            <p>Fully open source and available on GitHub</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <h3>1000+</h3>
          <p>Benchmarks</p>
        </div>
        <div className="stat">
          <h3>200+</h3>
          <p>Models</p>
        </div>
        <div className="stat">
          <h3>50+</h3>
          <p>Datasets</p>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to contribute?</h2>
        <p>Share your computer vision benchmark results with researchers worldwide</p>
        <Link to="/submit" className="btn btn-primary btn-large">
          Submit Your Benchmark
        </Link>
      </section>
    </div>
  );
}

export default Home;
