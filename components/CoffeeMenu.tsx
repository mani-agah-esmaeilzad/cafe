import CoffeeCard from "./CoffeeCard";

type MenuCategory = {
  id: number;
  name: string;
  items: {
    id: number;
    persianName: string;
    englishName?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    priceSingle?: number | null;
    priceDouble?: number | null;
  }[];
};

const formatPrice = (value?: number | null) => {
  if (value === null || value === undefined) return undefined;
  return value.toLocaleString("fa-IR");
};

const CoffeeMenu = ({ categories }: { categories: MenuCategory[] }) => {
  return (
    <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {categories.length === 0 ? (
          <p className="persian-text text-center text-muted-foreground">هنوز محصولی در منو ثبت نشده است.</p>
        ) : null}
        {categories.map((category) => (
          <section key={category.id} className="space-y-4">
            <header>
              <h2 className="persian-text text-2xl font-bold text-foreground">{category.name}</h2>
            </header>
            <div className="space-y-3 md:space-y-4 lg:space-y-6">
              {category.items.map((item) => (
                <CoffeeCard
                  key={item.id}
                  image={item.imageUrl}
                  persianName={item.persianName}
                  englishName={item.englishName ?? ""}
                  singlePrice={formatPrice(item.priceSingle)}
                  doublePrice={formatPrice(item.priceDouble)}
                  description={item.description ?? ""}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
};

export default CoffeeMenu;
