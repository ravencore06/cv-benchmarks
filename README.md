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
- PostgreSQL 12+

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

4. Set up the database
   ```bash
   cd server
   npm run db:migrate
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## API Documentation

See [API.md](./docs/API.md) for detailed API documentation.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT
