# API設計（タスク管理アプリセカンドリリース２月１６日〜）

## API構成

## エンドポイント分類

- **Query（読み取り）**：データ取得のみ。副作用なし（GET）
- **Command（書き込み）**：データの作成・更新・削除。副作用あり（POST、PUT、DELETE）

## **URL設計とHTTPメソッド**

| 操作 | HTTPメソッド | URLパターン | 用途 |
| --- | --- | --- | --- |
| 一覧取得 | GET | /api/xxx | 全件または条件付き取得（クエリパラメータで絞り込み） |
| 単体取得 | GET | /api/xxx/:id | IDで1件取得 |
| 作成 | POST | /api/xxx | 新規作成 |
| 更新 | PUT | /api/xxx/:id | 既存更新 |
| 削除 | DELETE | /api/xxx/:id | 削除 |
| 状態変更 | POST | /api/xxx/:id/action | 状態遷移（例：/api/:id/status） |

---

# Tasks（タスク）API

## Query Operations

## タスク一覧取得

**URL: GET /api/tasks**

**Request（Query Parameters）:**

```
TaskFilters {
  year-month: string //年月
  ownerId?: string //所有者IDでフィルタ（自分のタスクのみ取得する場合に使用）
  q?: string //タスクのタイトルと子タスクの内容をキーワード検索
  sort?: string //並び替えを行う
}
```

**Response:**

```
TaskResponse {
  id: string
  ownerId: string
  owner: {
    id: string
    firstName: string
    lastName: string
    thumnail: string?
  }
  title: string
  date: string
  review: string?
  taskItems: [{
    id: string
    taskId: string
    priority: "High" | "Medium" | "Low"
    density: "High" | "Medium" | "Low"
    durationTime: 60 | 45 | 30 | 15
    content: string
    output: string?
    isRequired: boolean
    order: number
    status: "Not Started" | "InProgress" | "Completed"
    category: {
      id: string
      name: string
    }
  }]
  plannedTaskCount: number
  plannedTaskDurationMinutes: number
  completedTaskCount: number
  completedTaskDurationMinutes: number
  completionRate: number
  HighTaskCount: number
  HighTaskDuration: number
  HighTaskRate: number
  MediumTaskCount: number
  MediumTaskDuration: number
  MediumTaskRate: number
  LowTaskCount: number
  LowTaskDuration: number
  LowTaskRate: number
  createdAt: string //ISO 8601形式
  updatedAt: string //ISO 8601形式
}

ListTaskResponse = TaskResponse[]
```

### ビジネスルール：

- 認証必須
- ownerIdを指定した場合、そのユーザーが所有するタスクのみを取得
- 自分のタスクのみを取得する場合：GET /api/tasks?ownerId={自分のID}

## タスク詳細取得

**URL: GET /api/tasks/:id**

**Request（URL Parameters）:**

```
id: string //タスクID
```

**Response:**

```
GetTaskByIdResponse = TaskResponse | null; // 見つからない場合はnull
```

### ビジネスルール：

- 認証必須
- 存在しないIDの場合はnullを返す

## 月間累計タスクデータ取得

**URL: GET /api/total-tasks-monthly-data**

**Request（Query Parameters）:**

```
TotalTasksMonthlyDataFilters {
  year-month: string //年月
}
```

**Response:**

```
TotalTasksMonthlyDataResponse {
  ownerId: string
  owner: {
    id: string
    firstName: string
    lastName: string
    thumnail: string?
  }
  totalMonthlyWorkHours: number
  plannedMonthlyWorkHours: number
  totalMonthlyTasks: number
  plannedMonthlyTasks: number
  monthlyCompletionRate: number
  totalMonthlyHighLoadTaskHours: number
  totalMonthlyMediumLoadTaskHours: number
  totalMonthlyLowLoadTaskHours: number
  monthlyRatioOfHighLoadTasks: number
  monthlyRatioOfMediumLoadTasks: number
  monthlyRatioOfLowLoadTasks: number
  categorys: [{
    id: string
    totalMonthlyTaskHoursByCategory: number
    monthlyTaskRatioByCategory: number
  }]
  totalDailyTasks: [{
    id: string
    date: string
    totalDailyWorkHours: number
    totalDailyHighLoadTaskHours: number
    totalDailyMediumLoadTaskHours: number
    totalDailyLowLoadTaskHours: number
  }]
  createdAt: string //ISO 8601形式
  updatedAt: string //ISO 8601形式
}
```

### ビジネスルール：

- 認証必須
- ownerIdを指定した場合、そのユーザーが所有するタスクのみを取得
- 自分のタスクのみを取得する場合：GET /api/total-tasks-monthly-data?ownerId={自分のID}

---

## Command Operations

## タスク作成

**URL: POST /api/tasks**

**Request:**

```
CreateTaskRequest {
  title: string
  date: string
  taskItems: [{
    priority: "High" | "Medium" | "Low"
    density: "High" | "Medium" | "Low"
    durationTime: 60 | 45 | 30 | 15
    content: string
    isRequired: boolean
    order: number
    status: "Not Started" | "InProgress" | "Completed"
    category: {
      id: string
      name: string
    }
  }]
  createdAt: string
  updatedAt: string
}
```

**Response:**

```
CreateTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 新規作成時はReviewはnull、Outputはnull、StatusはNot Started
- 子タスクのorderは0から始まる連番

## タスク更新

**URL: PUT /api/tasks/:id**

**Request:**

```
UpdateTaskRequest {
  id: string // タスクID
  title: string
  date: string
  taskItems: [{
    id: string // 子タスクID
    priority: "High" | "Medium" | "Low"
    density: "High" | "Medium" | "Low"
    durationTime: 60 | 45 | 30 | 15
    content: string
    isRequired: boolean
    order: number
    status: "Not Started" | "InProgress" | "Completed"
    category: {
      id: string
      name: string
    }
  }]
  createdAt: string
  updatedAt: string
}
```

**Response:**

```
UpdateTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有するタスクのみ更新可能

## タスク削除

**URL: DELETE /api/tasks/:id**

**Request:**

```
DeleteTaskRequest {
  id: string // タスクID
}
```

**Response:**

```
DeleteTaskResponse { success: boolean }
```

### ビジネスルール：

- 認証必須
- 自分が所有するタスクのみ削除可能
- タスクに紐づく子タスクも同時に削除される

## 子タスク更新

**URL: PUT /api/taskitems/:id**

**Request:**

```
TaskItemRequest {
  id: string // 子タスクID
  output: string //子タスクのアウトプット
}
```

**Response:**

```
TaskItemTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有する子タスクのみアウトプットの更新可能
- アウトプットを更新するとステータスはcompleted

## **タスク振り返り更新**

**URL: PUT /api/tasks/:id/review**

**Request:**

```
ReviewItemRequest {
  id: string // タスクID
  review: string //タスクの振り返り
}
```

**Response:**

```
ReviewTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有するタスクのみ振り返りの更新可能

## **子タスク密度更新**

**URL: PUT /api/taskitems/:id/density**

**Request:**

```
TaskItemsDensityRequest {
  id: string // 子タスクID
  density: "High" | "Medium" | "Low" //子タスクの密度
}
```

**Response:**

```
DensityTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有する子タスクのみ密度の更新可能

## **子タスク継続時間更新**

**URL: PUT /api/taskitems/:id/durationtime**

**Request:**

```
TaskItemsDurationTimeRequest {
  id: string // 子タスクID
  durationTime: 60 | 45 | 30 | 15 //子タスクの継続時間
}
```

**Response:**

```
DurationTimeTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有する子タスクのみ継続時間の更新可能

## **子タスク優先度更新**

**URL: PUT /api/taskitems/:id/priority**

**Request:**

```
TaskItemsPriorityRequest {
  id: string // 子タスクID
  priority: "High" | "Medium" | "Low" //子タスクの優先度
}
```

**Response:**

```
PriorityTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有する子タスクのみ優先度の更新可能

## **子タスクカテゴリー更新**

**URL: PUT /api/taskitems/:id/category**

**Request:**

```
TaskItemsCategoryRequest {
  id: string // 子タスクID
  category: {
    id: string
    name: string
  }
}
```

**Response:**

```
CategoryTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有する子タスクのみカテゴリーの更新可能

---

# Categorys（カテゴリー）API

## Query Operations

## カテゴリー一覧取得

**URL: GET /api/categorys**

**Request（Query Parameters）:**

```
CategoryRequest {}
```

**Response:**

```
CategoryResponse {
  id: string
  ownerId: string
  name: string
  createdAt: string //ISO 8601形式
  updatedAt: string //ISO 8601形式
}

ListCategoryResponse = CategoryResponse[]
```

### ビジネスルール：

- 認証必須

## Command Operations

## カテゴリー作成

**URL: POST /api/categorys**

**Request:**

```
CreateCategoryRequest {
  name: string
  createdAt: string
  updatedAt: string
}
```

**Response:**

```
CreateCategoryResponse = CategoryResponse;
```

### ビジネスルール：

- 認証必須
- カテゴリー名の重複はNG

## カテゴリー更新

**URL: PUT /api/categorys/:id**

**Request:**

```
UpdateCategoryRequest {
  id: string // カテゴリーID
  name: string
  createdAt: string
  updatedAt: string
}
```

**Response:**

```
UpdateCategoryResponse = CategoryResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有するカテゴリーのみ更新可能

## カテゴリー削除

**URL: DELETE /api/categorys/:id**

**Request:**

```
DeleteCategoryRequest {
  id: string // カテゴリーID
}
```

**Response:**

```
DeleteCategoryResponse { success: boolean }
```

### ビジネスルール：

- 認証必須
- 自分が所有するカテゴリーのみ削除可能
- 自分が所有するカテゴリーが子タスクで使用されていない場合のみ削除可能

---

# Accounts（アカウント）API

## OAuth連携時のアカウント作成または取得

**URL: POST /api/accounts/auth（内部処理）**

**Request:**

```
CreateOrGetAccountRequest {
  email: string
  name: string
  provider: string    //例："google"
  providerAccountId: string
  thumnail?: string
}
```

**Response:**

```
AccountResponse {
  id: string
  firstName: string
  lastName: string
  fullName: string
  thumbnail: string?
  lastLoginAt: string // ISO 8601形式
  createdAt: string // ISO 8601形式
  updatedAt: string // ISO 8601形式
}
```

### ビジネスルール：

- 既存のアカウントが存在する場合は取得、存在しない場合は新規作成
- nameは姓名に分割される

---

## 現在のアカウント取得

**URL: GET /api/accounts/me**

**Request**: なし

**Response**:

```
GetCurrentAccountResponse = AccountResponse;
```

### ビジネスルール：

- 認証必須
- ログインユーザーのアカウント情報を取得

---

## アカウント詳細取得

**URL: GET /api/accounts/:id**

**Request**（URL Parameters）:

```
id: string //アカウントID
```

**Response**:

```
GetAccountByIdResponse = AccountResponse | null; // 見つからない場合はnull
```

### ビジネスルール：

- 認証必須
- 存在しないIDの場合はnullを返す

---

# ドメインモデルの関係

## エンティティの関連

```
Account（アカウント）—Task（タスク）—TaskItem（子タスク）
```

## 関係性の説明

- **Account:** システムのユーザーを表す
- **Task:** ユーザーが作成するタスク

 　・1つのTaskは複数のTaskItemを持つ

 　・1つのAccountが複数のTaskを所有する

- **TaskItem:** タスクの各子タスクの内容

 　・子タスクの内容を保持する

 　・priority（優先度）、density（密度）、durationTime（継続時間）、status（ステータス）、content（子タスクの内容）、output（子タスクのアウトプット）、isRequired（必須フラグ）、order（子タスクの順序）を持つ

---

# 認証・認可の方針

## 認証方式

- Google OAuth 2.0による認証
- すべてのAPIは認証必須

## **認可（権限チェック）**

### **1. Ownerチェック**

- リソースの所有者のみが操作可能
- 適用対象：

 　・タスクの更新・削除・その他ステータス変更（優先度等）

### 2. ステータスベースの制御

### タスク：

- 優先度、密度、時間、内容、振り返りは所有者のみ更新可能

## 権限チェックの考え方

| 操作 | 認証 | Owner確認 | その他の条件 |
| --- | --- | --- | --- |
| タスク一覧取得 | 必須 | 不要（ownerIdでフィルタ可） | 自分のタスク |
| タスク詳細取得 | 必須 | 不要 | 自分のタスク |
| 月間累計タスクデータ取得 | 必須 | 不要（ownerIdでフィルタ可） | 自分のタスク |
| タスク作成 | 必須 | 自動設定 | - |
| タスク更新 | 必須 | 必須 | - |
| タスク削除 | 必須 | 必須 | - |
| 子タスク更新 | 必須 | 必須 | - |
| タスク振り返り更新 | 必須 | 必須 | - |
| 子タスク密度・継続時間・優先度・カテゴリー更新 | 必須 | 必須 | - |
| カテゴリー一覧取得 | 必須 | - | 自分のカテゴリー |
| カテゴリー作成 | 必須 | 自動設定 | - |
| カテゴリー更新 | 必須 | 必須 | - |
| カテゴリー削除 | 必須 | 必須 | 使用中でないこと |

---

## 型定義の補足

### 共通型

```
// 子タスクの優先度
priority = "High" | "Medium" | "Low";

// 子タスクの密度
density = "High" | "Medium" | "Low";

// 子タスクの継続時間
durationTime = 60 | 45 | 30 | 15;

// 子タスクのステータス
status = "Not Started" | "InProgress" | "Completed";

// 日付形式
ISODateString = string; //ISO 8601形式（例："2026-01-15T09:00:00Z"）
```

### バリデーションルール（概念）

- **title:** 1文字以上の文字列
- **date:** 1文字以上の文字列
- **review:** 0文字以上の文字列（空文字可）
- **priority:** HighかMediumかLowか
- **density:** HighかMediumかLowか
- **durationTime:** 60か45か30か15
- **content:** 1文字以上の文字列
- **output:** 0文字以上の文字列（空文字可）
- **isRequired:** boolean
- **order:** 0以上の整数
- **status:** Not Started か InProgress か Completed
- **id:** UUID v4形式の文字列
