package model

import "time"

// Admin represents an admin user.
type Admin struct {
	ID           string    `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"` // never expose
	Name         string    `db:"name" json:"name"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
}
