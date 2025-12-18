package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Lacsw/rntly/internal/model"
)

var (
	ErrNotFound = errors.New("not found")
)

type PropertyStore struct {
	db *pgxpool.Pool
}

func NewPropertyStore(db *pgxpool.Pool) *PropertyStore {
	return &PropertyStore{db: db}
}

func (s *PropertyStore) GetAll(ctx context.Context) ([]model.Property, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, address, type, bedrooms, rent_amount, status, created_at, updated_at
		FROM properties
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var properties []model.Property
	for rows.Next() {
		var p model.Property
		err := rows.Scan(&p.ID, &p.Address, &p.Type, &p.Bedrooms, &p.RentAmount, &p.Status, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, err
		}
		properties = append(properties, p)
	}

	return properties, nil
}

func (s *PropertyStore) GetByID(ctx context.Context, id string) (model.Property, error) {
	var p model.Property
	err := s.db.QueryRow(ctx, `
		SELECT id, address, type, bedrooms, rent_amount, status, created_at, updated_at
		FROM properties
		WHERE id = $1
	`, id).Scan(&p.ID, &p.Address, &p.Type, &p.Bedrooms, &p.RentAmount, &p.Status, &p.CreatedAt, &p.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return model.Property{}, ErrNotFound
	}
	return p, err
}

func (s *PropertyStore) Create(ctx context.Context, p model.Property) (model.Property, error) {
	_, err := s.db.Exec(ctx, `
		INSERT INTO properties (id, address, type, bedrooms, rent_amount, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, p.ID, p.Address, p.Type, p.Bedrooms, p.RentAmount, p.Status, p.CreatedAt, p.UpdatedAt)

	return p, err
}

func (s *PropertyStore) Update(ctx context.Context, p model.Property) (model.Property, error) {
	result, err := s.db.Exec(ctx, `
		UPDATE properties
		SET address = $2, type = $3, bedrooms = $4, rent_amount = $5, status = $6, updated_at = $7
		WHERE id = $1
	`, p.ID, p.Address, p.Type, p.Bedrooms, p.RentAmount, p.Status, p.UpdatedAt)

	if err != nil {
		return model.Property{}, err
	}
	if result.RowsAffected() == 0 {
		return model.Property{}, ErrNotFound
	}
	return p, nil
}

func (s *PropertyStore) Delete(ctx context.Context, id string) error {
	result, err := s.db.Exec(ctx, `
		DELETE FROM properties WHERE id = $1
	`, id)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
