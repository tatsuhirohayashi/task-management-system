"use client";

import React from "react";
import { Badge } from "@/shared/components/ui/badge";

export function RequiredBadge() {
  return (
    <Badge
      className="rounded-full bg-red-500 text-white border-transparent hover:bg-red-500"
    >
      必須
    </Badge>
  );
}

