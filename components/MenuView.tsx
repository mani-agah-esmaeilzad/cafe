"use client";

import { useState } from "react";
import CoffeeSidebar from "@/components/CoffeeSidebar";
import CoffeeMenu from "@/components/CoffeeMenu";
import AssistantIntroDialog from "@/components/AssistantIntroDialog";
import FloatingAssistant from "@/components/FloatingAssistant";

type MenuItemOption = {
  id: number;
  label: string;
  price: number;
};

type MenuItem = {
  id: number;
  persianName: string;
  englishName?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  options: MenuItemOption[];
};

type MenuCategory = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  items: MenuItem[];
};

type MenuViewProps = {
  categories: MenuCategory[];
};

const MenuView = ({ categories }: MenuViewProps) => {
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">("all");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const openAssistant = () => {
    setIsAssistantOpen(true);
  };

  const filteredCategories =
    activeCategoryId === "all"
      ? categories
      : categories.filter((category) => category.id === activeCategoryId);

  return (
    <div className="space-y-6 px-3 pb-6 md:px-4 lg:px-6">
      <div className="flex w-full gap-4">
        <CoffeeSidebar
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            imageUrl: category.imageUrl,
          }))}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />
        <div className="flex-1">
          <CoffeeMenu categories={filteredCategories} isFiltered={activeCategoryId !== "all"} />
        </div>
      </div>
      <AssistantIntroDialog onConfirm={openAssistant} />
      <FloatingAssistant open={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
    </div>
  );
};

export default MenuView;
