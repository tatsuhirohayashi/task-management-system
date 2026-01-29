"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

interface BasicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
}

export function BasicModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel = "完了",
}: BasicModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="sm:max-w-[600px] flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* ヘッダー: タイトル */}
        <DialogHeader className="mb-4">
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        {/* コンテンツエリア */}
        <div className="flex-1 mb-4">{children}</div>

        {/* 下部フッター: 完了ボタン */}
        <div className="flex justify-center">
          <Button
            onClick={onSubmit}
            className="bg-black text-white hover:bg-gray-800 rounded-full px-6"
          >
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

