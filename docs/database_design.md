# データベース設計書（タスク管理アプリ）

## テーブルとカラム（PK/FK付き）

### ①accounts（ユーザー）

| カラム | 型 | 説明 |
| --- | --- | --- |
| id(PK) | uuid | ユーザーID |
| email | text | メールアドレス（@必須/ユニーク） |
| first_name | text | 名前（空NG） |
| last_name | text | 苗字（空NG） |
| is_active | boolean | アクティブ状態（デフォルト：true） |
| provider | text | 認証プロバイダー（例：google） |
| provider_account_id | text | プロバイダー側のID |
| thumbnail | text | プロフィール画像URL（nullable） |
| last_login_at | timestamptz | 最終ログイン日時（nullable） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

索引：

- UNIQUE(email)
- UNIQUE(provider,provider_account_id)

### ②Tasks（タスク）

| カラム | 型 | 説明 |
| --- | --- | --- |
| id(PK) | uuid | タスクID |
| owner_id（FK→accounts.id） | uuid | タスク作成者 |
| title | text | タスクのタイトル（空NG） |
| date | date | タスクの日付（空NG） |
| review | text | （空OK） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

**関係：**accounts 1 —< 多tasks

**索引：**INDEX(owner_id)、INDEX(title)

### ③TaskItems（子タスク）

| カラム | 型 | 説明 |
| --- | --- | --- |
| id(PK) | uuid | 子タスクID |
| task_id（FK→tasks.id） | uuid | タスクID |
| priority | text | High or Medium or Low（VOで棚卸しDBはTEXTでもOK）（空NG） |
| density | text | High or Medium or Low（VOで棚卸しDBはTEXTでもOK）（空NG） |
| duration_time | int | 60 or 45 or 30 or 15（VOで棚卸しDBはINTでもOK）（空NG） |
| content | text | 子タスクの内容（空NG） |
| output | text | 子タスクのアウトプット（空OK） |
| is_required | boolean | 子タスクが必須かどうか（空NG） |
| order | int | 子タスクの順番（同一日のタスク内で重複NG）（空NG） |
| status | text | Completed or InProgress or NotStarted（VOで棚卸しDBはTEXTでもOK）（空NG） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

**制約例：**

- UNIQUE(task_id,order)（順番の重複を防ぐ）
- CHECK(order > 0)

**関係：**tasks 1 —<多taskitems

**索引：**INDEX(task_id)、INDEX(title)

## つながり図（ERダイアグラム：関係）

```jsx
accounts（ユーザー）--< tasks（タスク）--< taskitems（子タスク）
```

- A |—-< B … Aが親、Bが子（1対多）

## 集約とトランザクション境界

### **集約境界の定義**

このプロジェクトでは、以下の1つの集約を定義しています。

### **1.Tasks集約（タスクチーム）**

**集約ルート：**tasks **メンバー：**taskitems

```jsx
tasks（集約ルート）-< taskItems（集約メンバー）
```

- タスクと子タスクは常に一緒に扱う
- 子タスクの追加・更新・削除は必ずタスクを通して行う
- トランザクション境界＝task集約

## トランザクション制御のルール

## 同一集約内の操作（1トランザクション）

**task集約の操作例：**

1. タスク作成
2. 子タスクの追加（同じ集約内）

この2つの操作は1トランザクション内で実行し、整合性を保証。

## 集約をまたぐ操作（別トランザクション）

異なる集約は別々のトランザクションで操作する。

**悪い例：Task集約と別集約を1トランザクションで同時操作**

- Task作成と別作成を同じトランザクションで実行するのはNG

**良い例：集約ごとにトランザクションを分ける**

1. Task集約の操作（トランザクション1）
2. 別集約の操作（トランザクション2）

## 集約境界設計の原則

1. **集約内の整合性**
- 集約ルート（tasks/taskitems）を通してのみ更新
- メンバー（taskitems）を直接更新しない
1. **集約間の結合度**
- 他の集約への参照はIDのみ（外部キー）
- 集約をまたぐ処理はService層で調整
1. **トランザクション＝集約**
- 1トランザクション＝1集約の操作
- 複数集約にまたがる整合性はアプリ層で保証
1. **集約のライフサイクル（ON DELETE CASCADE）**

 **動作：**

- Task削除時：taskitemsも自動削除（ON DELETE CASCADE）
- 集約ルートと一緒にメンバーも削除される
- Taskitem削除時：別集約のメンバーは削除されない（CASCADE設定なし）

**集約の境界：**

- **tasks** 　⇄　**taskitems**:同じ集約（親子関係、CASCADE）
- **taskitems** →**別集約メンバー**:集約をまたぐ参照（CASCADEなし）

## ON DELETE CASCADEの使い分け

| 関係 | CASCADE設定 | 理由 |
| --- | --- | --- |
| tasks→taskitems | あり | 同一集約。タスク作成時に子タスクも削除 |
| taskitems→別集約のメンバー | なし | 集約をまたぐ参照。別集約のメンバー削除時に子タスクは残す（参照整合性のみ） |
| 別集約の親→tasks | なし | 集約をまたぐ参照。別集約の親削除時にタスクは残す（ビジネスルール） |
| accounts→tasks | なし | 集約をまたぐ参照。アカウント削除時はアプリ層で制御 |

**原則：**

- **同一集約内の親子関係：**ON DELETE CASCADEを使用
- **集約をまたぐ参照：**CASCADEなし（アプリ層で制御）

