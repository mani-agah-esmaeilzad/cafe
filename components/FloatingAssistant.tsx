"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import MenuAssistant from "@/components/MenuAssistant";

type FloatingAssistantProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FOOTER_ID = "contact-footer";

const FloatingAssistant = ({ open, onOpenChange }: FloatingAssistantProps) => {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const footer = document.getElementById(FOOTER_ID);
    if (!footer) return;

    const observer = new IntersectionObserver(
      (entries) => setIsFooterVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.15 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const cardOffset = isFooterVisible ? "bottom-48 md:bottom-56" : "bottom-28 md:bottom-32";
  const buttonOffset = isFooterVisible ? "bottom-20 md:bottom-24" : "bottom-6 md:bottom-8";

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed right-4 z-40 w-[min(28rem,calc(100vw-2rem))] transition-all duration-300 md:right-8",
          cardOffset,
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <div className="pointer-events-auto rounded-3xl bg-background/95 p-1 shadow-2xl ring-1 ring-black/5 backdrop-blur">
          <MenuAssistant />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          "fixed right-4 z-50 group flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-white shadow-lg transition-all md:right-8",
          buttonOffset,
          "hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          open && "bg-primary/90"
        )}
        aria-label="گفتگو با باریستای هوشمند"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 text-white">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div className="text-right">
          <p className="persian-text text-sm font-semibold">باریستای هوشمند</p>
          <p className="persian-text text-[11px] text-white/80">با ذائقه‌ات سفارش بده</p>
        </div>
      </button>
    </>
  );
};

export default FloatingAssistant;
