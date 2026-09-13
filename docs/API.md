# CV Benchmarks API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Currently using optional JWT tokens. All public endpoints accessible without authentication.

## Endpoints

### Benchmarks

#### GET /benchmarks
Fetch all benchmarks with pagination and filtering.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `dataset` - filter by dataset name
- `model` - filter by model name
- `sort` - sort field (default: created_at)

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "COCO Detection v1",
      "dataset": "COCO",
      "model": "YOLOv8",
      "metric": "mAP",
      "score": 0.537,
      "description": "Object detection benchmark",
      "created_at": "2024-01-15T10:00:00Z",
      "submitted_by": "user123"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

#### POST /benchmarks
Submit a new benchmark.

**Request Body:**
```json
{
  "name": "Benchmark Name",
  "dataset": "Dataset Name",
  "model": "Model Name",
  "metric": "mAP",
  "score": 0.537,
  "description": "Description of the benchmark",
  "url": "https://...",
  "code_url": "https://github.com/...",
  "paper_url": "https://arxiv.org/abs/..."
}
```

#### GET /benchmarks/:id
Get a specific benchmark by ID.

#### PUT /benchmarks/:id
Update a benchmark (requires authentication).

#### DELETE /benchmarks/:id
Delete a benchmark (requires authentication).

### Datasets

#### GET /datasets
Get all available datasets.

#### POST /datasets
Create a new dataset (admin only).

### Models

#### GET /models
Get all available models.

#### POST /models
Add a new model (admin only).

### Leaderboards

#### GET /leaderboards
Get leaderboard data.

**Query Parameters:**
- `dataset` - filter by dataset
- `metric` - filter by metric (e.g., mAP, accuracy)

## Error Responses

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
