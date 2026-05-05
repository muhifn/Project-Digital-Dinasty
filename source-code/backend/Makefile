.PHONY: dev build run clean migrate-up migrate-down seed test test-smoke

# Load .env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Binary name
BINARY=planet-motor-bmw-api

## dev: Run the server with hot reload (requires air, falls back to go run)
dev:
	@which air > /dev/null 2>&1 && air || go run ./cmd/server

## build: Build the production binary
build:
	CGO_ENABLED=0 go build -ldflags="-s -w" -o $(BINARY) ./cmd/server

## run: Run the production binary
run: build
	./$(BINARY)

## clean: Remove built binary
clean:
	rm -f $(BINARY)

## migrate-up: Run all pending migrations
migrate-up:
	@go run -tags migrate ./cmd/migrate up

## migrate-down: Rollback the last migration
migrate-down:
	@go run -tags migrate ./cmd/migrate down

## seed: Seed the database with initial data
seed:
	go run ./cmd/seed

## test: Run all tests
test:
	go test ./... -v -count=1

## test-smoke: Run API smoke test script
test-smoke:
	./scripts/smoke-test.sh

## help: Show this help message
help:
	@echo "Available targets:"
	@sed -n 's/^##//p' Makefile | column -t -s ':' | sed -e 's/^/ /'
