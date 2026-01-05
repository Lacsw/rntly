package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Lacsw/rntly/internal/model"
)

type LeaseStore struct {
	db *pgxpool.Pool
}

func NewLeaseStore(db *pgxpool.Pool) *LeaseStore {
	return &LeaseStore{db: db}
}

func (s *LeaseStore) GetAll(ctx context.Context) ([]model.Lease, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, property_id, tenant_id, start_date, end_date, rent_amount, deposit, status, created_at, updated_at
		FROM leases
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leases []model.Lease
	for rows.Next() {
		var l model.Lease
		err := rows.Scan(&l.ID, &l.PropertyID, &l.TenantID, &l.StartDate, &l.EndDate, &l.RentAmount, &l.Deposit, &l.Status, &l.CreatedAt, &l.UpdatedAt)
		if err != nil {
			return nil, err
		}
		leases = append(leases, l)
	}

	return leases, nil
}

func (s *LeaseStore) GetByID(ctx context.Context, id string) (model.Lease, error) {
	var l model.Lease
	err := s.db.QueryRow(ctx, `
		SELECT id, property_id, tenant_id, start_date, end_date, rent_amount, deposit, status, created_at, updated_at
		FROM leases
		WHERE id = $1
	`, id).Scan(&l.ID, &l.PropertyID, &l.TenantID, &l.StartDate, &l.EndDate, &l.RentAmount, &l.Deposit, &l.Status, &l.CreatedAt, &l.UpdatedAt)

	if errors.Is(err, pgx.ErrNoRows) {
		return model.Lease{}, ErrNotFound
	}
	return l, err
}

func (s *LeaseStore) GetByPropertyID(ctx context.Context, propertyID string) ([]model.Lease, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, property_id, tenant_id, start_date, end_date, rent_amount, deposit, status, created_at, updated_at
		FROM leases
		WHERE property_id = $1
		ORDER BY start_date DESC
	`, propertyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leases []model.Lease
	for rows.Next() {
		var l model.Lease
		err := rows.Scan(&l.ID, &l.PropertyID, &l.TenantID, &l.StartDate, &l.EndDate, &l.RentAmount, &l.Deposit, &l.Status, &l.CreatedAt, &l.UpdatedAt)
		if err != nil {
			return nil, err
		}
		leases = append(leases, l)
	}

	return leases, nil
}

func (s *LeaseStore) GetByTenantID(ctx context.Context, tenantID string) ([]model.Lease, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, property_id, tenant_id, start_date, end_date, rent_amount, deposit, status, created_at, updated_at
		FROM leases
		WHERE tenant_id = $1
		ORDER BY start_date DESC
	`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leases []model.Lease
	for rows.Next() {
		var l model.Lease
		err := rows.Scan(&l.ID, &l.PropertyID, &l.TenantID, &l.StartDate, &l.EndDate, &l.RentAmount, &l.Deposit, &l.Status, &l.CreatedAt, &l.UpdatedAt)
		if err != nil {
			return nil, err
		}
		leases = append(leases, l)
	}

	return leases, nil
}

func (s *LeaseStore) Create(ctx context.Context, l model.Lease) (model.Lease, error) {
	_, err := s.db.Exec(ctx, `
		INSERT INTO leases (id, property_id, tenant_id, start_date, end_date, rent_amount, deposit, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, l.ID, l.PropertyID, l.TenantID, l.StartDate, l.EndDate, l.RentAmount, l.Deposit, l.Status, l.CreatedAt, l.UpdatedAt)

	return l, err
}

func (s *LeaseStore) Update(ctx context.Context, l model.Lease) (model.Lease, error) {
	result, err := s.db.Exec(ctx, `
		UPDATE leases
		SET property_id = $2, tenant_id = $3, start_date = $4, end_date = $5, rent_amount = $6, deposit = $7, status = $8, updated_at = $9
		WHERE id = $1
	`, l.ID, l.PropertyID, l.TenantID, l.StartDate, l.EndDate, l.RentAmount, l.Deposit, l.Status, l.UpdatedAt)

	if err != nil {
		return model.Lease{}, err
	}
	if result.RowsAffected() == 0 {
		return model.Lease{}, ErrNotFound
	}
	return l, nil
}

func (s *LeaseStore) Delete(ctx context.Context, id string) error {
	result, err := s.db.Exec(ctx, `
		DELETE FROM leases WHERE id = $1
	`, id)

	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
