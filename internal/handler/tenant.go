package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/Lacsw/rntly/internal/response"
	"github.com/Lacsw/rntly/internal/service"
)

type TenantHandler struct {
	service *service.TenantService
}

func NewTenantHandler(s *service.TenantService) *TenantHandler {
	return &TenantHandler{service: s}
}

func (h *TenantHandler) List(w http.ResponseWriter, r *http.Request) {
	tenants := h.service.List()
	response.JSON(w, http.StatusOK, tenants)
}

func (h *TenantHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	tenant, err := h.service.GetByID(id)
	if errors.Is(err, service.ErrTenantNotFound) {
		response.Error(w, http.StatusNotFound, "tenant not found")
		return
	}

	response.JSON(w, http.StatusOK, tenant)
}

func (h *TenantHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	tenant, err := h.service.Create(input.FirstName, input.LastName, input.Email, input.Phone)
	if errors.Is(err, service.ErrInvalidInput) {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, tenant)
}

func (h *TenantHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var input struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Phone     string `json:"phone"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	tenant, err := h.service.Update(id, input.FirstName, input.LastName, input.Email, input.Phone)
	if errors.Is(err, service.ErrTenantNotFound) {
		response.Error(w, http.StatusNotFound, "tenant not found")
		return
	}
	if errors.Is(err, service.ErrInvalidInput) {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, tenant)
}

func (h *TenantHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	err := h.service.Delete(id)
	if errors.Is(err, service.ErrTenantNotFound) {
		response.Error(w, http.StatusNotFound, "tenant not found")
		return
	}

	response.NoContent(w)
}
