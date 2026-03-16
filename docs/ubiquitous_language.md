# ユビキタス言語（タスク管理アプリセカンドリリース２月１６日）

## アカウント関連

| 用語 | 定義 |
| --- | --- |
| Guest（ゲスト） | ログインしていないユーザー。ログイン画面のみ利用できる |
| Account（アカウント） | Googleアカウントでログインしたユーザー。タスクの作成・編集・削除ができる |
| OtherAccount（他アカウント） | 他のユーザーが作成したタスクを閲覧・利用するユーザー |
| Owner（作成者） | タスクの所有者（作成したユーザー） |
| Auth（認証） | Googleログイン/ログアウトなど、ユーザーの本人確認機能 |

## タスク（Task）関連

| 用語 | 定義 |
| --- | --- |
| Task（タスク） | 1日分のタスク。 |
| TaskId（タスクID） | タスクを一意に識別するためのID |
| Title（タイトル） | １日のタスクのタイトル。何をやるのか示す |
| Date（日付） | タスクを行う日付を表す |
| Review（振り返り） | 1日のタスクの振り返りを行う |
| TaskItem（子タスク） | 1日のタスクの内、子タスクを表す |
| Priority（優先度） | 子タスクの優先度 |
| Density（密度、負荷） | 子タスクの負荷 |
| DurationTime（継続時間） | 子タスクの継続時間 |
| Content（内容） | 子タスクの内容 |
| Output（アウトプット） | 子タスクのアウトプット |
| isRequired（必須） | 子タスクが必須かどうか |
| Order（順序） | 子タスクの順番 |
| Status（ステータス） | 子タスクのステータス※タスクの進行状況 |
| MyTaskPage（マイタスクページ） | 自分が作成したタスクの一覧を見られる画面 |
| TaskDetail（タスクの詳細） | タスク1日分を表示する画面。 |
| TaskSearch（タスク検索） | タスクのタイトルまたは子タスクの内容を検索できる |
| ↓以下追加 |  |
| Total Monthly Work Hours（月間累計作業時間） |  |
| Planned Monthly Work Hours（月間予定作業時間） |  |
| Total Monthly Tasks（月間累計タスク数） |  |
| Planned Monthly Tasks（月間予定タスク数） |  |
| Monthly Completion Rate（月間完了率） |  |
| Total Monthly High-Load Task Hours（月間累計高負荷タスク時間） |  |
| Total Monthly Medium-Load Task Hours（月間累計中負荷タスク時間） |  |
| Total Monthly Low-Load Task Hours（月間累計低負荷タスク時間） |  |
| Monthly Ratio of High-Load Tasks（月間累計高負荷タスクの割合） |  |
| Monthly Ratio of Medium-Load Tasks（月間累計中負荷タスクの割合） |  |
| Monthly Ratio of Low-Load Tasks（月間累計低負荷タスクの割合） |  |
| Total Monthly Task Hours by Category（月間累計カテゴリーのタスク時間） | 月間の１つのカテゴリーのタスクの累計の時間 |
| Monthly Task Ratio by Category（月間累計カテゴリーのタスクの割合） | 月間の全カテゴリーの内、１つのカテゴリーのタスクの累計の割合 |
| Total Daily Work Hours（日別累計作業時間） | 1日の累計の作業時間 |
| Total Daily High-Load Task Hours（日別累計高負荷タスク時間） | 1日の累計の高負荷のタスク時間 |
| Total Daily Medium-Load Task Hours（日別累計中負荷タスク時間） | 1日の累計の中負荷のタスク時間 |
| Total Daily Low-Load Task Hours（日別累計低負荷タスク時間） | 1日の累計の低負荷のタスク時間 |

## カテゴリー（Category）関連

| 用語 | 定義 |
| --- | --- |
| Category（カテゴリ） | タスクのカテゴリー |
| CategoryId（カテゴリーID） | カテゴリーを一意に識別するためのID |
| Name（名前） | カテゴリーの名前 |

## 操作・機能関連

| 用語 | 定義 |
| --- | --- |
| Search（検索） | タスクのタイトルまたは子タスクの内容を検索できる |
| Filter（フィルタ） | ステータスで絞り込む機能（MVPでは未実装） |
| List（一覧表示） | 複数のタスクを一覧で表示する画面 |
| Edit（編集） | 既存データ（タスク）を修正する操作 |
| Delete（削除） | タスクを削除する操作。MVPでは物理削除 |
| Sort（並び替え） | 一覧で〜項目順に表示する機能 |

## データ・技術関連（システム視点）

| 用語 | 定義 |
| --- | --- |
| Database（データベース） | Postgresを使用してデータを保存。正規化されたテーブル構造（tasksなど） |
| Cloud Run | アプリをホスティングするGoogleの実行環境 |
| Cloud Build | コードを自動ビルドしてデプロイする仕組み |
| GitHub Actions | CI/CD用のワークフロー |
| Cloud Logging | ログ管理ツール（監視の最低限機能） |
| OAuth2（オーオース２） | Googleログインで使う認証の仕組み |
