# CV Benchmarks Platform

A comprehensive platform for gathering, organizing, and comparing Computer Vision benchmarks.

## Features

- 📊 **Benchmark Database**: Store and organize CV benchmarks from various datasets and models
- 🔍 **Search & Filter**: Advanced search and filtering capabilities
- 📈 **Comparison Tools**: Compare model performance across benchmarks
- 🏆 **Leaderboards**: Track top-performing models and datasets
- 📤 **Submit Benchmarks**: Community-driven submissions
- 📱 **Responsive Design**: Works on desktop and mobile

## Project Structure

```
cv-benchmarks/
├── client/              # React frontend
├── server/              # Node.js/Express backend
├── docs/                # Documentation
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- A Supabase project (or PostgreSQL 12+ for local development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

3. Set up environment variables
   ```bash
   cp server/.env.example server/.env
   ```

   For Supabase, open your project dashboard, select **Connect**, and copy the
   **Session pooler** connection string into `server/.env` as `DATABASE_URL`.
   Keep `sslmode=require` in the URL. Never expose this value in the client or
   commit it to Git.

4. Set up the database
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   ```

   This applies `server/src/db/schema.sql` to the database named by
   `DATABASE_URL` (you can alternatively paste that schema into the Supabase
   SQL Editor), then seeds the benchmark catalog plus 80 sample submissions so
   the leaderboards have data.

5. Start the backend
   ```bash
   cd server
   npm run dev
   ```

6. Start the frontend (optional `client/.env` with `VITE_API_URL` if the API
   is not at `http://localhost:5000`)
   ```bash
   cd client
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`; the API runs at
`http://localhost:5000` (root path lists available endpoints).

## API Documentation

See [API.md](./docs/API.md) for detailed API documentation.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT
