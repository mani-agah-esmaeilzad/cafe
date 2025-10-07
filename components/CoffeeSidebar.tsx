import Image from "next/image";

type SidebarCategory = {
  id: number;
  name: string;
  items: {
    id: number;
    imageUrl?: string | null;
    persianName: string;
  }[];
};

const CoffeeSidebar = ({ categories }: { categories: SidebarCategory[] }) => {
  return (
    <aside className="flex w-16 flex-shrink-0 flex-col border-l border-border bg-background py-4">
      <div className="flex flex-col items-center space-y-4">
        {categories.length === 0 ? (
          <span className="persian-text text-[11px] text-muted-foreground">بدون آیتم</span>
        ) : null}
        {categories.map((category) => {
          const representative = category.items.find((item) => item.imageUrl) ?? category.items[0];
          return (
            <div key={category.id} className="group flex cursor-pointer flex-col items-center" title={category.name}>
              <div className="h-12 w-12 overflow-hidden rounded-full bg-accent/20 p-2 transition-colors group-hover:bg-accent/40">
                {representative?.imageUrl ? (
                  <Image
                    src={representative.imageUrl}
                    alt={representative.persianName}
                    width={48}
                    height={48}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-coffee text-xs font-bold text-coffee-cream">
                    {category.name.at(0)}
                  </div>
                )}
              </div>
              <span className="mt-1 w-14 break-words text-center text-[10px] leading-tight text-foreground">
                {category.name}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default CoffeeSidebar;
