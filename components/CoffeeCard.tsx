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
    <Card className="coffee-card border-0 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-accent/10 md:h-24 md:w-24">
            {image ? (
              <Image
                src={image}
                alt={persianName}
                className="h-full w-full object-cover"
                loading="lazy"
                width={96}
                height={96}
                sizes="(min-width: 768px) 96px, 80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-gold text-lg font-bold text-foreground">
                {persianName.at(0)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="text-right">
                <h3 className="mb-1 text-lg font-bold text-foreground md:text-xl">{persianName}</h3>
                {englishName ? (
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{englishName}</p>
                ) : null}
              </div>

              {hasOptions ? (
                <div className="flex flex-wrap justify-end gap-2 md:justify-start">
                  {options!.map((option, index) => (
                    <span
                      key={`${option.label}-${index}`}
                      className="price-badge rounded-full px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {option.label}: {option.price} ریال
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {description ? (
              <p className="persian-text mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoffeeCard;
