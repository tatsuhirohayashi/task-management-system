package main

import (
	"context"
	"log"
	"os"
	"time"

	"task-management-system/backend/internal/adapter/gateway/db"
	"task-management-system/backend/internal/adapter/http/controller"
	"task-management-system/backend/internal/adapter/http/generated/openapi"
	"task-management-system/backend/internal/adapter/http/handler"
	"task-management-system/backend/internal/usecase"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/labstack/echo/v4"
)

func main() {
	// データベース接続
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	// マイグレーションを実行（単一接続を使用）
	if err := runMigrations(databaseURL); err != nil {
		log.Printf("Warning: Migration failed: %v", err)
		// マイグレーションエラーは無視して続行（既に実行済みの場合など）
	}

	// データベース接続プールを確立
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Failed to create connection pool: %v", err)
	}
	defer pool.Close()

	// 接続プールの設定
	pool.Config().MaxConns = 25
	pool.Config().MinConns = 5
	pool.Config().MaxConnLifetime = time.Hour
	pool.Config().MaxConnIdleTime = time.Minute * 30

	// 接続をテスト
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Database connection pool established successfully")

	// リポジトリを作成
	taskRepo := db.NewTaskRepository(pool)
	accountRepo := db.NewAccountRepository(pool)

	// ユースケースを作成
	taskUsecase := usecase.NewTaskUsecase(taskRepo, accountRepo)
	accountUsecase := usecase.NewAccountUsecase(accountRepo)

	// コントローラーを作成
	taskController := controller.NewTaskController(taskUsecase)
	accountController := controller.NewAccountController(accountUsecase)

	// ハンドラーを作成
	server := handler.NewServer(taskController, accountController)

	// Echoインスタンスを作成
	e := echo.New()

	// ルーティングを登録
	openapi.RegisterHandlers(e, server)

	// サーバーを起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatal(err)
	}
}

// runMigrations データベースマイグレーションを実行
func runMigrations(databaseURL string) error {
	// pgxの接続をstdlibに変換
	config, err := pgx.ParseConfig(databaseURL)
	if err != nil {
		return err
	}

	db := stdlib.OpenDB(*config)
	defer db.Close()

	// データベースドライバーを取得
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return err
	}

	// マイグレーションインスタンスを作成
	m, err := migrate.NewWithDatabaseInstance(
		"file://migrations",
		"postgres",
		driver,
	)
	if err != nil {
		return err
	}

	// マイグレーションを実行
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}

	log.Println("Database migrations completed successfully")
	return nil
}
