# タスク管理アプリ コードレビュー指針

## 対象リポジトリ構成
- **backend**: Go (Echo), Postgres, クリーンアーキテクチャ
- **frontend**: Next.js (App Router), TypeScript, pnpm, Biome / ESLint
- **docs**: 要件定義・API設計・DB設計などのドキュメント

## 共通
- 正しさ・保守性・セキュリティを優先する
- 命名はドメイン用語（ユビキタス言語）に合わせる
- マジックナンバー・ハードコード文字列は避け、定数や設定に寄せる

## Backend (Go)
- `internal/` のレイヤー（handler / usecase / domain / repository）を守る
- エラーハンドリングは適切に行い、クライアントに返すステータスとメッセージを揃える
- DB アクセスは repository に集約し、トランザクション境界を意識する
- 新規 API は `docs/api_design.md` と整合させる

## Frontend (TypeScript / Next.js)
- コンポーネントは単一責任で、再利用しやすい粒度にする
- API 呼び出しはクライアント層にまとめ、型は API スキーマと一致させる
- フォームはバリデーションとエラー表示を忘れずに
- 既存の ESLint / Biome ルールに従う

## ドキュメント
- `docs/` の変更時は、他ドキュメント（要件・API・DB・UI）との整合性を確認する
