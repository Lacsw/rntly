package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/Lacsw/rntly/internal/response"
	"github.com/Lacsw/rntly/internal/service"
)

type LeaseHandler struct {
	service *service.LeaseService
}

func NewLeaseHandler(s *service.LeaseService) *LeaseHandler {
	return &LeaseHandler{service: s}
}

func (h *LeaseHandler) List(w http.ResponseWriter, r *http.Request) {
	leases, err := h.service.List(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch leases")
		return
	}

	response.JSON(w, http.StatusOK, leases)
}

func (h *LeaseHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	lease, err := h.service.GetByID(r.Context(), id)
	if errors.Is(err, service.ErrLeaseNotFound) {
		response.Error(w, http.StatusNotFound, "lease not found")
		return
	}
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch lease")
		return
	}

	response.JSON(w, http.StatusOK, lease)
}

func (h *LeaseHandler) GetByProperty(w http.ResponseWriter, r *http.Request) {
	propertyID := r.PathValue("propertyId")

	leases, err := h.service.GetByPropertyID(r.Context(), propertyID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch leases")
		return
	}

	response.JSON(w, http.StatusOK, leases)
}

func (h *LeaseHandler) GetByTenant(w http.ResponseWriter, r *http.Request) {
	tenantID := r.PathValue("tenantId")

	leases, err := h.service.GetByTenantID(r.Context(), tenantID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to fetch leases")
		return
	}

	response.JSON(w, http.StatusOK, leases)
}

func (h *LeaseHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		PropertyID string  `json:"property_id"`
		TenantID   string  `json:"tenant_id"`
		StartDate  string  `json:"start_date"`
		EndDate    string  `json:"end_date"`
		RentAmount float64 `json:"rent_amount"`
		Deposit    float64 `json:"deposit"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid start_date format, use YYYY-MM-DD")
		return
	}

	endDate, err := time.Parse("2006-01-02", input.EndDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid end_date format, use YYYY-MM-DD")
		return
	}

	lease, err := h.service.Create(r.Context(), input.PropertyID, input.TenantID, startDate, endDate, input.RentAmount, input.Deposit)
	if errors.Is(err, service.ErrPropertyNotVacant) {
		response.Error(w, http.StatusConflict, "property is not vacant")
		return
	}
	if errors.Is(err, service.ErrInvalidDateRange) {
		response.Error(w, http.StatusBadRequest, "end date must be after start date")
		return
	}
	if errors.Is(err, service.ErrInvalidInput) {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to create lease")
		return
	}

	response.JSON(w, http.StatusCreated, lease)
}

func (h *LeaseHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var input struct {
		StartDate  string  `json:"start_date"`
		EndDate    string  `json:"end_date"`
		RentAmount float64 `json:"rent_amount"`
		Deposit    float64 `json:"deposit"`
		Status     string  `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid start_date format, use YYYY-MM-DD")
		return
	}

	endDate, err := time.Parse("2006-01-02", input.EndDate)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid end_date format, use YYYY-MM-DD")
		return
	}

	lease, err := h.service.Update(r.Context(), id, startDate, endDate, input.RentAmount, input.Deposit, input.Status)
	if errors.Is(err, service.ErrLeaseNotFound) {
		response.Error(w, http.StatusNotFound, "lease not found")
		return
	}
	if errors.Is(err, service.ErrInvalidDateRange) {
		response.Error(w, http.StatusBadRequest, "end date must be after start date")
		return
	}
	if errors.Is(err, service.ErrInvalidInput) {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to update lease")
		return
	}

	response.JSON(w, http.StatusOK, lease)
}

func (h *LeaseHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	err := h.service.Delete(r.Context(), id)
	if errors.Is(err, service.ErrLeaseNotFound) {
		response.Error(w, http.StatusNotFound, "lease not found")
		return
	}
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "failed to delete lease")
		return
	}

	response.NoContent(w)
}
