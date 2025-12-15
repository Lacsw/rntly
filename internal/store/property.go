package store

import (
	"errors"
	"sync"

	"github.com/Lacsw/rntly/internal/model"
)

var (
	ErrNotFound = errors.New("property not found")
)

type PropertyStore struct {
	mu         sync.RWMutex
	properties map[string]model.Property
}

func NewPropertyStore() *PropertyStore {
	return &PropertyStore{
		properties: make(map[string]model.Property),
	}
}

func (s *PropertyStore) GetAll() []model.Property {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]model.Property, 0, len(s.properties))
	for _, p := range s.properties {
		result = append(result, p)
	}
	return result
}

func (s *PropertyStore) GetByID(id string) (model.Property, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	p, exists := s.properties[id]
	if !exists {
		return model.Property{}, ErrNotFound
	}
	return p, nil
}

func (s *PropertyStore) Create(p model.Property) model.Property {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.properties[p.ID] = p
	return p
}

func (s *PropertyStore) Update(id string, p model.Property) (model.Property, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.properties[id]; !exists {
		return model.Property{}, ErrNotFound
	}

	s.properties[id] = p
	return p, nil
}

func (s *PropertyStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.properties[id]; !exists {
		return ErrNotFound
	}

	delete(s.properties, id)
	return nil
}
