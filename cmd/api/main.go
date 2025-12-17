package main

import (
	"log"
	"net/http"

	"github.com/Lacsw/rntly/internal/handler"
	"github.com/Lacsw/rntly/internal/service"
	"github.com/Lacsw/rntly/internal/store"
)

func main() {
	// Initialize layers: store → service → handler
	propertyStore := store.NewPropertyStore()
	propertyService := service.NewPropertyService(propertyStore)
	propertyHandler := handler.NewPropertyHandler(propertyService)

	// Setup router
	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("GET /health", handler.Health)

	// Properties
	mux.HandleFunc("GET /properties", propertyHandler.List)
	mux.HandleFunc("GET /properties/{id}", propertyHandler.Get)
	mux.HandleFunc("POST /properties", propertyHandler.Create)
	mux.HandleFunc("PUT /properties/{id}", propertyHandler.Update)
	mux.HandleFunc("DELETE /properties/{id}", propertyHandler.Delete)

	port := ":8080"
	log.Printf("🏠 rntly API starting on http://localhost%s", port)

	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatal(err)
	}
}
