# Build stage
FROM golang:1.25.5-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

# Set working directory
WORKDIR /app

# Copy go mod files (go.sum may not exist, so copy it conditionally)
COPY backend/go.mod ./
COPY backend/go.sum* ./
RUN go mod download

# Install tools for code generation
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest && \
    go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest

# Copy backend source code
COPY backend/ ./

# Copy api-schema for OpenAPI code generation
COPY api-schema/generated/openapi.yaml /tmp/openapi.yaml

# Generate code (sqlc and openapi)
# Create directory for generated files
RUN mkdir -p internal/adapter/gateway/db/sqlc/generated && \
    mkdir -p internal/adapter/http/generated/openapi

# Generate sqlc code
RUN sqlc generate

# Generate OpenAPI code
RUN oapi-codegen -generate types,server,spec -package openapi /tmp/openapi.yaml > internal/adapter/http/generated/openapi/server.gen.go

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/api ./cmd/api/main.go

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/api .

# Copy migrations
COPY --from=builder /app/migrations ./migrations

# Expose port
EXPOSE 8080

# Run the application
CMD ["./api"]
