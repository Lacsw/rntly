package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func Connect() *pgxpool.Pool {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment")
	}

	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	pool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = pool.Ping(context.Background())
	if err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("✅ Connected to database")
	return pool
}
