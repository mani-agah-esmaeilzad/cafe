"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type SidebarCategory = {
  id: number;
  name: string;
  imageUrl?: string | null;
};

type CoffeeSidebarProps = {
  categories: SidebarCategory[];
  activeCategoryId: number | "all";
  onSelect: (categoryId: number | "all") => void;
};

const CoffeeSidebar = ({ categories, activeCategoryId, onSelect }: CoffeeSidebarProps) => {
  return (
    <aside className="flex w-20 flex-shrink-0 flex-col border-l border-border bg-background/95 py-6 backdrop-blur-lg">
      <div className="flex flex-col items-center gap-5">
        <button
          onClick={() => onSelect("all")}
          className={cn(
            "group flex flex-col items-center gap-2 text-xs transition-all",
            activeCategoryId === "all" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card/70 transition-all duration-300",
              activeCategoryId === "all" && "border-primary shadow-[0_0_0_3px_rgba(214,158,63,0.25)]"
            )}
          >
            <span className="persian-text text-sm font-semibold">همه</span>
          </div>
          <span className="persian-text text-[11px]">همه</span>
        </button>
        {categories.length === 0 ? (
          <span className="persian-text text-[11px] text-muted-foreground">بدون آیتم</span>
        ) : null}
        {categories.map((category) => (
          <button
            key={category.id}
            title={category.name}
            onClick={() => onSelect(category.id)}
            className={cn(
              "group flex flex-col items-center gap-2 text-xs transition-all",
              activeCategoryId === category.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "relative h-12 w-12 overflow-hidden rounded-xl border border-border bg-card/70 shadow-sm transition-all duration-300",
                activeCategoryId === category.id && "border-primary shadow-[0_0_0_3px_rgba(214,158,63,0.25)]"
              )}
            >
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-coffee text-sm font-bold text-coffee-cream">
                  {category.name.at(0)}
                </div>
              )}
              <div className="absolute inset-0 rounded-xl border border-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <span className="persian-text w-16 break-words text-center text-[11px] leading-tight">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default CoffeeSidebar;
