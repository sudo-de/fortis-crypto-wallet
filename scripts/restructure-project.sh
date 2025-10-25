#!/bin/bash

# 🏗️ XCryptoVault Project Restructuring Script
# This script helps migrate from the current structure to the improved structure

set -e

echo "🚀 Starting XCryptoVault Project Restructuring..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Create backup
print_status "Creating backup of current structure..."
if [ ! -d "backup-$(date +%Y%m%d-%H%M%S)" ]; then
    cp -r . "../xcryptovault-backup-$(date +%Y%m%d-%H%M%S)"
    print_success "Backup created"
fi

# Create new directory structure
print_status "Creating new directory structure..."

# Apps directory
mkdir -p apps/web/src/{components/{admin,common,trading,wallet},pages/{admin,trading,wallet},hooks,services,utils,types,constants}
mkdir -p apps/api/src/{controllers,services,models,middleware,utils,config}
mkdir -p apps/api/include
mkdir -p apps/api/tests

# Packages directory
mkdir -p packages/crypto/{src/{bitcoin,ethereum,common,types},include}
mkdir -p packages/database/{src/{postgresql,sqlite,migrations,models},include}
mkdir -p packages/trading/{src/{engine,matching,risk,analytics},include}
mkdir -p packages/admin/{src/{permissions,audit,compliance,incidents},include}
mkdir -p packages/shared/{types,utils,constants}

# Infrastructure directory
mkdir -p infrastructure/{docker,k8s/{base,overlays/{dev,staging,prod}},terraform/{modules,environments},monitoring/{prometheus,grafana,jaeger}}

# Tools directory
mkdir -p tools/{scripts,generators/{api-generator,component-generator},cli}

# Documentation directory
mkdir -p docs/{api,architecture,user-guides,deployment}

# Configuration directory
mkdir -p config/{environments,database/{migrations,seeds},security/{ssl,certificates}}

# Test directory
mkdir -p tests/{unit,integration,e2e,performance}

# GitHub workflows
mkdir -p .github/{workflows,templates}

# VS Code configuration
mkdir -p .vscode

print_success "Directory structure created"

# Move existing code
print_status "Moving existing code to new structure..."

# Move frontend
if [ -d "frontend" ]; then
    print_status "Moving frontend to apps/web..."
    cp -r frontend/* apps/web/
    print_success "Frontend moved to apps/web"
fi

# Move backend
if [ -d "backend" ]; then
    print_status "Moving backend to apps/api..."
    cp -r backend/* apps/api/
    print_success "Backend moved to apps/api"
fi

# Move Python bridge to shared packages
if [ -d "python_bridge" ]; then
    print_status "Moving Python bridge to packages/shared..."
    cp -r python_bridge/* packages/shared/
    print_success "Python bridge moved to packages/shared"
fi

# Move scripts
if [ -d "scripts" ]; then
    print_status "Moving scripts to tools/scripts..."
    cp -r scripts/* tools/scripts/
    print_success "Scripts moved to tools/scripts"
fi

# Move documentation
if [ -d "docs" ]; then
    print_status "Moving documentation..."
    cp -r docs/* docs/
    print_success "Documentation moved"
fi

# Move configuration
if [ -d "config" ]; then
    print_status "Moving configuration..."
    cp -r config/* config/
    print_success "Configuration moved"
fi

# Create new configuration files
print_status "Creating new configuration files..."

# Root package.json for workspace
cat > package.json << 'EOF'
{
  "name": "xcryptovault",
  "version": "1.0.0",
  "description": "Cryptocurrency Wallet & Trading Platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "dev:api": "cd apps/api && make dev",
    "dev:web": "cd apps/web && npm run dev",
    "build": "npm run build:api && npm run build:web",
    "build:api": "cd apps/api && make build",
    "build:web": "cd apps/web && npm run build",
    "test": "npm run test:api && npm run test:web",
    "test:api": "cd apps/api && make test",
    "test:web": "cd apps/web && npm run test",
    "lint": "npm run lint:web",
    "lint:web": "cd apps/web && npm run lint",
    "format": "prettier --write .",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "prettier": "^3.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
EOF

# PNPM workspace configuration
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Root Makefile
cat > Makefile << 'EOF'
.PHONY: help dev build test clean docker

help: ## Show this help message
	@echo "XCryptoVault - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	@echo "Starting development environment..."
	@npm run dev

build: ## Build all applications
	@echo "Building all applications..."
	@npm run build

test: ## Run all tests
	@echo "Running all tests..."
	@npm run test

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	@cd apps/api && make clean
	@cd apps/web && rm -rf dist node_modules/.vite

docker: ## Build and run with Docker
	@echo "Building and running with Docker..."
	@docker-compose up --build

setup: ## Setup development environment
	@echo "Setting up development environment..."
	@./scripts/setup-dev.sh

install: ## Install all dependencies
	@echo "Installing dependencies..."
	@npm install
	@cd apps/web && npm install
	@cd apps/api && make deps
EOF

# Docker Compose for development
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: crypto_wallet
      POSTGRES_USER: wallet_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/database/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://wallet_user:secure_password@postgres:5432/crypto_wallet
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8080
    depends_on:
      - api

volumes:
  postgres_data:
EOF

# VS Code configuration
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.h": "cpp",
    "*.hpp": "cpp"
  },
  "C_Cpp.default.configurationProvider": "ms-vscode.cmake-tools",
  "C_Cpp.default.cppStandard": "c++17"
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "ms-vscode.cpptools",
    "ms-vscode.cmake-tools",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
EOF

# GitHub Actions CI/CD
cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build API
      run: cd apps/api && make build
    
    - name: Build Web
      run: cd apps/web && npm run build
    
    - name: Run tests
      run: npm run test
    
    - name: Run linting
      run: npm run lint
EOF

# Environment configuration
cat > .env.example << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://wallet_user:secure_password@localhost:5432/crypto_wallet
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=8080
API_HOST=localhost

# Web Configuration
VITE_API_URL=http://localhost:8080

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# Environment
NODE_ENV=development
EOF

# Update .gitignore
cat >> .gitignore << 'EOF'

# Build artifacts
apps/*/build/
apps/*/dist/
apps/*/node_modules/

# Environment files
.env
.env.local
.env.production

# IDE files
.vscode/settings.json
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
EOF

print_success "Configuration files created"

# Create setup script
cat > scripts/setup-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Setting up XCryptoVault development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 14+ first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd apps/web && npm install && cd ../..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd apps/api && make deps && cd ../..

# Setup database
echo "🗄️ Setting up database..."
./scripts/setup-postgresql.sh

# Copy environment file
echo "⚙️ Setting up environment..."
cp .env.example .env

echo "✅ Development environment setup complete!"
echo "🚀 Run 'make dev' to start the development environment"
EOF

chmod +x scripts/setup-dev.sh

print_success "Setup script created"

# Create README for new structure
cat > README.md << 'EOF'
# 🛡️ XCryptoVault - Cryptocurrency Wallet & Trading Platform

A comprehensive cryptocurrency wallet and trading platform with a modern, scalable architecture.

## 🏗️ Project Structure

This project follows a monorepo structure with clear separation of concerns:

```
xcryptovault/
├── 📁 apps/                    # Applications
│   ├── 📁 web/                # Frontend (React + TypeScript)
│   └── 📁 api/                # Backend (C++ API)
├── 📁 packages/               # Shared packages
│   ├── 📁 crypto/            # Cryptographic utilities
│   ├── 📁 database/           # Database layer
│   ├── 📁 trading/            # Trading engine
│   ├── 📁 admin/              # Admin system
│   └── 📁 shared/             # Shared utilities
├── 📁 infrastructure/         # Infrastructure & DevOps
├── 📁 tools/                  # Development tools
├── 📁 docs/                   # Documentation
└── 📁 config/                 # Configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- C++ compiler (GCC/Clang)
- CMake 3.16+

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd xcryptovault

# Setup development environment
make setup

# Start development servers
make dev
```

### Available Commands
```bash
make help          # Show all available commands
make dev           # Start development environment
make build         # Build all applications
make test          # Run all tests
make docker        # Run with Docker
make clean         # Clean build artifacts
```

## 🏗️ Architecture

### Frontend (apps/web)
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Role-based admin interface**

### Backend (apps/api)
- **C++17** for high performance
- **PostgreSQL** for data persistence
- **Redis** for caching
- **RESTful API** design

### Shared Packages
- **crypto**: Cryptographic utilities
- **database**: Database abstraction layer
- **trading**: Trading engine components
- **admin**: Admin system components
- **shared**: Common utilities and types

## 🔧 Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes in appropriate app/package
3. Add tests for new functionality
4. Update documentation
5. Create pull request

### Code Organization
- **apps/**: Application-specific code
- **packages/**: Reusable, shared code
- **infrastructure/**: DevOps and deployment
- **tools/**: Development and build tools

## 📚 Documentation

- [API Documentation](docs/api/)
- [Architecture Guide](docs/architecture/)
- [User Guides](docs/user-guides/)
- [Deployment Guide](docs/deployment/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
EOF

print_success "README updated"

# Final steps
print_status "Performing final cleanup..."

# Remove old directories (with confirmation)
print_warning "The following directories will be removed:"
echo "  - frontend/"
echo "  - backend/"
echo "  - python_bridge/"
echo "  - scripts/ (old)"
echo "  - docs/ (old)"
echo "  - config/ (old)"

read -p "Do you want to remove the old directories? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf frontend backend python_bridge scripts docs config
    print_success "Old directories removed"
else
    print_warning "Old directories kept for reference"
fi

print_success "🎉 Project restructuring complete!"
print_status "Next steps:"
echo "  1. Run 'make setup' to setup the development environment"
echo "  2. Run 'make dev' to start the development servers"
echo "  3. Update your IDE settings to use the new structure"
echo "  4. Review the new documentation in docs/"

print_success "Happy coding! 🚀"
