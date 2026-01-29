.PHONY: help install migrate-up migrate-down migrate-create sqlc-generate openapi-generate run test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	go mod download
	go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
	go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

migrate-up: ## Run database migrations up
	migrate -path migrations -database "$${DATABASE_URL}" up

migrate-down: ## Run database migrations down
	migrate -path migrations -database "$${DATABASE_URL}" down

migrate-create: ## Create a new migration file (usage: make migrate-create NAME=migration_name)
	@if [ -z "$(NAME)" ]; then \
		echo "Error: NAME is required. Usage: make migrate-create NAME=migration_name"; \
		exit 1; \
	fi
	migrate create -ext sql -dir migrations -seq $(NAME)

sqlc-generate: ## Generate Go code from SQL queries using sqlc
	@if ! command -v sqlc >/dev/null 2>&1 && [ -f $(HOME)/go/bin/sqlc ]; then \
		$(HOME)/go/bin/sqlc generate; \
	elif command -v sqlc >/dev/null 2>&1; then \
		sqlc generate; \
	else \
		echo "Error: sqlc not found. Please run 'make install' first."; \
		exit 1; \
	fi

openapi-generate: ## Generate Go code from OpenAPI spec
	@if ! command -v oapi-codegen >/dev/null 2>&1 && [ -f $(HOME)/go/bin/oapi-codegen ]; then \
		$(HOME)/go/bin/oapi-codegen -generate types,server,spec -package openapi ../api-schema/generated/openapi.yaml > internal/adapter/http/generated/openapi/server.gen.go; \
	elif command -v oapi-codegen >/dev/null 2>&1; then \
		oapi-codegen -generate types,server,spec -package openapi ../api-schema/generated/openapi.yaml > internal/adapter/http/generated/openapi/server.gen.go; \
	else \
		echo "Error: oapi-codegen not found. Please run 'make install' first."; \
		exit 1; \
	fi

run: ## Run the application
	go run cmd/api/main.go

test: ## Run tests
	go test ./...

tidy: ## Run go mod tidy
	go mod tidy

