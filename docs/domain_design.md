# ドメイン設計（タスク管理アプリ）

# ドメイン設計書

## エンティティ

| エンティティ | 説明 | 主な属性（プロパティ） |
| --- | --- | --- |
| Account | ログインしているユーザー。タスクの作成者 | id、email、firstName、lastName、isActive、provider、providerAccountId、thumnail、lastLoginAt、createdAt、updatedAt |
| Task | 1日のタスク。 | id、ownerId、title、date、review、taskItems[]、createdAt、updatedAt |
| TaskItem | Taskの内の1つのタスク | id、taskId、priority、density、durationTime、content、output、status、isRequired、order、createdAt、updatedAt |
| Priority | 子タスクの優先度（高、中、低） | high、medium、low |
| Density | 子タスクの密度（高、中、低） | high、medium、low |
| DurationTime | 子タスクの継続時間（15、30、45、60）分 | 15、30、45、60 |
| Status | 子タスクのステータス（未着手、進行中、完了） | not-started、in-progress、completed |

## VO（Value Object）

| 名前 | 使う場所 | 守るルール（ほんの少しの約束） | 例 | 備考 |
| --- | --- | --- | --- | --- |
| Email | Account.email | 「@」が必ずある/空NG/前後の空白トリム | user@example.com | みんなで同じルール、間違うと困るのでVOにする |
| Priority | Task.priority | HighまたはMediumまたはLowだけOK | High/Medium/Low | アプリの意味が強い（高、中、低）のでVOにする |
| Density | Task.density | HighまたはMediumまたはLowだけOK | High/Medium/Low | アプリの意味が強い（高、中、低）なのでVOにする |
| DurationTime | Task.time | 60または45または30または15だけOK | 60/45/30/15 | アプリの意味が強い（60、45、30、15）なのでVOにする |
| Status | Task.status | NotStartedまたはInProgressまたはCompleted | NotStarted/InProgress/Completed | アプリの意味が強い（未着手、進行中、完了）なのでVOにする |

## 集約

| チーム名（集約） | 集約ルート | 中にいるメンバー（子エンティティ・VO） | 外との関係・使い方 | チームの役割（ざっくり） |
| --- | --- | --- | --- | --- |
| Taskチーム | Task | TaskItem
Priority（優先度の状態）
Density（密度の状態）
DurationTime（継続時間の状態） | Accountに属する（Owner） | タスクを作るチーム。Taskがリーダーで、TaskItemは中身 |
| Accountチーム | Account | Email（VO）
プロバイダー情報（provider、providerAccountId） | Taskを所有する | OAuthでログインしたユーザーを表すチーム。他チームの親（所有者） |
| 共通VO（どのチームにも属さない小さな部品） | なし（単独） | Email、Priority、Density、DurationTime、Status | 各チームで使われる共通ルール |  |

## 関係図

[Account]-owns→[Task]-contains→[TaskItem]

## ドメインロジック

### Taskチーム（タスクの世界）

| ルール | 何をしてる？ |
| --- | --- |
| タスクを消したら中の子タスクも一緒に消す | タスクが親分で、子タスクはその子。親が消えたら子も一緒に消える |
| 優先度は「高」か「中」か「低」だけ | 他の言葉（例：大）は使えない。3つの状態しか持たない |
| 密度は「高」か「中」か「低」だけ | 他の言葉（例：大）は使えない。3つの状態しか持たない |
| 継続時間は「60」か「45」か「30」か「15」だけ | 他の言葉（例：超超長）は使えない。4つの状態しか持たない |
| ステータスは「未着手」か「進行中」か「完了」だけ | 他の言葉（例：なし）は使えない。3つの状態しか持たない |
| 優先度、密度、継続時間、ステータスを変えられるのはオーナーだけ（判定だけ） | 誰が変えられるかをタスクの中で判断する。「自分のタスクだけOK」 |
| 新しいタスクを作る時、子タスクも作る | 新しいタスクを作る時、同時に子タスクも一緒に作る |
| TaskItem（子タスク）の順番はかぶらない | 1番・2番・3番が重ならないように並べる |
| TaskItem（子タスク）の追加、削除、並び替えはTaskがまとめて行う | 子タスクを勝手に触れないように、親のタスクが管理する |

### Accountチーム（アカウントの世界）

| ルール | 何をしてる？ |
| --- | --- |
| 少なくとも名前（firstName）か苗字（lastName）のどちらかは必須 | 誰かわからないから、最低でも名前か苗字のどちらかは必要 |
| provider + providerAccountIdの組み合わせは一意 | 同じOAuthプロバイダーで同じアカウントIDは1つだけ |
| アカウントは自分のノートとテンプレートを持つ | 自分のものだけを見たり直したりできるように関係を持っている |
| ログイン時にプロフィール情報と最終ログイン時刻を更新 | OAuthログイン時に最新のプロフィール情報で更新する |

### 共通ルール（どのチームでも同じ）

| ルール | 何をしてる？ |
| --- | --- |
| 子供（TaskItem）は、親（Task）を通してしか触れない | 外から直接いじれないように、親がまとめて面倒を見る |
| チームの中のものは、チームごとに保存・変更する | 別チームのデータを勝手に直さないようにしている |

### ドメインサービス

| サービス名 | どんな仕事？ | 関わるドメイン（集約） |
| --- | --- | --- |
| canChangePriority | 子タスクの優先度を変更していいかを判定する。オーナーならOK、他人ならNGという条件をチェックする係 | Account + Task |
| canChangeDensity | 子タスクの密度を変更していいかを判定する。オーナーならOK、他人ならNGという条件をチェックする係 | Account + Task |
| canChangeDurationTime | 子タスクの継続時間を変更していいかを判定する。オーナーならOK、他人ならNGという条件をチェックする係 | Account + Task |
| canChangeStatus | 子タスクのステータスを変更していいかを判定する。オーナーならOK、他人ならNGという条件をチェックする係 | Account + Task |

### 集約境界とトランザクション境界

### 集約とトランザクションの関係

このシステムでは、**集約（Aggregate）の境界＝トランザクション境界**とする。

| 集約 | トランザクション対象 | 理由 |
| --- | --- | --- |
| Task | task + taskitems | タスクと各子タスクは一体で管理。片方だけ更新されると不具合が発生 |
| Account | accountのみ | 単一エンティティで完結。他のエンティティとの同時更新は不要 |

### トランザクションが必要な操作

以下の操作ではトランザクションが必要です。

1. **集約の作成**
- Task作成：task + taskItemsを同時作成

1. **集約の更新**
- Task更新：存在確認+task+taskItemsの更新

1. **集約の削除**
- Task削除：存在確認+task+taskItemsの削除

### トランザクション不要な操作

以下の操作ではトランザクションは不要です：

1. **読み取り専用のクエリ**
- Task一覧取得
- Account取得

1. **単一エンティティの操作**
- Accountのプロフィール更新（単一テーブルの更新）

