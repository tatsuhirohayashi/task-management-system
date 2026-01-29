# API Schema

TypeSpecで定義されたAPIスキーマです。

## セットアップ

```bash
cd api-schema
pnpm install
```

## ビルド

```bash
# OpenAPI仕様を生成
pnpm run generate:openapi

# Goの型定義を生成
pnpm run generate:go
```

## ブラウザで確認

生成されたOpenAPIファイルをブラウザで確認する方法：

### 方法1: Swagger Editor（オンライン版 - 最も簡単）

1. https://editor.swagger.io/ にアクセス
2. `File` → `Import file` を選択
3. `generated/openapi.yaml` をアップロード

### 方法2: Redoc（オンライン版）

1. https://redocly.com/docs/api-reference-docs/redocly-cli/commands/preview/ にアクセス
2. または、以下のコマンドを実行：
```bash
pnpm run preview
```

### 方法3: ローカルでSwagger UIを起動

```bash
# 方法3a: http-serverを使用（推奨）
pnpm run serve
# ブラウザで http://localhost:8081/preview-swagger.html にアクセス

# 方法3b: Pythonを使用（Pythonがインストールされている場合）
cd generated
python3 -m http.server 8081
# ブラウザで http://localhost:8081/preview-swagger.html にアクセス
```

### 方法4: VS Code拡張機能を使用

1. VS Codeに「OpenAPI (Swagger) Editor」拡張機能をインストール
2. `generated/openapi.yaml` を開く
3. プレビューを表示

## ディレクトリ構造

```
api-schema/
├── typespec/
│   ├── main.tsp          # メインエントリーポイント
│   ├── models/           # データモデル定義
│   │   ├── account.tsp
│   │   ├── task.tsp
│   │   └── common.tsp
│   └── routes/           # ルート定義（今後追加）
├── generated/            # 生成されたファイル（最終出力先）
│   └── openapi.yaml
├── tsp-output/           # TypeSpecの一時出力（.gitignore対象）
└── scripts/             # 生成スクリプト
```

## 注意事項

- TypeSpecは`tsp-output`ディレクトリに一時的に出力します
- スクリプトが`generated`ディレクトリにコピーします
- `tsp-output`は`.gitignore`に含まれているため、Gitにはコミットされません
- 実際に使用するファイルは`generated`ディレクトリ内のものです

