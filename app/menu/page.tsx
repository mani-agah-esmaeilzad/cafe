import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CoffeeFooter from "@/components/CoffeeFooter";
import CoffeeHero from "@/components/CoffeeHero";
import MenuView from "@/components/MenuView";

export const dynamic = "force-dynamic";

const MenuPage = async () => {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { createdAt: "asc" },
        include: {
          options: {
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });

  const formattedCategories = categories.map((category) => ({
    ...category,
    imageUrl: category.imageUrl || undefined,
    items: category.items.map((item) => ({
      ...item,
      imageUrl: item.imageUrl || undefined,
      options: item.options ?? [],
    })),
  }));

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

      <MenuView categories={formattedCategories} />

      <CoffeeFooter />
    </div>
  );
};

export default MenuPage;
