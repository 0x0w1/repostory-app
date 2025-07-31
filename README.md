# Repository Dashboard

A React-based dashboard for visualizing Git repository stars and forks trends from the `repo_data` directory.

## Features

- 📊 Interactive charts using Recharts
- 🎯 Repository selection (up to 5 repositories)
- 📈 Stars and forks metrics comparison
- 📱 Responsive design with Tailwind CSS
- 🔄 Real-time data loading from JSON files

## Technology Stack

- **Framework**: React 18 (CSR)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Language**: JavaScript (ES6+)
- **Package Management**: npm

## Getting Started

### Prerequisites

- Node.js 16+

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
```

### Preview

```bash
# Preview production build
npm run preview
```


## Data Format

The application expects JSON files in the following format:

```json
{
  "total_stars": 84386,
  "fetched_at": "2025-07-29T17:14:42.677309",
  "stars_by_date": {
    "2012-04-28": 3772,
    "2012-04-29": 4
  },
  "forks_by_date": {
    "2012-04-28": 145,
    "2012-04-29": 2
  }
}
```

## Usage

1. **Select Metric**: Choose between Stars or Forks to visualize
2. **Select Repositories**: Choose up to 5 repositories to compare
3. **View Charts**: Interactive line charts show trends over time
4. **Repository Stats**: View summary statistics for selected repositories


## Development

### Project Structure

```
├── src/
│   ├── components/
│   │   ├── Chart.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DateRangeSelector.jsx
│   │   ├── MetricSelector.jsx
│   │   └── RepositorySelector.jsx
│   ├── utils/
│   │   └── dataLoader.js
│   ├── index.css
│   └── main.jsx
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```


## Troubleshooting

### Data Loading Issues

If data is not loading:

1. Ensure the `repo_data` directory exists and contains JSON files
2. Check that JSON files follow the expected format
3. Check browser console for network or parsing errors

### Build Issues

If the build fails:

1. Ensure all dependencies are installed
2. Check that all import paths are correct
3. Clear node_modules and reinstall if needed

## Branch-specific Scripts

### Build Commands

```bash
# Default build (develop branch)
npm run build

# Build for develop branch
npm run build:develop

# Build for main branch
npm run build:main
```

### Development Commands

```bash
# Default development server (develop branch)
npm run dev

# Development server for main branch
npm run dev:main
```
