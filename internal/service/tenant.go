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
	ErrTenantNotFound = errors.New("tenant not found")
)

type TenantService struct {
	store *store.TenantStore
}

func NewTenantService(s *store.TenantStore) *TenantService {
	return &TenantService{store: s}
}

func (s *TenantService) List(ctx context.Context) ([]model.Tenant, error) {
	return s.store.GetAll(ctx)
}

func (s *TenantService) GetByID(ctx context.Context, id string) (model.Tenant, error) {
	tenant, err := s.store.GetByID(ctx, id)
	if errors.Is(err, store.ErrNotFound) {
		return model.Tenant{}, ErrTenantNotFound
	}
	return tenant, err
}

func (s *TenantService) Create(ctx context.Context, firstName, lastName, email, phone string) (model.Tenant, error) {
	if err := s.validateInput(firstName, lastName, email); err != nil {
		return model.Tenant{}, err
	}

	tenant := model.Tenant{
		ID:        generateID(),
		FirstName: firstName,
		LastName:  lastName,
		Email:     email,
		Phone:     phone,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}

	return s.store.Create(ctx, tenant)
}

func (s *TenantService) Update(ctx context.Context, id, firstName, lastName, email, phone string) (model.Tenant, error) {
	existing, err := s.store.GetByID(ctx, id)
	if errors.Is(err, store.ErrNotFound) {
		return model.Tenant{}, ErrTenantNotFound
	}
	if err != nil {
		return model.Tenant{}, err
	}

	if err := s.validateInput(firstName, lastName, email); err != nil {
		return model.Tenant{}, err
	}

	existing.FirstName = firstName
	existing.LastName = lastName
	existing.Email = email
	existing.Phone = phone
	existing.UpdatedAt = time.Now().UTC()

	return s.store.Update(ctx, existing)
}

func (s *TenantService) Delete(ctx context.Context, id string) error {
	err := s.store.Delete(ctx, id)
	if errors.Is(err, store.ErrNotFound) {
		return ErrTenantNotFound
	}
	return err
}

func (s *TenantService) validateInput(firstName, lastName, email string) error {
	if firstName == "" {
		return fmt.Errorf("%w: first name is required", ErrInvalidInput)
	}
	if lastName == "" {
		return fmt.Errorf("%w: last name is required", ErrInvalidInput)
	}
	if email == "" {
		return fmt.Errorf("%w: email is required", ErrInvalidInput)
	}
	return nil
}
