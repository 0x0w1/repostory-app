# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based dashboard application for visualizing GitHub repository stars and forks trends over time. The application fetches data from the `0x0w1/repostory` GitHub repository and provides interactive charts for comparing multiple repositories.

## Technology Stack

- **Framework**: React 18 with Vite as the build tool
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS with PostCSS
- **Charts**: Recharts library for data visualization
- **Package Management**: npm

## Common Development Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (develop branch data)
npm run dev

# Start development server with main branch data  
npm run dev:main
```

### Build Commands
```bash
# Build for production (develop branch data)
npm run build

# Build for develop branch
npm run build:develop

# Build for main branch
npm run build:main

# Preview production build
npm run preview
```

## Environment Configuration

The application uses environment variables to control data source branches:

- `VITE_DATA_BRANCH`: Controls which branch of the `0x0w1/repostory` repository to fetch data from
- Default branch: `develop`
- Available branches: `main`, `develop`

## Project Architecture

### Core Components

- **Dashboard** (`src/components/Dashboard.jsx`): Main container component managing application state, data loading, and chart processing
- **Chart** (`src/components/Chart.jsx`): Recharts-based line chart visualization with responsive design
- **RepositorySelector** (`src/components/RepositorySelector.jsx`): Multi-select interface for choosing repositories
- **MetricSelector** (`src/components/MetricSelector.jsx`): Toggle between stars and forks metrics
- **DateRangeSelector** (`src/components/DateRangeSelector.jsx`): Date filtering controls

### Data Management

- **dataLoader** (`src/utils/dataLoader.js`): Handles data fetching from GitHub raw files, time series processing, and caching
- **Data Source**: Fetches from `https://raw.githubusercontent.com/0x0w1/repostory/refs/heads/{branch}/`
- **Caching**: Implements Map-based caching for processed time series data with automatic cleanup

### Key Features

- **Performance Optimizations**: Debounced chart updates, binary search for data interpolation, Map-based caching
- **Responsive Design**: Mobile-first approach with responsive grid layouts
- **Data Processing**: Cumulative time series calculation from daily increments
- **Branch Switching**: Environment-based data source switching between main/develop branches

## Development Server Configuration

- **Port**: 3000 (development), 4173 (preview)
- **CORS**: Configured for localhost and 0x10.kr domain
- **Auto-open**: Browser opens automatically on `npm run dev`

## Build Configuration

- **Output Directory**: `dist/`
- **Assets Directory**: `assets/`
- **Base Path**: `./` (relative paths for deployment flexibility)

## Data Format

The application expects JSON files with this structure:
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

## Performance Considerations

- **Chart Updates**: Uses debouncing (300ms) for repository selection changes
- **Metric Switching**: Immediate updates using cached processed data
- **Data Interpolation**: Binary search for efficient historical value lookup
- **Memory Management**: Cache size limited to 100 entries with LRU cleanup

## Release Management

- **GitHub Actions**: Release Drafter workflow for automated release notes
- **Release Process**: Triggered on pushes to main branch
- **Version Categories**: Features (🚀), Bug Fixes (🐛), Maintenance (🧰)