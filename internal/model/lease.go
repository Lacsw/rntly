package model

import "time"

type Lease struct {
	ID         string    `json:"id"`
	PropertyID string    `json:"property_id"`
	TenantID   string    `json:"tenant_id"`
	StartDate  time.Time `json:"start_date"`
	EndDate    time.Time `json:"end_date"`
	RentAmount float64   `json:"rent_amount"`
	Deposit    float64   `json:"deposit"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
