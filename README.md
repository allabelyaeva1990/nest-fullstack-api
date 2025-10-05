# NestJS Fullstack API

[![Tests](https://github.com/allabelyaeva1990/nest-fullstack-api/actions/workflows/test.yml/badge.svg)](https://github.com/ВАШ_USERNAME/nest-fullstack-api/actions/workflows/test.yml)

## Production

https://nest-fullstack-api-production.up.railway.app

## Tech Stack

- NestJS
- TypeORM
- PostgreSQL
- Docker
- Railway (production)
- GitHub Actions (CI/CD)

## Local Development

\`\`\`bash
# Start with Docker
docker-compose up

# Apply migrations
docker exec nest-app npm run migration:run

# Tests
npm run test
\`\`\`

## API Endpoints

- POST /auth/signup - Register
- POST /auth/signin - Login
- POST /auth/refresh - Refresh token
- GET /users/me - Get profile
- GET /tasks - Get tasks
- POST /tasks - Create task
- PATCH /tasks/:id - Update task
- DELETE /tasks/:id - Soft delete task