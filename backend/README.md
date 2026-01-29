# Backend

タスク管理システムのバックエンドAPIサーバーです。

## 技術スタック

- **Web Framework**: Echo v4
- **Database Driver**: pgx/v5
- **SQL Code Generation**: sqlc
- **OpenAPI Code Generation**: oapi-codegen
- **Database Migration**: golang-migrate
- **Database**: PostgreSQL

## セットアップ

### 1. 依存関係のインストール

```bash
make install
```

または手動で：

```bash
go mod download
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
go install github.com/deepmap/oapi-codegen/v2/cmd/oapi-codegen@latest
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```bash
DATABASE_URL=postgres://user:password@localhost:5432/task_management?sslmode=disable
PORT=8080
HOST=localhost
ENV=development
```

### 3. データベースマイグレーションの実行

```bash
make migrate-up
```

### 4. SQLクエリからGoコードを生成（sqlc）

```bash
make sqlc-generate
```

### 5. OpenAPIからGoコードを生成

```bash
make openapi-generate
```

## 開発

### Docker Composeで起動

プロジェクトルートで以下のコマンドを実行：

```bash
docker compose up --build
```

これにより、PostgreSQLとAPIサーバーが起動します。

### アプリケーションの起動（ローカル）

```bash
make run
```

または：

```bash
go run cmd/api/main.go
```

### テストの実行

```bash
make test
```

## Makefileコマンド

- `make help` - 利用可能なコマンド一覧を表示
- `make install` - 依存関係をインストール
- `make migrate-up` - データベースマイグレーションを実行
- `make migrate-down` - データベースマイグレーションをロールバック
- `make migrate-create NAME=migration_name` - 新しいマイグレーションファイルを作成
- `make sqlc-generate` - SQLクエリからGoコードを生成
- `make openapi-generate` - OpenAPIからGoコードを生成
- `make run` - アプリケーションを起動
- `make test` - テストを実行
- `make tidy` - go mod tidyを実行

## ディレクトリ構造

```
backend/
├── cmd/
│   └── api/
│       └── main.go          # アプリケーションエントリーポイント
├── internal/
│   ├── adapter/             # 外部アダプター
│   │   ├── gateway/         # データベースゲートウェイ
│   │   │   └── db/
│   │   │       └── sqlc/
│   │   │           ├── queries/      # SQLクエリファイル
│   │   │           └── generated/    # sqlc生成コード
│   │   └── http/            # HTTPアダプター
│   │       ├── controller/   # HTTPコントローラー
│   │       ├── presenter/    # レスポンスプレゼンター
│   │       └── generated/    # OpenAPI生成コード
│   ├── domain/              # ドメインモデル
│   │   ├── account/
│   │   ├── task/
│   │   └── errors/
│   ├── usecase/              # ユースケース
│   ├── port/                  # ポート（インターフェース）
│   └── driver/                # ドライバー（設定、初期化）
│       ├── config/
│       ├── db/
│       └── factory/
├── migrations/                # データベースマイグレーションファイル
├── sqlc.yaml                  # sqlc設定ファイル
├── Makefile                   # Makefile
└── go.mod                     # Goモジュール定義
```

## データベーススキーマ

詳細は `docs/database_design.md` を参照してください。

### テーブル

- **accounts**: ユーザーアカウント
- **tasks**: タスク
- **task_items**: タスクアイテム（子タスク）

