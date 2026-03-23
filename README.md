# 🏠 rntly

Rental property management system — Go REST API + React frontend.

Track properties, tenants, and lease agreements in one place.

## Tech Stack

**Backend:** Go · PostgreSQL · pgx  
**Frontend:** React · TypeScript · Tailwind CSS · Vite

## Features

- Properties CRUD with vacancy tracking
- Tenant management
- Lease agreements linking tenants to properties
- Auto-updates property status when leases are created or ended

## Getting Started

```bash
# Start the database
docker compose up -d

# Run the API
go run ./cmd/api

# Run the frontend
cd web && npm install && npm run dev
```
