package main

import (
	"log"
	"net/http"

	"github.com/Lacsw/rntly/internal/handler"
	"github.com/Lacsw/rntly/internal/service"
	"github.com/Lacsw/rntly/internal/store"
)

func main() {
	// Initialize stores
	propertyStore := store.NewPropertyStore()
	tenantStore := store.NewTenantStore()

	// Initialize services
	propertyService := service.NewPropertyService(propertyStore)
	tenantService := service.NewTenantService(tenantStore)

	// Initialize handlers
	propertyHandler := handler.NewPropertyHandler(propertyService)
	tenantHandler := handler.NewTenantHandler(tenantService)

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

	// Tenants
	mux.HandleFunc("GET /tenants", tenantHandler.List)
	mux.HandleFunc("GET /tenants/{id}", tenantHandler.Get)
	mux.HandleFunc("POST /tenants", tenantHandler.Create)
	mux.HandleFunc("PUT /tenants/{id}", tenantHandler.Update)
	mux.HandleFunc("DELETE /tenants/{id}", tenantHandler.Delete)

	port := ":8080"
	log.Printf("🏠 rntly API starting on http://localhost%s", port)

	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatal(err)
	}
}
