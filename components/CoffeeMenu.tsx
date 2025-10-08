"use client";

import CoffeeCard from "./CoffeeCard";

type MenuItemOption = {
  id: number;
  label: string;
  price: number;
};

type MenuCategory = {
  id: number;
  name: string;
  description?: string | null;
  items: {
    id: number;
    persianName: string;
    englishName?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    options: MenuItemOption[];
  }[];
};

type CoffeeMenuProps = {
  categories: MenuCategory[];
  isFiltered?: boolean;
};

const CoffeeMenu = ({ categories, isFiltered = false }: CoffeeMenuProps) => {
  const categoriesToRender = isFiltered ? categories : categories.filter((category) => category.items.length > 0);
  const noItems = categoriesToRender.length === 0;

  return (
    <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        {noItems ? (
          <p className="persian-text text-center text-muted-foreground">
            {isFiltered ? "برای این دسته هنوز محصولی ثبت نشده است." : "هنوز محصولی در منو ثبت نشده است."}
          </p>
        ) : null}

        {categoriesToRender.map((category) => (
          <section key={category.id} className="space-y-4">
            <header className="flex items-center justify-between gap-4">
              <div>
                <h2 className="persian-text text-2xl font-bold text-foreground">{category.name}</h2>
                {category.description ? (
                  <p className="persian-text text-sm text-muted-foreground">{category.description}</p>
                ) : null}
              </div>
            </header>
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              {category.items.map((item) => {
                const options = item.options?.length
                  ? item.options.map((option) => ({
                      label: option.label,
                      price: option.price.toLocaleString("fa-IR"),
                    }))
                  : [];

                return (
                  <CoffeeCard
                    key={item.id}
                    image={item.imageUrl}
                    persianName={item.persianName}
                    englishName={item.englishName ?? undefined}
                    options={options}
                    description={item.description ?? undefined}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default CoffeeMenu;
