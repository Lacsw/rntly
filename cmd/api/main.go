package main

import (
	"log"
	"net/http"

	"github.com/Lacsw/rntly/internal/handler"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handler.Health)

	port := ":8080"
	log.Printf("🏠 rntly API starting on http://localhost%s", port)

	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatal(err)
	}

}
