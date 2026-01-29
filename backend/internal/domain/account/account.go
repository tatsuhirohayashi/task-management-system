package account

import "time"

// Account アカウントエンティティ
type Account struct {
	ID          string
	Email       string
	FirstName   string
	LastName    string
	Thumbnail   *string
	LastLoginAt *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
