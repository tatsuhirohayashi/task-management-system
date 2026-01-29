# API設計（タスク管理アプリ）

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

```jsx
TaskFilters {
  year-month: string //年月
  ownerId?: string //所有者IDでフィルタ（自分のタスクのみ取得する場合に使用）
  q?: string //タスクのタイトルと子タスクの内容をキーワード検索
  sort?: string //並び替えを行う
}
```

**Response:**

```jsx
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

```jsx
id: string //タスクID
```

**Response:**

```jsx
GetTaskByIdResponse = TaskResponse | null; // 見つからない場合はnull
```

### ビジネスルール：

- 認証必須
- 存在しないIDの場合はnullを返す

---

## Command Operations

## タスク作成

**URL: POST /api/tasks**

**Request:**

```jsx
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
  }]
  createdAt: string
  updatedAt: string
}
```

**Response:**

```jsx
CreateTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 新規作成時はReviewはnull、Outputはnull、StatusはNot Started
- 子タスクのorderは0から始まる連番

## タスク更新

**URL: PUT /api/tasks/:id**

**Request:**

```jsx
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
  }]
  createdAt: string
  updatedAt: string
}
```

**Response:**

```jsx
UpdateTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有するタスクのみ更新可能

## タスク削除

**URL: DELETE /api/tasks/:id**

**Request:**

```jsx
DeleteTaskRequest {
  id: string // タスクID
}
```

**Response:**

```jsx
DeleteTaskResponse { success: boolean }
```

### ビジネスルール：

- 認証必須
- 自分が所有するタスクのみ削除可能
- タスクに紐づく子タスクも同時に削除される

## 子タスク更新

**URL: PUT /api/taskitems/:id**

**Request:**

```jsx
TaskItemRequest {
  id: string // 子タスクID
  output: string //子タスクのアウトプット
}
```

**Response:**

```jsx
TaskItemTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有する子タスクのみアウトプットの更新可能
- アウトプットを更新するとステータスはcompleted

## **タスク振り返り更新**

**URL: PUT /api/tasks/:id/review**

**Request:**

```jsx
ReviewItemRequest {
  id: string // タスクID
  review: string //タスクの振り返り
}
```

**Response:**

```jsx
ReviewTaskResponse = TaskResponse;
```

### ビジネスルール：

- 認証必須
- 自分が所有するタスクのみ振り返りの更新可能

---

# Accounts（アカウント）API

# OAuth連携時のアカウント作成または取得

**URL: POST /api/accounts/auth（内部処理）**

**Request:**

```jsx
CreateOrGetAccountRequest {
  email: string
  name: string  
  provider: string    //例："google"
  providerAccountId: string
  thumnail?: string
}
```

Response:

```jsx
AccountResponse {
  id: string
  firstName: string
  lastName: string
  fullName: string
  thumbnail: string?;
  lastLoginAt: string // ISO 8601形式
  createdAt: string // ISO 8601形式
  updateddAt: string // ISO 8601形式
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

```jsx
GetCurrentAccountResponse = AccountResponse;
```

### ビジネスルール：

- 認証必須
- ログインユーザーのアカウント情報を取得

---

## アカウント詳細取得

**URL: GET /api/accounts/:id**

**Request**（URL Parameters）：

```jsx
id: string //アカウントID
```

**Response**:

```jsx
GetCurrentAccountResponse = AccountResponse | null; // 見つからない場合はnull
```

### ビジネスルール：

- 認証必須
- 存在しないIDの場合はnullを返す

---

# ドメインモデルの関係

## エンティティの関連

```jsx
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

- Google OAuth. 2.0による認証
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
| タスク作成 | 必須 | 自動設定 | - |
| タスク更新 | 必須 | 必須 | - |
| タスク削除 | 必須 | 必須 | - |
| 子タスク更新 | 必須 | 必須 |  |
| タスク振り返り更新 | 必須 | 必須 |  |

---

## 型定義の補足

### 共通型

```jsx
// 子タスクの優先度
priority = "High" | "Medium" | "Low";

// 子タスクの密度
density = "High" | "Medium" | "Low";

// 子タスクの継続時間
durationTime = 60 | 45 | 30 | 15;

// 子タスクのステータス
status = "Not Started" | "InProgress" | "Completed";

// 日付形式
ISODateString = string; //ISO 8601形式（例：　"2026-01-15T09:00:00Z"）
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

