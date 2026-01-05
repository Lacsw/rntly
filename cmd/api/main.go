package main

import (
	"log"
	"net/http"

	"github.com/Lacsw/rntly/internal/database"
	"github.com/Lacsw/rntly/internal/handler"
	"github.com/Lacsw/rntly/internal/service"
	"github.com/Lacsw/rntly/internal/store"
)

func main() {
	// Connect to database
	db := database.Connect()
	defer db.Close()

	// Initialize stores
	propertyStore := store.NewPropertyStore(db)
	tenantStore := store.NewTenantStore(db)
	leaseStore := store.NewLeaseStore(db)

	// Initialize services
	propertyService := service.NewPropertyService(propertyStore)
	tenantService := service.NewTenantService(tenantStore)
	leaseService := service.NewLeaseService(leaseStore, propertyStore, tenantStore)

	// Initialize handlers
	propertyHandler := handler.NewPropertyHandler(propertyService)
	tenantHandler := handler.NewTenantHandler(tenantService)
	leaseHandler := handler.NewLeaseHandler(leaseService)

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

	// Leases
	mux.HandleFunc("GET /leases", leaseHandler.List)
	mux.HandleFunc("GET /leases/{id}", leaseHandler.Get)
	mux.HandleFunc("POST /leases", leaseHandler.Create)
	mux.HandleFunc("PUT /leases/{id}", leaseHandler.Update)
	mux.HandleFunc("DELETE /leases/{id}", leaseHandler.Delete)
	mux.HandleFunc("GET /properties/{propertyId}/leases", leaseHandler.GetByProperty)
	mux.HandleFunc("GET /tenants/{tenantId}/leases", leaseHandler.GetByTenant)

	port := ":8080"
	log.Printf("🏠 rntly API starting on http://localhost%s", port)

	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatal(err)
	}
}
