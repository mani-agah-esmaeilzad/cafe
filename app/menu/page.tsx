import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CoffeeFooter from "@/components/CoffeeFooter";
import CoffeeHero from "@/components/CoffeeHero";
import CoffeeMenu from "@/components/CoffeeMenu";
import CoffeeSidebar from "@/components/CoffeeSidebar";
import MenuAssistant from "@/components/MenuAssistant";

export const dynamic = "force-dynamic";

const MenuPage = async () => {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const visibleCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        imageUrl: item.imageUrl || undefined,
      })),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-background">
    
      <CoffeeHero />

      <div className="flex min-h-0 flex-1">
        <CoffeeSidebar categories={visibleCategories} />
        <div className="flex-1 overflow-hidden">
          <CoffeeMenu categories={visibleCategories} />
          <div className="px-3 pb-6 md:px-4 lg:px-6">
            <MenuAssistant />
          </div>
        </div>
      </div>

      <CoffeeFooter />
    </div>
  );
};

export default MenuPage;
