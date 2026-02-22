# データベース設計書（タスク管理アプリセカンドリリース２月１６日）

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
| task_category_id（FK→task_categories.id） | uuid | タスクカテゴリーID |
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

**索引：**INDEX(task_id)、INDEX(task_category_id)

### ④categories（カテゴリー）

| カラム | 型 | 説明 |
| --- | --- | --- |
| id(PK) | uuid | カテゴリーID |
| owner_id（FK→accounts.id） | uuid | カテゴリーの作成者 |
| name | text | カテゴリー名（空NG） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

**制約例：**

- UNIQUE(owner_id, name)（同一オーナー内でカテゴリー名の重複を防ぐ）

**関係：**accounts 1 —< 多categories、categories 多 —< task_items（task_categories経由）

**索引：**INDEX(owner_id)、INDEX(name)

### ⑤task_categories（タスクカテゴリー）※カテゴリーと子タスクの中間テーブル

| カラム | 型 | 説明 |
| --- | --- | --- |
| id(PK) | uuid | タスクカテゴリーID |
| category_id（FK→categories.id） | uuid | カテゴリーID |
| task_item_id（FK→task_items.id） | uuid | 子タスクID |

**制約例：**

- UNIQUE(task_item_id)（1子タスクにつき1カテゴリー）

**関係：**task_categories 多 —< 1 task_items、task_categories 多 —< 1 categories

**索引：**INDEX(category_id)、INDEX(task_item_id)

## つながり図（ERダイアグラム：関係）

```
accounts（ユーザー）--< tasks（タスク）--< task_items（子タスク）>- task_categories（タスクカテゴリー）-< categories（カテゴリー）
```

- A |—-< B … Aが親、Bが子（1対多）

## 集約とトランザクション境界

### **集約境界の定義**

このプロジェクトでは、以下の集約を定義しています。

### **1.Tasks集約（タスクチーム）**

**集約ルート：**tasks **メンバー：**task_items

```
tasks（集約ルート）-< task_items（集約メンバー）
```

- タスクと子タスクは常に一緒に扱う
- 子タスクの追加・更新・削除は必ずタスクを通して行う
- トランザクション境界＝task集約

### 2.categories集約（カテゴリーチーム）

**集約ルート：**categories **メンバー：**task_categories

```
categories（集約ルート）-< task_categories（集約メンバー）
```

- カテゴリーとタスクカテゴリーは常に一緒に扱う
- 子タスクへのカテゴリーの追加、更新、削除は必ずカテゴリーを通して行う
- トランザクション境界＝category集約

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
- 集約ルート（tasks/task_items）を通してのみ更新
- メンバー（task_items）を直接更新しない
2. **集約間の結合度**
- 他の集約への参照はIDのみ（外部キー）
- 集約をまたぐ処理はService層で調整
3. **トランザクション＝集約**
- 1トランザクション＝1集約の操作
- 複数集約にまたがる整合性はアプリ層で保証
4. **集約のライフサイクル（ON DELETE CASCADE）**

 **動作：**

- Task削除時：task_itemsも自動削除（ON DELETE CASCADE）
- 集約ルートと一緒にメンバーも削除される
- Task_item削除時：task_categoriesの該当行は削除（CASCADEまたはアプリ層で削除）。categoriesは別集約のため削除されない

**集約の境界：**

- **tasks** 　⇄　**task_items**:同じ集約（親子関係、CASCADE）
- **task_items** → **task_categories** → **categories**:集約をまたぐ参照（CASCADEは参照整合性に応じて設定）

## ON DELETE CASCADEの使い分け

| 関係 | CASCADE設定 | 理由 |
| --- | --- | --- |
| tasks→task_items | あり | 同一集約。タスク削除時に子タスクも削除 |
| task_items→task_categories | あり | 子タスク削除時に紐づくタスクカテゴリーも削除 |
| task_categories→categories | なし | 集約をまたぐ参照。カテゴリー削除時はアプリ層で制御（使用中なら削除不可等） |
| taskitems→別集約のメンバー | なし | 集約をまたぐ参照。別集約のメンバー削除時に子タスクは残す（参照整合性のみ） |
| accounts→tasks | なし | 集約をまたぐ参照。アカウント削除時はアプリ層で制御 |
| accounts→categories | なし | 集約をまたぐ参照。アカウント削除時はアプリ層で制御 |

**原則：**

- **同一集約内の親子関係：**ON DELETE CASCADEを使用
- **集約をまたぐ参照：**CASCADEなし（アプリ層で制御）
