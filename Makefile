.PHONY: dev db-up db-down db-logs migrate

# Start the database container
db-up:
	@docker compose up -d db
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker compose exec -T db pg_isready -U rntly > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "PostgreSQL is ready!"

# Stop the database container
db-down:
	@docker compose down

# View database logs
db-logs:
	@docker compose logs -f db

# Run migrations
migrate: db-up
	@echo "Running migrations..."
	@for f in migrations/*.sql; do \
    	docker compose exec -T db psql -U rntly -d rntly < "$$f"; \
	done
	@echo "Migrations complete!"

# Run the dev server (starts DB if needed, runs migrations)
dev: migrate
	@go run cmd/api/main.go
