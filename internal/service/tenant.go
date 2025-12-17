package service

import (
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

func (s *TenantService) List() []model.Tenant {
	return s.store.GetAll()
}

func (s *TenantService) GetByID(id string) (model.Tenant, error) {
	tenant, err := s.store.GetByID(id)
	if errors.Is(err, store.ErrTenantNotFound) {
		return model.Tenant{}, ErrTenantNotFound
	}
	return tenant, nil
}

func (s *TenantService) Create(firstName, lastName, email, phone string) (model.Tenant, error) {
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

	return s.store.Create(tenant), nil
}

func (s *TenantService) Update(id, firstName, lastName, email, phone string) (model.Tenant, error) {
	existing, err := s.store.GetByID(id)
	if errors.Is(err, store.ErrTenantNotFound) {
		return model.Tenant{}, ErrTenantNotFound
	}

	if err := s.validateInput(firstName, lastName, email); err != nil {
		return model.Tenant{}, err
	}

	existing.FirstName = firstName
	existing.LastName = lastName
	existing.Email = email
	existing.Phone = phone
	existing.UpdatedAt = time.Now().UTC()

	updated, _ := s.store.Update(id, existing)
	return updated, nil
}

func (s *TenantService) Delete(id string) error {
	err := s.store.Delete(id)
	if errors.Is(err, store.ErrTenantNotFound) {
		return ErrTenantNotFound
	}
	return nil
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
