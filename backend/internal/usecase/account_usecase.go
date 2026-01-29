package usecase

import (
	"context"
	"fmt"

	"task-management-system/backend/internal/domain/account"
	"task-management-system/backend/internal/port/repository"
)

// AccountUsecase アカウントユースケース
type AccountUsecase struct {
	accountRepo repository.AccountRepository
}

// NewAccountUsecase アカウントユースケースを作成
func NewAccountUsecase(accountRepo repository.AccountRepository) *AccountUsecase {
	return &AccountUsecase{
		accountRepo: accountRepo,
	}
}

// GetCurrentAccount 現在のアカウントを取得
func (u *AccountUsecase) GetCurrentAccount(ctx context.Context, accountID string) (*account.Account, error) {
	// アカウントを取得
	acc, err := u.accountRepo.GetAccountByID(ctx, accountID)
	if err != nil {
		return nil, err
	}

	if acc == nil {
		return nil, fmt.Errorf("account not found: %s", accountID)
	}

	return acc, nil
}

// GetAccountByID アカウントIDでアカウントを取得
func (u *AccountUsecase) GetAccountByID(ctx context.Context, accountID string) (*account.Account, error) {
	// アカウントを取得
	acc, err := u.accountRepo.GetAccountByID(ctx, accountID)
	if err != nil {
		return nil, err
	}

	// アカウントが見つからない場合はnilを返す（エラーではない）
	if acc == nil {
		return nil, nil
	}

	return acc, nil
}

// GetAccountByEmail メールアドレスでアカウントを取得
func (u *AccountUsecase) GetAccountByEmail(ctx context.Context, email string) (*account.Account, error) {
	// アカウントを取得
	acc, err := u.accountRepo.GetAccountByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	// アカウントが見つからない場合はnilを返す（エラーではない）
	if acc == nil {
		return nil, nil
	}

	return acc, nil
}

// CreateOrGetAccount アカウントを作成または取得
func (u *AccountUsecase) CreateOrGetAccount(ctx context.Context, email string, firstName string, lastName string, provider string, providerAccountID string, thumbnail *string) (*account.Account, error) {
	// 既存のアカウントを取得（メールアドレスで検索）
	existingAccount, err := u.accountRepo.GetAccountByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	// 既存のアカウントが存在する場合は返す
	if existingAccount != nil {
		return existingAccount, nil
	}

	// アカウントを作成
	createdAccount, err := u.accountRepo.CreateAccount(ctx, email, firstName, lastName, provider, providerAccountID, thumbnail)
	if err != nil {
		return nil, err
	}

	return createdAccount, nil
}
