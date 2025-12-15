package model

import "time"

type Property struct {
	ID         string    `json:"id"`
	Address    string    `json:"address"`
	Type       string    `json:"type"`
	Bedrooms   int       `json:"bedrooms"`
	Area       float64   `json:"area"`
	RentAmount float64   `json:"rent_amount"`
	Status     string    `json:"status"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
