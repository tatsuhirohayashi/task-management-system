"use client";

import { Button } from "@/shared/components/ui/button";

interface HeaderPresenterProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export function HeaderPresenter({
  onLogout,
  onNavigateHome,
}: HeaderPresenterProps) {
  return (
    <header className="h-14 bg-black flex items-center justify-between px-6">
      <button
        type="button"
        onClick={onNavigateHome}
        className="text-white text-lg font-semibold hover:opacity-80 cursor-pointer"
      >
        TaskPat
      </button>
      <Button
        variant="outline"
        className="bg-white text-black hover:bg-gray-100 border-none"
        onClick={onLogout}
      >
        ログアウト
      </Button>
    </header>
  );
}

