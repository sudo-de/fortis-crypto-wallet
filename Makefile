# Crypto Wallet Makefile

.PHONY: all build clean install deps dev test help

# Default target
all: deps build

# Install dependencies
deps:
	@echo "📦 Installing dependencies..."
	@./scripts/install-deps.sh

# Build the project
build:
	@echo "🔨 Building project..."
	@./scripts/build.sh

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf backend/build/
	@rm -rf frontend/dist/
	@rm -rf frontend/node_modules/
	@rm -rf node_modules/

# Install the application
install: build
	@echo "📦 Installing application..."
	@cd backend/build && sudo make install

# Start development environment
dev:
	@echo "🚀 Starting development environment..."
	@./scripts/dev.sh

# Run tests
test:
	@echo "🧪 Running tests..."
	@cd backend/build && make test
	@cd frontend && npm test

# Show help
help:
	@echo "Crypto Wallet - Available commands:"
	@echo ""
	@echo "  make deps     - Install all dependencies"
	@echo "  make build    - Build the project"
	@echo "  make clean    - Clean build artifacts"
	@echo "  make install  - Install the application"
	@echo "  make dev      - Start development environment"
	@echo "  make test     - Run tests"
	@echo "  make help     - Show this help message"
	@echo ""
	@echo "Quick start:"
	@echo "  make deps && make build && make dev"
