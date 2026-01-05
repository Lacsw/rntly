package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Lacsw/rntly/internal/model"
	"github.com/Lacsw/rntly/internal/store"
)

var (
	ErrLeaseNotFound     = errors.New("lease not found")
	ErrPropertyNotVacant = errors.New("property is not vacant")
	ErrInvalidDateRange  = errors.New("end date must be after start date")
)

type LeaseService struct {
	leaseStore    *store.LeaseStore
	propertyStore *store.PropertyStore
	tenantStore   *store.TenantStore
}

func NewLeaseService(ls *store.LeaseStore, ps *store.PropertyStore, ts *store.TenantStore) *LeaseService {
	return &LeaseService{
		leaseStore:    ls,
		propertyStore: ps,
		tenantStore:   ts,
	}
}

func (s *LeaseService) List(ctx context.Context) ([]model.Lease, error) {
	return s.leaseStore.GetAll(ctx)
}

func (s *LeaseService) GetByID(ctx context.Context, id string) (model.Lease, error) {
	lease, err := s.leaseStore.GetByID(ctx, id)
	if errors.Is(err, store.ErrNotFound) {
		return model.Lease{}, ErrLeaseNotFound
	}
	return lease, err
}

func (s *LeaseService) GetByPropertyID(ctx context.Context, propertyID string) ([]model.Lease, error) {
	return s.leaseStore.GetByPropertyID(ctx, propertyID)
}

func (s *LeaseService) GetByTenantID(ctx context.Context, tenantID string) ([]model.Lease, error) {
	return s.leaseStore.GetByTenantID(ctx, tenantID)
}

func (s *LeaseService) Create(ctx context.Context, propertyID, tenantID string, startDate, endDate time.Time, rentAmount, deposit float64) (model.Lease, error) {
	// Validate property exists
	property, err := s.propertyStore.GetByID(ctx, propertyID)
	if errors.Is(err, store.ErrNotFound) {
		return model.Lease{}, fmt.Errorf("%w: property not found", ErrInvalidInput)
	}
	if err != nil {
		return model.Lease{}, err
	}

	// Validate property is vacant
	if property.Status != "vacant" {
		return model.Lease{}, ErrPropertyNotVacant
	}

	// Validate tenant exists
	_, err = s.tenantStore.GetByID(ctx, tenantID)
	if errors.Is(err, store.ErrNotFound) {
		return model.Lease{}, fmt.Errorf("%w: tenant not found", ErrInvalidInput)
	}
	if err != nil {
		return model.Lease{}, err
	}

	// Validate dates
	if endDate.Before(startDate) || endDate.Equal(startDate) {
		return model.Lease{}, ErrInvalidDateRange
	}

	// Validate amounts
	if rentAmount <= 0 {
		return model.Lease{}, fmt.Errorf("%w: rent amount must be positive", ErrInvalidInput)
	}
	if deposit < 0 {
		return model.Lease{}, fmt.Errorf("%w: deposit cannot be negative", ErrInvalidInput)
	}

	lease := model.Lease{
		ID:         generateID(),
		PropertyID: propertyID,
		TenantID:   tenantID,
		StartDate:  startDate,
		EndDate:    endDate,
		RentAmount: rentAmount,
		Deposit:    deposit,
		Status:     "active",
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}

	created, err := s.leaseStore.Create(ctx, lease)
	if err != nil {
		return model.Lease{}, err
	}

	// Update property status to occupied
	property.Status = "occupied"
	property.UpdatedAt = time.Now().UTC()
	s.propertyStore.Update(ctx, property)

	return created, nil
}

func (s *LeaseService) Update(ctx context.Context, id string, startDate, endDate time.Time, rentAmount, deposit float64, status string) (model.Lease, error) {
	existing, err := s.leaseStore.GetByID(ctx, id)
	if errors.Is(err, store.ErrNotFound) {
		return model.Lease{}, ErrLeaseNotFound
	}
	if err != nil {
		return model.Lease{}, err
	}

	// Validate dates
	if endDate.Before(startDate) || endDate.Equal(startDate) {
		return model.Lease{}, ErrInvalidDateRange
	}

	// Validate status
	if !isValidLeaseStatus(status) {
		return model.Lease{}, fmt.Errorf("%w: status must be 'active', 'ended', or 'upcoming'", ErrInvalidInput)
	}

	// Validate amounts
	if rentAmount <= 0 {
		return model.Lease{}, fmt.Errorf("%w: rent amount must be positive", ErrInvalidInput)
	}
	if deposit < 0 {
		return model.Lease{}, fmt.Errorf("%w: deposit cannot be negative", ErrInvalidInput)
	}

	// If lease is ended, set property back to vacant
	if status == "ended" && existing.Status != "ended" {
		property, err := s.propertyStore.GetByID(ctx, existing.PropertyID)
		if err == nil {
			property.Status = "vacant"
			property.UpdatedAt = time.Now().UTC()
			s.propertyStore.Update(ctx, property)
		}
	}

	existing.StartDate = startDate
	existing.EndDate = endDate
	existing.RentAmount = rentAmount
	existing.Deposit = deposit
	existing.Status = status
	existing.UpdatedAt = time.Now().UTC()

	return s.leaseStore.Update(ctx, existing)
}

func (s *LeaseService) Delete(ctx context.Context, id string) error {
	// Get lease first to update property status
	lease, err := s.leaseStore.GetByID(ctx, id)
	if errors.Is(err, store.ErrNotFound) {
		return ErrLeaseNotFound
	}
	if err != nil {
		return err
	}

	// Set property back to vacant
	if lease.Status == "active" {
		property, err := s.propertyStore.GetByID(ctx, lease.PropertyID)
		if err == nil {
			property.Status = "vacant"
			property.UpdatedAt = time.Now().UTC()
			s.propertyStore.Update(ctx, property)
		}
	}

	return s.leaseStore.Delete(ctx, id)
}

func isValidLeaseStatus(status string) bool {
	return status == "active" || status == "ended" || status == "upcoming"
}
