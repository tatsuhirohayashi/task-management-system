import { describe, it, expect } from "vitest";
import { taskKeys } from "./keys";
import type { TaskFilters } from "@/external/dto/task.dto";

describe("taskKeys", () => {
  describe("all", () => {
    it("ベースキーが正しく設定されている", () => {
      expect(taskKeys.all).toEqual(["notes"]);
    });

    it("ベースキーは定数として定義されている", () => {
      // as constで定義されているため、型レベルで読み取り専用
      expect(taskKeys.all).toEqual(["notes"]);
      // 配列の内容を変更しようとするとTypeScriptエラーになるが、
      // 実行時には変更可能なため、このテストでは値の確認のみ行う
    });
  });

  describe("lists", () => {
    it("リスト用のキーが正しく生成される", () => {
      const key = taskKeys.lists();
      expect(key).toEqual(["notes", "list"]);
    });

    it("allキーを含む階層構造になっている", () => {
      const key = taskKeys.lists();
      expect(key[0]).toBe(taskKeys.all[0]);
      expect(key[1]).toBe("list");
    });

    it("毎回新しい配列を返す", () => {
      const key1 = taskKeys.lists();
      const key2 = taskKeys.lists();
      expect(key1).toEqual(key2);
      expect(key1).not.toBe(key2); // 参照は異なるが値は同じ
    });
  });

  describe("list", () => {
    it("フィルターなしでキーが生成される", () => {
      const filters: TaskFilters = {};
      const key = taskKeys.list(filters);
      expect(key).toEqual(["notes", "list", {}]);
    });

    it("year-monthフィルターを含むキーが生成される", () => {
      const filters: TaskFilters = {
        "year-month": "2026-01",
      };
      const key = taskKeys.list(filters);
      expect(key).toEqual(["notes", "list", { "year-month": "2026-01" }]);
    });

    it("ownerIdフィルターを含むキーが生成される", () => {
      const filters: TaskFilters = {
        ownerId: "user-123",
      };
      const key = taskKeys.list(filters);
      expect(key).toEqual(["notes", "list", { ownerId: "user-123" }]);
    });

    it("qフィルターを含むキーが生成される", () => {
      const filters: TaskFilters = {
        q: "検索キーワード",
      };
      const key = taskKeys.list(filters);
      expect(key).toEqual(["notes", "list", { q: "検索キーワード" }]);
    });

    it("sortフィルターを含むキーが生成される", () => {
      const filters: TaskFilters = {
        sort: "oldest",
      };
      const key = taskKeys.list(filters);
      expect(key).toEqual(["notes", "list", { sort: "oldest" }]);
    });

    it("複数のフィルターを含むキーが生成される", () => {
      const filters: TaskFilters = {
        "year-month": "2026-01",
        ownerId: "user-123",
        q: "検索キーワード",
        sort: "oldest",
      };
      const key = taskKeys.list(filters);
      expect(key).toEqual([
        "notes",
        "list",
        {
          "year-month": "2026-01",
          ownerId: "user-123",
          q: "検索キーワード",
          sort: "oldest",
        },
      ]);
    });

    it("undefinedのフィルター値が含まれる", () => {
      const filters: TaskFilters = {
        "year-month": undefined,
        ownerId: "user-123",
      };
      const key = taskKeys.list(filters);
      expect(key).toEqual(["notes", "list", { "year-month": undefined, ownerId: "user-123" }]);
    });

    it("lists()の結果を含む階層構造になっている", () => {
      const filters: TaskFilters = { ownerId: "user-123" };
      const key = taskKeys.list(filters);
      const listsKey = taskKeys.lists();
      expect(key.slice(0, 2)).toEqual(listsKey);
      expect(key[2]).toEqual(filters);
    });

    it("同じフィルターで同じキーが生成される（値の等価性）", () => {
      const filters1: TaskFilters = {
        "year-month": "2026-01",
        ownerId: "user-123",
      };
      const filters2: TaskFilters = {
        "year-month": "2026-01",
        ownerId: "user-123",
      };
      const key1 = taskKeys.list(filters1);
      const key2 = taskKeys.list(filters2);
      expect(key1).toEqual(key2);
    });

    it("異なるフィルターで異なるキーが生成される", () => {
      const filters1: TaskFilters = {
        "year-month": "2026-01",
      };
      const filters2: TaskFilters = {
        "year-month": "2026-02",
      };
      const key1 = taskKeys.list(filters1);
      const key2 = taskKeys.list(filters2);
      expect(key1).not.toEqual(key2);
    });

    it("フィルターの順序が変わっても同じキーが生成される", () => {
      const filters1: TaskFilters = {
        "year-month": "2026-01",
        ownerId: "user-123",
      };
      const filters2: TaskFilters = {
        ownerId: "user-123",
        "year-month": "2026-01",
      };
      const key1 = taskKeys.list(filters1);
      const key2 = taskKeys.list(filters2);
      // オブジェクトの比較なので、順序が異なると値は異なるが、内容は同じ
      expect(key1[2]).not.toBe(key2[2]); // 参照は異なる
      // ただし、React Queryは深い比較を行うので、実際の使用では問題ない
      expect(key1[2]).toEqual(key2[2]); // 値は等しい
    });

    it("空のフィルターオブジェクトでキーが生成される", () => {
      const filters: TaskFilters = {};
      const key = taskKeys.list(filters);
      expect(key).toEqual(["notes", "list", {}]);
    });
  });

  describe("details", () => {
    it("詳細用のキーが正しく生成される", () => {
      const key = taskKeys.details();
      expect(key).toEqual(["notes", "detail"]);
    });

    it("allキーを含む階層構造になっている", () => {
      const key = taskKeys.details();
      expect(key[0]).toBe(taskKeys.all[0]);
      expect(key[1]).toBe("detail");
    });

    it("毎回新しい配列を返す", () => {
      const key1 = taskKeys.details();
      const key2 = taskKeys.details();
      expect(key1).toEqual(key2);
      expect(key1).not.toBe(key2); // 参照は異なるが値は同じ
    });

    it("lists()とは異なるキーを返す", () => {
      const detailsKey = taskKeys.details();
      const listsKey = taskKeys.lists();
      expect(detailsKey).not.toEqual(listsKey);
    });
  });

  describe("detail", () => {
    it("IDを含むキーが生成される", () => {
      const id = "task-123";
      const key = taskKeys.detail(id);
      expect(key).toEqual(["notes", "detail", "task-123"]);
    });

    it("UUID形式のIDでキーが生成される", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const key = taskKeys.detail(id);
      expect(key).toEqual(["notes", "detail", "550e8400-e29b-41d4-a716-446655440000"]);
    });

    it("異なるIDで異なるキーが生成される", () => {
      const key1 = taskKeys.detail("task-1");
      const key2 = taskKeys.detail("task-2");
      expect(key1).not.toEqual(key2);
    });

    it("同じIDで同じキーが生成される", () => {
      const id = "task-123";
      const key1 = taskKeys.detail(id);
      const key2 = taskKeys.detail(id);
      expect(key1).toEqual(key2);
    });

    it("details()の結果を含む階層構造になっている", () => {
      const id = "task-123";
      const key = taskKeys.detail(id);
      const detailsKey = taskKeys.details();
      expect(key.slice(0, 2)).toEqual(detailsKey);
      expect(key[2]).toBe(id);
    });

    it("空文字列のIDでキーが生成される", () => {
      const key = taskKeys.detail("");
      expect(key).toEqual(["notes", "detail", ""]);
    });

    it("長いIDでもキーが生成される", () => {
      const longId = "a".repeat(100);
      const key = taskKeys.detail(longId);
      expect(key).toEqual(["notes", "detail", longId]);
    });
  });

  describe("階層構造の整合性", () => {
    it("すべてのキーがallキーを含む", () => {
      const listsKey = taskKeys.lists();
      const detailsKey = taskKeys.details();
      const listKey = taskKeys.list({});
      const detailKey = taskKeys.detail("task-123");

      expect(listsKey[0]).toBe(taskKeys.all[0]);
      expect(detailsKey[0]).toBe(taskKeys.all[0]);
      expect(listKey[0]).toBe(taskKeys.all[0]);
      expect(detailKey[0]).toBe(taskKeys.all[0]);
    });

    it("listキーはlists()を含む", () => {
      const filters: TaskFilters = { ownerId: "user-123" };
      const listKey = taskKeys.list(filters);
      const listsKey = taskKeys.lists();
      expect(listKey.slice(0, 2)).toEqual(listsKey);
    });

    it("detailキーはdetails()を含む", () => {
      const detailKey = taskKeys.detail("task-123");
      const detailsKey = taskKeys.details();
      expect(detailKey.slice(0, 2)).toEqual(detailsKey);
    });

    it("階層構造が正しい順序になっている", () => {
      const listKey = taskKeys.list({ ownerId: "user-123" });
      const detailKey = taskKeys.detail("task-123");

      // listキーの構造: ["notes", "list", filters]
      expect(listKey.length).toBe(3);
      expect(listKey[0]).toBe("notes");
      expect(listKey[1]).toBe("list");
      expect(typeof listKey[2]).toBe("object");

      // detailキーの構造: ["notes", "detail", id]
      expect(detailKey.length).toBe(3);
      expect(detailKey[0]).toBe("notes");
      expect(detailKey[1]).toBe("detail");
      expect(typeof detailKey[2]).toBe("string");
    });
  });

  describe("React Queryとの互換性", () => {
    it("クエリキーとして使用できる形式になっている", () => {
      const listKey = taskKeys.list({ ownerId: "user-123" });
      const detailKey = taskKeys.detail("task-123");

      // React Queryのクエリキーは配列である必要がある
      expect(Array.isArray(listKey)).toBe(true);
      expect(Array.isArray(detailKey)).toBe(true);

      // すべての要素がシリアライズ可能である必要がある
      expect(() => JSON.stringify(listKey)).not.toThrow();
      expect(() => JSON.stringify(detailKey)).not.toThrow();
    });

    it("invalidateQueriesで使用できる", () => {
      const listsKey = taskKeys.lists();
      const detailsKey = taskKeys.details();
      const listKey = taskKeys.list({ ownerId: "user-123" });
      const detailKey = taskKeys.detail("task-123");

      // すべてのキーが配列であることを確認
      expect(Array.isArray(listsKey)).toBe(true);
      expect(Array.isArray(detailsKey)).toBe(true);
      expect(Array.isArray(listKey)).toBe(true);
      expect(Array.isArray(detailKey)).toBe(true);
    });
  });

  describe("エッジケース", () => {
    it("特殊文字を含むIDでキーが生成される", () => {
      const specialId = "task-123-特殊文字-!@#$%";
      const key = taskKeys.detail(specialId);
      expect(key).toEqual(["notes", "detail", specialId]);
    });

    it("数値のような文字列IDでキーが生成される", () => {
      const numericId = "123456";
      const key = taskKeys.detail(numericId);
      expect(key).toEqual(["notes", "detail", "123456"]);
    });

    it("すべてのフィルターがundefinedの場合", () => {
      const filters: TaskFilters = {
        "year-month": undefined,
        ownerId: undefined,
        q: undefined,
        sort: undefined,
      };
      const key = taskKeys.list(filters);
      expect(key).toEqual([
        "notes",
        "list",
        {
          "year-month": undefined,
          ownerId: undefined,
          q: undefined,
          sort: undefined,
        },
      ]);
    });

    it("非常に長い検索キーワードでキーが生成される", () => {
      const longQuery = "a".repeat(1000);
      const filters: TaskFilters = {
        q: longQuery,
      };
      const key = taskKeys.list(filters);
      expect(key).toEqual(["notes", "list", { q: longQuery }]);
    });
  });
});

