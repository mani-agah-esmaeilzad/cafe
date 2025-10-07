import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import CoffeeFooter from "@/components/CoffeeFooter";
import CoffeeHero from "@/components/CoffeeHero";
import CoffeeMenu from "@/components/CoffeeMenu";
import CoffeeSidebar from "@/components/CoffeeSidebar";

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
        </div>
      </div>

      <CoffeeFooter />
    </div>
  );
};

export default MenuPage;
