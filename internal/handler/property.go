package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/Lacsw/rntly/internal/model"
	"github.com/Lacsw/rntly/internal/store"
)

type PropertyHandler struct {
	store *store.PropertyStore
}

func NewPropertyHandler(s *store.PropertyStore) *PropertyHandler {
	return &PropertyHandler{store: s}
}

func (h *PropertyHandler) List(w http.ResponseWriter, r *http.Request) {
	properties := h.store.GetAll()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(properties)
}

func (h *PropertyHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	property, err := h.store.GetByID(id)
	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "property not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(property)
}

func (h *PropertyHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Address    string  `json:"address"`
		Type       string  `json:"type"`
		Bedrooms   int     `json:"bedrooms"`
		RentAmount float64 `json:"rent_amount"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	property := model.Property{
		ID:         generateID(),
		Address:    input.Address,
		Type:       input.Type,
		Bedrooms:   input.Bedrooms,
		RentAmount: input.RentAmount,
		Status:     "vacant",
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}

	created := h.store.Create(property)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}

func (h *PropertyHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	existing, err := h.store.GetByID(id)
	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "property not found", http.StatusNotFound)
		return
	}

	var input struct {
		Address    string  `json:"address"`
		Type       string  `json:"type"`
		Bedrooms   int     `json:"bedrooms"`
		RentAmount float64 `json:"rent_amount"`
		Status     string  `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	existing.Address = input.Address
	existing.Type = input.Type
	existing.Bedrooms = input.Bedrooms
	existing.RentAmount = input.RentAmount
	existing.Status = input.Status
	existing.UpdatedAt = time.Now().UTC()

	updated, _ := h.store.Update(id, existing)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

func (h *PropertyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	err := h.store.Delete(id)
	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "property not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
