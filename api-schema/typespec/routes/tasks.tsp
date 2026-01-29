import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "../models/task.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;
using TaskManagement.Models.Task;
using TaskManagement.Models.Common;

namespace TaskManagement.Routes;

@route("/api/tasks")
@tag("Tasks")
interface Tasks {
  /** タスク一覧取得 */
  @get
  @summary("Get task list")
  @doc("タスク一覧を取得します。クエリパラメータでフィルタリング可能です。")
  listTasks(
    @query("year-month") yearMonth?: string,
    @query ownerId?: string,
    @query q?: string,
    @query sort?: string
  ): ListTaskResponse | UnauthorizedError;

  /** タスク作成 */
  @post
  @summary("Create task")
  @doc("新しいタスクを作成します。")
  createTask(
    @body request: CreateTaskRequest
  ): CreateTaskResponse | BadRequestError | UnauthorizedError;

  /** タスク詳細取得 */
  @get
  @route("/{taskId}")
  @summary("Get task by ID")
  @doc("タスクIDでタスクを取得します。")
  getTaskById(
    @path taskId: string
  ): TaskResponse | NotFoundError | UnauthorizedError;

  /** タスク更新 */
  @put
  @route("/{taskId}")
  @summary("Update task")
  @doc("タスクを更新します。自分が所有するタスクのみ更新可能です。")
  updateTask(
    @path taskId: string,
    @body request: UpdateTaskRequest
  ): UpdateTaskResponse | BadRequestError | NotFoundError | UnauthorizedError | ForbiddenError;

  /** タスク削除 */
  @delete
  @route("/{taskId}")
  @summary("Delete task")
  @doc("タスクを削除します。自分が所有するタスクのみ削除可能です。")
  deleteTask(
    @path taskId: string
  ): DeleteTaskResponse | NotFoundError | UnauthorizedError | ForbiddenError;

  /** タスク振り返り更新 */
  @put
  @route("/{taskId}/review")
  @summary("Update task review")
  @doc("タスクの振り返りを更新します。自分が所有するタスクのみ更新可能です。")
  updateTaskReview(
    @path taskId: string,
    @body request: UpdateTaskReviewRequest
  ): UpdateTaskReviewResponse | BadRequestError | NotFoundError | UnauthorizedError | ForbiddenError;
}

@route("/api/taskitems")
@tag("TaskItems")
interface TaskItems {
  /** 子タスクアウトプット更新 */
  @put
  @route("/{taskItemId}")
  @summary("Update task item output")
  @doc("子タスクのアウトプットを更新します。自分が所有する子タスクのみ更新可能です。アウトプットを更新するとステータスはCompletedになります。")
  updateTaskItemOutput(
    @path taskItemId: string,
    @body request: UpdateTaskItemOutputRequest
  ): UpdateTaskItemOutputResponse | BadRequestError | NotFoundError | UnauthorizedError | ForbiddenError;
}

