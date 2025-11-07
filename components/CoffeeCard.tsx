import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type PriceOptionDisplay = {
  label: string;
  price: string;
};

interface CoffeeCardProps {
  image?: string | null;
  persianName: string;
  englishName?: string;
  options?: PriceOptionDisplay[];
  description?: string;
}

const CoffeeCard = ({ image, persianName, englishName, options, description }: CoffeeCardProps) => {
  const hasOptions = options && options.length > 0;

  return (
    <Card className="coffee-card group relative overflow-hidden border-0 bg-card/95 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-60" />
      <CardContent className="relative p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row-reverse md:items-stretch md:gap-6">
          <div className="flex w-full flex-col gap-3 text-right md:w-48">
            <div className="relative w-full overflow-hidden rounded-3xl border border-border bg-muted/40 shadow-inner">
              {image ? (
                <Image
                  src={image}
                  alt={persianName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  width={192}
                  height={192}
                  sizes="(min-width: 768px) 192px, 100vw"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-gradient-gold text-2xl font-bold text-foreground md:h-44">
                  {persianName.at(0)}
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent" />
            </div>

            {description ? (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-3 shadow-sm">
                <p className="persian-text text-right text-xs leading-relaxed text-muted-foreground md:text-sm">{description}</p>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-5 text-right">
            <div>
              <h3 className="text-xl font-bold text-foreground md:text-2xl">{persianName}</h3>
              {englishName ? (
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{englishName}</p>
              ) : null}
            </div>

            {hasOptions ? (
              <div className="flex flex-wrap justify-end gap-2">
                {options!.map((option, index) => (
                  <span
                    key={`${option.label}-${index}`}
                    className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {option.label}: {option.price} تومان
                  </span>
                ))}
              </div>
            ) : (
              <span className="persian-text text-xs text-muted-foreground">قیمت این محصول هنوز ثبت نشده است.</span>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] text-muted-foreground">
              <span className="persian-text">سرو تازه</span>
              <span className="h-px w-8 bg-border" aria-hidden />
              <span className="persian-text">تهیه با دقت باریستا</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoffeeCard;
