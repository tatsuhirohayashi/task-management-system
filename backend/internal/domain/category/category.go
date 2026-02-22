package category

import "time"

// Category カテゴリーエンティティ
type Category struct {
	ID        string
	OwnerID   string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
