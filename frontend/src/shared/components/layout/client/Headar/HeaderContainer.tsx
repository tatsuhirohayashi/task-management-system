"use client";

import { HeaderPresenter } from "./HeaderPresenter";
import { useHeader } from "./useHeader";

export function HeaderContainer() {
  const { handleLogout, handleNavigateHome } = useHeader();

  return (
    <HeaderPresenter
      onLogout={handleLogout}
      onNavigateHome={handleNavigateHome}
    />
  );
}

