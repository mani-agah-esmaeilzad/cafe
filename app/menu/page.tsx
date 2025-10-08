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
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-md backdrop-blur transition hover:bg-card"
      >
        <ArrowRight className="h-4 w-4" />
        <span className="persian-text text-sm">بازگشت</span>
      </Link>

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
