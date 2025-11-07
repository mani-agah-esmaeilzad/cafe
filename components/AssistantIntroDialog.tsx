"use client";

import { useEffect, useState } from "react";
import { Sparkles, MessageSquareText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mine-ai-assistant-intro";

type AssistantIntroDialogProps = {
  onConfirm?: () => void;
};

const AssistantIntroDialog = ({ onConfirm }: AssistantIntroDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (seen) return;

    const timer = window.setTimeout(() => setIsOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const markAsSeen = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "seen");
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      markAsSeen();
    } else {
      setIsOpen(true);
    }
  };

  const handleConfirm = () => {
    markAsSeen();
    onConfirm?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="persian-text text-right sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold text-primary">باریستای هوشمند آماده‌ست</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            برای هر سوالی درباره منو، سلیقه‌ات یا انتخاب نوشیدنی، از باریستای هوشمند ماین کمک بگیر. پایین همین صفحه
            بخش «گفتگو با باریستای هوشمند» منتظرته.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 text-sm text-primary/90">
          <div className="flex items-center gap-2 font-semibold">
            <MessageSquareText className="h-4 w-4" />
            <span>چی می‌تونی بپرسی؟</span>
          </div>
          <ul className="mt-2 list-disc space-y-1 pr-5 text-xs text-primary/80">
            <li>پیشنهاد نوشیدنی با طعم یا دمای دلخواهت</li>
            <li>سوال درباره ترکیبات یا قیمت‌ها</li>
            <li>مقایسه بین چند گزینه از منو</li>
          </ul>
        </div>
        <DialogFooter className="gap-2 sm:justify-start">
          <Button onClick={handleConfirm} className="flex-1">
            الان امتحانش می‌کنم
          </Button>
          <Button variant="ghost" onClick={markAsSeen} className="flex-1 text-muted-foreground">
            بعداً
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssistantIntroDialog;
