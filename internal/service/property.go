package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/Lacsw/rntly/internal/model"
	"github.com/Lacsw/rntly/internal/store"
)

var (
	ErrPropertyNotFound = errors.New("property not found")
	ErrInvalidInput     = errors.New("invalid input")
)

type PropertyService struct {
	store *store.PropertyStore
}

func NewPropertyService(s *store.PropertyStore) *PropertyService {
	return &PropertyService{store: s}
}

func (s *PropertyService) List() []model.Property {
	return s.store.GetAll()
}

func (s *PropertyService) GetByID(id string) (model.Property, error) {
	property, err := s.store.GetByID(id)
	if errors.Is(err, store.ErrNotFound) {
		return model.Property{}, ErrPropertyNotFound
	}
	return property, nil
}

func (s *PropertyService) Create(address, propertyType string, bedrooms int, rentAmount float64) (model.Property, error) {
	if err := s.validateInput(address, propertyType, bedrooms, rentAmount); err != nil {
		return model.Property{}, err
	}

	property := model.Property{
		ID:         generateID(),
		Address:    address,
		Type:       propertyType,
		Bedrooms:   bedrooms,
		Area:       nil,
		RentAmount: rentAmount,
		Status:     "vacant",
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}

	return s.store.Create(property), nil
}

func (s *PropertyService) Update(id, address, propertyType string, bedrooms int, rentAmount float64, status string) (model.Property, error) {
	existing, err := s.store.GetByID(id)
	if errors.Is(err, store.ErrNotFound) {
		return model.Property{}, ErrPropertyNotFound
	}

	if err := s.validateInput(address, propertyType, bedrooms, rentAmount); err != nil {
		return model.Property{}, err
	}

	if !isValidStatus(status) {
		return model.Property{}, fmt.Errorf("%w: status must be 'vacant' or 'occupied'", ErrInvalidInput)
	}

	existing.Address = address
	existing.Type = propertyType
	existing.Bedrooms = bedrooms
	existing.RentAmount = rentAmount
	existing.Status = status
	existing.UpdatedAt = time.Now().UTC()

	updated, _ := s.store.Update(id, existing)
	return updated, nil
}

func (s *PropertyService) Delete(id string) error {
	err := s.store.Delete(id)
	if errors.Is(err, store.ErrNotFound) {
		return ErrPropertyNotFound
	}
	return nil
}

func (s *PropertyService) validateInput(address, propertyType string, bedrooms int, rentAmount float64) error {
	if address == "" {
		return fmt.Errorf("%w: address is required", ErrInvalidInput)
	}
	if propertyType == "" {
		return fmt.Errorf("%w: type is required", ErrInvalidInput)
	}
	if bedrooms < 0 {
		return fmt.Errorf("%w: bedrooms cannot be negative", ErrInvalidInput)
	}
	if rentAmount <= 0 {
		return fmt.Errorf("%w: rent amount must be positive", ErrInvalidInput)
	}
	return nil
}

func isValidStatus(status string) bool {
	return status == "vacant" || status == "occupied"
}

func generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
