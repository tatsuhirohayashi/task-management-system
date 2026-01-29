"use client";

import { Button } from "@/shared/components/ui/button";

interface LoginClientPresenterProps {
  onGoogleLogin: () => void;
}

export function LoginClientPresenter({
  onGoogleLogin,
}: LoginClientPresenterProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Button
        type="button"
        variant="outline"
        className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-900"
        onClick={onGoogleLogin}
      >
        Googleログイン
      </Button>
    </div>
  );
}