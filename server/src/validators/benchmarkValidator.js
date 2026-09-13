const Joi = require('joi');

const benchmarkSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().allow(''),
  dataset: Joi.string().max(255),
  model: Joi.string().max(255),
  metric: Joi.string().max(100).required(),
  score: Joi.number().required(),
  score_std: Joi.number(),
  url: Joi.string().uri().allow(''),
  code_url: Joi.string().uri().allow(''),
  paper_url: Joi.string().uri().allow(''),
  submitted_by: Joi.string().max(255)
});

function validateBenchmark(data) {
  return benchmarkSchema.validate(data);
}

module.exports = { validateBenchmark };
