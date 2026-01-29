package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	dbgen "task-management-system/backend/internal/adapter/gateway/db/sqlc/generated"
	"task-management-system/backend/internal/domain/account"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// AccountRepository アカウントリポジトリ
type AccountRepository struct {
	queries *dbgen.Queries
}

// NewAccountRepository アカウントリポジトリを作成
func NewAccountRepository(db dbgen.DBTX) *AccountRepository {
	return &AccountRepository{
		queries: dbgen.New(db),
	}
}

// GetAccountsByIDs アカウントIDのリストでアカウントを取得
func (r *AccountRepository) GetAccountsByIDs(ctx context.Context, accountIDs []string) ([]*account.Account, error) {
	if len(accountIDs) == 0 {
		return []*account.Account{}, nil
	}

	// stringのUUIDをpgtype.UUIDに変換
	pgUUIDs := make([]pgtype.UUID, 0, len(accountIDs))
	for _, id := range accountIDs {
		uuid, err := uuid.Parse(id)
		if err != nil {
			return nil, fmt.Errorf("invalid account_id: %w", err)
		}
		var pgUUID pgtype.UUID
		if err := pgUUID.Scan(uuid.String()); err != nil {
			return nil, fmt.Errorf("failed to convert account_id to pgtype.UUID: %w", err)
		}
		pgUUIDs = append(pgUUIDs, pgUUID)
	}

	// アカウントを取得
	accounts, err := r.queries.GetAccountsByIDs(ctx, pgUUIDs)
	if err != nil {
		return nil, err
	}

	// ドメインエンティティに変換
	result := make([]*account.Account, 0, len(accounts))
	for _, a := range accounts {
		var thumbnail *string
		if a.Thumbnail.Valid {
			thumbnail = &a.Thumbnail.String
		}

		accountEntity := &account.Account{
			ID:        UUIDFromPgtype(a.ID),
			Email:     a.Email,
			FirstName: a.FirstName,
			LastName:  a.LastName,
			Thumbnail: thumbnail,
		}

		// タイムスタンプを設定（ドメインエンティティに追加する必要がある場合は後で対応）
		// 現時点では、AccountResponseに必要な情報は全て揃っている

		result = append(result, accountEntity)
	}

	return result, nil
}

// GetAccountByID アカウントIDでアカウントを取得
func (r *AccountRepository) GetAccountByID(ctx context.Context, accountID string) (*account.Account, error) {
	// accountIDをUUIDに変換
	accountUUID, err := uuid.Parse(accountID)
	if err != nil {
		return nil, fmt.Errorf("invalid account_id: %w", err)
	}
	var accountPgUUID pgtype.UUID
	if err := accountPgUUID.Scan(accountUUID.String()); err != nil {
		return nil, fmt.Errorf("failed to convert account_id to pgtype.UUID: %w", err)
	}

	// アカウントを取得
	acc, err := r.queries.GetAccountByID(ctx, accountPgUUID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get account: %w", err)
	}

	// ドメインエンティティに変換
	var thumbnail *string
	if acc.Thumbnail.Valid {
		thumbnail = &acc.Thumbnail.String
	}

	var lastLoginAt *time.Time
	if acc.LastLoginAt.Valid {
		lastLoginAt = &acc.LastLoginAt.Time
	}

	return &account.Account{
		ID:          UUIDFromPgtype(acc.ID),
		Email:       acc.Email,
		FirstName:   acc.FirstName,
		LastName:    acc.LastName,
		Thumbnail:   thumbnail,
		LastLoginAt: lastLoginAt,
		CreatedAt:   acc.CreatedAt.Time,
		UpdatedAt:   acc.UpdatedAt.Time,
	}, nil
}

// GetAccountByEmail メールアドレスでアカウントを取得
func (r *AccountRepository) GetAccountByEmail(ctx context.Context, email string) (*account.Account, error) {
	// アカウントを取得
	acc, err := r.queries.GetAccountByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get account by email: %w", err)
	}

	// ドメインエンティティに変換
	var thumbnail *string
	if acc.Thumbnail.Valid {
		thumbnail = &acc.Thumbnail.String
	}

	var lastLoginAt *time.Time
	if acc.LastLoginAt.Valid {
		lastLoginAt = &acc.LastLoginAt.Time
	}

	return &account.Account{
		ID:          UUIDFromPgtype(acc.ID),
		Email:       acc.Email,
		FirstName:   acc.FirstName,
		LastName:    acc.LastName,
		Thumbnail:   thumbnail,
		LastLoginAt: lastLoginAt,
		CreatedAt:   acc.CreatedAt.Time,
		UpdatedAt:   acc.UpdatedAt.Time,
	}, nil
}

// CreateAccount アカウントを作成
func (r *AccountRepository) CreateAccount(ctx context.Context, email string, firstName string, lastName string, provider string, providerAccountID string, thumbnail *string) (*account.Account, error) {
	// thumbnailをpgtype.Textに変換
	var thumbnailPg pgtype.Text
	if thumbnail != nil {
		thumbnailPg.String = *thumbnail
		thumbnailPg.Valid = true
	} else {
		thumbnailPg.Valid = false
	}

	// アカウントを作成
	acc, err := r.queries.CreateAccount(ctx, dbgen.CreateAccountParams{
		Email:             email,
		FirstName:         firstName,
		LastName:          lastName,
		Provider:          provider,
		ProviderAccountID: providerAccountID,
		Thumbnail:         thumbnailPg.String,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create account: %w", err)
	}

	// ドメインエンティティに変換
	var thumbnailResult *string
	if acc.Thumbnail.Valid {
		thumbnailResult = &acc.Thumbnail.String
	}

	var lastLoginAt *time.Time
	if acc.LastLoginAt.Valid {
		lastLoginAt = &acc.LastLoginAt.Time
	}

	return &account.Account{
		ID:          UUIDFromPgtype(acc.ID),
		Email:       acc.Email,
		FirstName:   acc.FirstName,
		LastName:    acc.LastName,
		Thumbnail:   thumbnailResult,
		LastLoginAt: lastLoginAt,
		CreatedAt:   acc.CreatedAt.Time,
		UpdatedAt:   acc.UpdatedAt.Time,
	}, nil
}
