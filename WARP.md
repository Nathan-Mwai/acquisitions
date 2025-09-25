# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Backend API built with Express (ES Modules) using Helmet, CORS, Morgan, and cookie-parser
- Persistence via Drizzle ORM targeting PostgreSQL (Neon serverless driver)
- Validation with Zod; logging with Winston (files under logs/ and pretty console output in non-production)
- Auth flow scaffolded (sign-up implemented) with JWT issued as an httpOnly cookie
- ESM path aliases configured via package.json imports (e.g., #config/*, #routes/*, etc.)

Common commands
Use npm (package-lock.json present).
- Install deps
  - npm ci  # reproducible install if lockfile is in sync
  - npm install  # typical local install
- Run in dev (auto-reload)
  - npm run dev  # node --watch src/index.js
- Lint / format
  - npm run lint
  - npm run lint:fix
  - npm run format
  - npm run format:check
- Database (Drizzle Kit)
  - npm run db:generate  # generate SQL migrations from models
  - npm run db:migrate   # apply migrations
  - npm run db:studio    # local Drizzle Studio

Environment
The app expects these variables; set them in your shell session or a .env file (dotenv is loaded in src/index.js):
- DATABASE_URL: Postgres connection string (Neon or compatible)
- JWT_SECRET: secret for signing JWTs
- LOG_LEVEL: winston log level (default: info)
- NODE_ENV: development | production
- PORT: server port (default: 3000)

PowerShell (Windows) examples for a single session:
- $env:DATABASE_URL = "{{DATABASE_URL}}"
- $env:JWT_SECRET = "{{JWT_SECRET}}"
- $env:LOG_LEVEL = "info"
- $env:NODE_ENV = "development"
- $env:PORT = "3000"

High-level architecture
- Entry/runtime
  - src/index.js loads dotenv and bootstraps the HTTP server via src/server.js
  - src/server.js starts Express on process.env.PORT || 3000
- HTTP application
  - src/app.js wires middleware (helmet, cors, json/urlencoded, cookie-parser), request logging (morgan -> winston), health checks (/health), a root message (/), and API routes under /api
  - Routes currently include /api/auth (src/routes/auth.routes.js) with POST /sign-up implemented
- Modular structure (via ESM import aliases from package.json)
  - #config: environment-bound modules (database.js initializes Drizzle with Neon; logger.js configures Winston)
  - #models: Drizzle table schemas (e.g., users)
  - #services: business logic that talks to the DB (e.g., auth.service.createUser)
  - #controllers: request/response orchestration (e.g., auth.controller.signup)
  - #routes: express.Router assemblies mapping endpoints to controllers
  - #validations: zod schemas (e.g., signupSchema) used by controllers
  - #utils: helpers (JWT sign/verify, cookie helpers, error formatting)
- Persistence and migrations
  - Drizzle configuration: drizzle.config.js (schema at src/models/*.js, migrations emitted to ./drizzle)
  - Migration workflow: update models -> npm run db:generate -> review SQL under drizzle/ -> npm run db:migrate
- Logging
  - Winston writes to logs/error.log and logs/combined.log; console transport enabled when NODE_ENV !== 'production'

API surface (current)
- GET /            -> sanity message
- GET /health      -> uptime/status JSON
- GET /api         -> API heartbeat JSON
- POST /api/auth/sign-up -> validates payload (zod), creates user, issues JWT cookie

Testing
- No test runner is configured in package.json. ESLint is set up to recognize test globals under tests/**, but there are no npm test scripts.

Conventions and noteworthy implementation details
- ESM and Node “imports” field are used for path aliasing with # prefixes; import like import logger from '#config/logger.js'
- JWTs are issued with a 1d expiry and stored in an httpOnly cookie via utils/cookies.js
- Users model lives in src/models/user.model.js; drizzle-kit uses that for migration generation
- Request logging: morgan in “combined” format sends to Winston’s info level via a custom stream
