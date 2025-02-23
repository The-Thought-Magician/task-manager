# Task Manager Application 
[Simple Task Manager] (https://github.com/The-Thought-Magician/task-manager/)

A full-stack task management application built with Express.js, Redis, and React.

## Features

- Create, read, update tasks
- Categorize tasks
- Add tags to tasks
- Real-time persistence with Redis
- Docker support for easy deployment

## Prerequisites

- Node.js 18+
- Redis
- Docker (optional)

## Quick Start

### Using Docker

```bash
# Build and run with Docker Compose
docker compose up --build
```

### Manual Setup

```bash
# Install dependencies
npm run install-all

# Development mode
npm run dev

# Production build
npm run prod
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `REDIS_URL`: Redis connection URL (default: redis://localhost:6379)
- `NODE_ENV`: Environment mode (development/production)

## Project Structure

```
task-manager/
├── src/                    # Backend source files
│   ├── index.ts           # Main application entry
│   └── redis-config.ts    # Redis configuration
├── frontend/              # React frontend application
├── dist/                  # Compiled backend code
├── Dockerfile             # Docker configuration
└── docker-compose.yml     # Docker Compose configuration
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category

## Docker Support

The application includes Docker support with:
- Multi-stage builds for optimal image size
- Redis container with persistence
- Health checks for reliable operation
- Production-ready configuration

## Troubleshooting

### Redis Memory Warning
If you see a Redis memory warning, you may need to enable memory overcommit:
```bash
sudo sysctl vm.overcommit_memory=1
```

For permanent setting, add to `/etc/sysctl.conf`:
```
vm.overcommit_memory = 1
```
