"use client";

interface SidebarMenuItem {
  label: string;
  path: string;
}

const SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
  {
    label: "マイタスク一覧",
    path: "/tasks",
  },
  {
    label: "今日のタスク",
    path: "/tasks/today",
  },
];

interface SidebarPresenterProps {
  onNavigate: (path: string) => void;
}

export function SidebarPresenter({ onNavigate }: SidebarPresenterProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-4 space-y-2">
        {SIDEBAR_MENU_ITEMS.map((item) => (
          <button
            type="button"
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className="w-full text-left px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded"
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

