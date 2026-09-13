const { validateBenchmark } = require('./benchmarkValidator');

describe('benchmarkValidator', () => {
  it('accepts an optional research paper URL', () => {
    const paperUrl = 'https://arxiv.org/abs/2004.00000';
    const { error, value } = validateBenchmark({
      name: 'Test Benchmark',
      metric: 'mAP',
      score: 0.75,
      paper_url: paperUrl,
    });

    expect(error).toBeUndefined();
    expect(value.paper_url).toBe(paperUrl);
  });
});
