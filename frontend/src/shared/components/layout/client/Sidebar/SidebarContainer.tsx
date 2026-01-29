"use client";

import { SidebarPresenter } from "./SidebarPresenter";
import { useSidebar } from "./useSidebar";

export function SidebarContainer() {
  const { handleNavigate } = useSidebar();

  return <SidebarPresenter onNavigate={handleNavigate} />;
}

