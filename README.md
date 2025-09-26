# Acquisitions App - Dockerized with Neon Database

A Node.js application with Express.js, Drizzle ORM, and Neon Database integration. This setup supports both development (with Neon Local) and production (with Neon Cloud) environments.

## 🏗️ Architecture Overview

- **Development**: Uses Neon Local proxy for ephemeral database branches
- **Production**: Connects directly to Neon Cloud database
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Runtime**: Node.js 20 with Express.js

## 📋 Prerequisites

- Docker and Docker Compose installed
- Neon account and project set up at [console.neon.tech](https://console.neon.tech)
- Git (for branch-specific development branches)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd acquisitions
```

### 2. Get Neon Credentials

Visit the [Neon Console](https://console.neon.tech) and collect:

- **NEON_API_KEY**: From Account Settings → API Keys
- **NEON_PROJECT_ID**: From Project Settings → General
- **PARENT_BRANCH_ID**: Your main branch ID (usually `main` or `br-xxx-xxx`)
- **DATABASE_URL**: Your production connection string

### 3. Configure Environment Files

#### Development Environment (.env.development)
```bash
# Copy and update with your actual values
cp .env.development.example .env.development
```

Update `.env.development` with:
```env
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=your_parent_branch_id_here
ARCJET_KEY=your_arcjet_key_here
```

#### Production Environment (.env.production)
```bash
# Copy and update with your actual values
cp .env.production.example .env.production
```

Update `.env.production` with your actual Neon Cloud URL:
```env
DATABASE_URL=postgres://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🛠️ Development Setup

### Start Development Environment

```bash
# Start with Neon Local (ephemeral branches)
docker-compose -f docker-compose.dev.yml --env-file .env.development up --build

# Or run in background
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d --build
```

### Development Features

- **🔄 Hot Reloading**: Source code changes automatically restart the server
- **🌿 Ephemeral Branches**: Fresh database branch created on each container start
- **🔍 Local Database**: Connect to `localhost:5432` for database inspection
- **📝 Detailed Logging**: Full database query logging enabled

### Access Development Application

- **App**: http://localhost:3000
- **Database**: `postgres://neon:npg@localhost:5432/neondb?sslmode=require`
- **Logs**: `docker-compose -f docker-compose.dev.yml logs -f app`

### Development Commands

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Run database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Access database studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio

# Stop and cleanup
docker-compose -f docker-compose.dev.yml down -v
```

## 🚀 Production Deployment

### Deploy to Production

```bash
# Build and deploy production version
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Production Features

- **🔒 Security Hardened**: Read-only filesystem, dropped capabilities
- **⚡ Optimized Performance**: Production Node.js optimizations
- **📊 Resource Limits**: CPU and memory constraints
- **🔄 Auto-Restart**: Automatic restart on failures
- **📝 Log Rotation**: Managed log sizes

### Production Commands

```bash
# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale application (if needed)
docker-compose -f docker-compose.prod.yml up --scale app=3 -d

# Health check
curl http://localhost:3000/health

# Stop production
docker-compose -f docker-compose.prod.yml down
```

## 🔧 Configuration Details

### Environment Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `NODE_ENV` | development | production | Runtime environment |
| `DATABASE_URL` | Neon Local | Neon Cloud | Database connection string |
| `NEON_API_KEY` | Required | - | Neon API key for Local |
| `NEON_PROJECT_ID` | Required | - | Neon project ID |
| `PARENT_BRANCH_ID` | Required | - | Parent branch for ephemeral branches |
| `PORT` | 3000 | 3000 | Application port |
| `LOG_LEVEL` | debug | info | Logging verbosity |

### Database Connections

#### Development (Neon Local)
- **Connection**: `postgres://neon:npg@neon-local:5432/neondb?sslmode=require`
- **Features**: Ephemeral branches, automatic cleanup
- **SSL**: Self-signed certificates (handled automatically)

#### Production (Neon Cloud)
- **Connection**: Your actual Neon Cloud URL
- **Features**: Serverless scaling, connection pooling
- **SSL**: Full SSL/TLS encryption

## 🔍 Troubleshooting

### Common Issues

#### 1. Neon Local Connection Issues
```bash
# Check Neon Local container health
docker-compose -f docker-compose.dev.yml ps

# View Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Restart Neon Local
docker-compose -f docker-compose.dev.yml restart neon-local
```

#### 2. Database Migration Issues
```bash
# Run migrations manually
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate new migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate
```

#### 3. Port Conflicts
```bash
# Change ports in docker-compose files
# Development: Change "3000:3000" to "3001:3000"
# Database: Change "5432:5432" to "5433:5432"
```

#### 4. Environment Variable Issues
```bash
# Verify environment loading
docker-compose -f docker-compose.dev.yml exec app env | grep DATABASE_URL

# Test database connection
docker-compose -f docker-compose.dev.yml exec app node -e "
const { testConnection } = require('./src/config/database.js');
testConnection();
"
```

### Health Checks

#### Application Health
```bash
curl http://localhost:3000/health
```

#### Database Health
```bash
# Development
docker-compose -f docker-compose.dev.yml exec neon-local nc -z localhost 5432

# Production - test from app container
docker-compose -f docker-compose.prod.yml exec app node -e "
const { sql } = require('./src/config/database.js');
sql\`SELECT 1\`.then(r => console.log('DB OK:', r));
"
```

## 📁 Project Structure

```
acquisitions/
├── src/                          # Application source code
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/             # Route controllers
│   ├── models/                  # Drizzle models
│   ├── routes/                  # Express routes
│   └── index.js                 # Application entry point
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.dev.yml       # Development with Neon Local
├── docker-compose.prod.yml      # Production with Neon Cloud
├── .env.development            # Development environment vars
├── .env.production             # Production environment vars
├── .dockerignore               # Docker build exclusions
├── drizzle.config.js           # Database migration config
└── package.json                # Node.js dependencies
```

## 🔐 Security Considerations

### Development
- Self-signed certificates for Neon Local (automatically handled)
- Ephemeral branches are automatically deleted
- Local network isolation

### Production
- Full SSL/TLS encryption to Neon Cloud
- Read-only container filesystem
- Dropped Linux capabilities
- Resource limits and health checks
- No hardcoded secrets (environment variables only)

## 📚 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Console](https://console.neon.tech)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Docker Compose Documentation](https://docs.docker.com/compose)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Start development environment: `docker-compose -f docker-compose.dev.yml up`
4. Make changes and test locally
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a Pull Request

## 📄 License

This project is licensed under the ISC License - see the package.json file for details.