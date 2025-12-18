package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/Lacsw/rntly/internal/response"
	"github.com/Lacsw/rntly/internal/service"
)

type PropertyHandler struct {
	service *service.PropertyService
}

func NewPropertyHandler(s *service.PropertyService) *PropertyHandler {
	return &PropertyHandler{service: s}
}

func (h *PropertyHandler) List(w http.ResponseWriter, r *http.Request) {
	properties, err := h.service.List(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch properties")
		return
	}

	response.JSON(w, http.StatusOK, properties)
}

func (h *PropertyHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	property, err := h.service.GetByID(r.Context(), id)
	if errors.Is(err, service.ErrPropertyNotFound) {
		response.Error(w, http.StatusNotFound, "property not found")
		return
	}
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch property")
		return
	}

	response.JSON(w, http.StatusOK, property)
}

func (h *PropertyHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Address    string  `json:"address"`
		Type       string  `json:"type"`
		Bedrooms   int     `json:"bedrooms"`
		RentAmount float64 `json:"rent_amount"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	property, err := h.service.Create(r.Context(), input.Address, input.Type, input.Bedrooms, input.RentAmount)
	if errors.Is(err, service.ErrInvalidInput) {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create property")
		return
	}

	response.JSON(w, http.StatusCreated, property)
}

func (h *PropertyHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var input struct {
		Address    string  `json:"address"`
		Type       string  `json:"type"`
		Bedrooms   int     `json:"bedrooms"`
		RentAmount float64 `json:"rent_amount"`
		Status     string  `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	property, err := h.service.Update(r.Context(), id, input.Address, input.Type, input.Bedrooms, input.RentAmount, input.Status)
	if errors.Is(err, service.ErrPropertyNotFound) {
		response.Error(w, http.StatusNotFound, "property not found")
		return
	}
	if errors.Is(err, service.ErrInvalidInput) {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update property")
		return
	}

	response.JSON(w, http.StatusOK, property)
}

func (h *PropertyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	err := h.service.Delete(r.Context(), id)
	if errors.Is(err, service.ErrPropertyNotFound) {
		response.Error(w, http.StatusNotFound, "property not found")
		return
	}
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to delete property")
		return
	}

	response.NoContent(w)
}
