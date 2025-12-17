package store

import (
	"errors"
	"sync"

	"github.com/Lacsw/rntly/internal/model"
)

var (
	ErrTenantNotFound = errors.New("tenant not found")
)

type TenantStore struct {
	mu      sync.RWMutex
	tenants map[string]model.Tenant
}

func NewTenantStore() *TenantStore {
	return &TenantStore{
		tenants: make(map[string]model.Tenant),
	}
}

func (s *TenantStore) GetAll() []model.Tenant {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]model.Tenant, 0, len(s.tenants))
	for _, t := range s.tenants {
		result = append(result, t)
	}
	return result
}

func (s *TenantStore) GetByID(id string) (model.Tenant, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	t, exists := s.tenants[id]
	if !exists {
		return model.Tenant{}, ErrTenantNotFound
	}
	return t, nil
}

func (s *TenantStore) Create(t model.Tenant) model.Tenant {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.tenants[t.ID] = t
	return t
}

func (s *TenantStore) Update(id string, t model.Tenant) (model.Tenant, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.tenants[id]; !exists {
		return model.Tenant{}, ErrTenantNotFound
	}

	s.tenants[id] = t
	return t, nil
}

func (s *TenantStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.tenants[id]; !exists {
		return ErrTenantNotFound
	}

	delete(s.tenants, id)
	return nil
}
