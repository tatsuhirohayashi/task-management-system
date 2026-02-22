# task-management-system

## PR とコードレビュー

- **PR テンプレート**: ブランチを push して Pull Request を作成すると、`.github/PULL_REQUEST_TEMPLATE.md` の雛形が表示されます。必要項目を記入して PR を作成してください。
- **Gemini によるコードレビュー**（GitHub と Gemini Code Assist 連携済みの場合）:
  - PR を開くと、Gemini Code Assist が自動で要約とコードレビューを実行し、`gemini-code-assist[bot]` がレビュアーとして追加されます。
  - リポジトリルートの `.gemini/config.yaml` で PR オープン時の要約・レビューを有効化し、`.gemini/styleguide.md` でレビュー指針を指定しています。
  - コメントで `/gemini summary` や `/gemini review` を実行すると、手動で要約・レビューを再実行できます。
- **GitHub Actions で Gemini レビュー**（オプション）: `GEMINI_API_KEY` をリポジトリの Secrets に登録すると、PR 作成・更新時に `code-review.yml` が動き、Gemini API でレビューコメントを投稿します。未設定の場合はスキップされます。
