package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Lacsw/rntly/internal/model"
)

type TenantStore struct {
	db *pgxpool.Pool
}

func NewTenantStore(db *pgxpool.Pool) *TenantStore {
	return &TenantStore{db: db}
}

func (s *TenantStore) GetAll(ctx context.Context) ([]model.Tenant, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, first_name, last_name, email, phone, created_at, updated_at
		FROM tenants
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tenants []model.Tenant
	for rows.Next() {
		var t model.Tenant
		err := rows.Scan(&t.ID, &t.FirstName, &t.LastName, &t.Email, &t.Phone, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, err
		}
		tenants = append(tenants, t)
	}

	return tenants, nil
}

func (s *TenantStore) GetByID(ctx context.Context, id string) (model.Tenant, error) {
	var t model.Tenant
	err := s.db.QueryRow(ctx, `
		SELECT id, first_name, last_name, email, phone, created_at, updated_at
		FROM tenants
		WHERE id = $1
	`, id).Scan(&t.ID, &t.FirstName, &t.LastName, &t.Email, &t.Phone, &t.CreatedAt, &t.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return model.Tenant{}, ErrNotFound
	}
	return t, err
}

func (s *TenantStore) Create(ctx context.Context, t model.Tenant) (model.Tenant, error) {
	_, err := s.db.Exec(ctx, `
		INSERT INTO tenants (id, first_name, last_name, email, phone, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, t.ID, t.FirstName, t.LastName, t.Email, t.Phone, t.CreatedAt, t.UpdatedAt)

	return t, err
}

func (s *TenantStore) Update(ctx context.Context, t model.Tenant) (model.Tenant, error) {
	result, err := s.db.Exec(ctx, `
		UPDATE tenants
		SET first_name = $2, last_name = $3, email = $4, phone = $5, updated_at = $6
		WHERE id = $1
	`, t.ID, t.FirstName, t.LastName, t.Email, t.Phone, t.UpdatedAt)

	if err != nil {
		return model.Tenant{}, err
	}
	if result.RowsAffected() == 0 {
		return model.Tenant{}, ErrNotFound
	}
	return t, nil
}

func (s *TenantStore) Delete(ctx context.Context, id string) error {
	result, err := s.db.Exec(ctx, `
		DELETE FROM tenants WHERE id = $1
	`, id)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
