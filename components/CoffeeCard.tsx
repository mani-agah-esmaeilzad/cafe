import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface CoffeeCardProps {
  image?: string | null;
  persianName: string;
  englishName?: string;
  singlePrice?: string;
  doublePrice?: string;
  description?: string;
}

const CoffeeCard = ({ 
  image, 
  persianName, 
  englishName, 
  singlePrice, 
  doublePrice, 
  description 
}: CoffeeCardProps) => {
  return (
    <Card className="coffee-card border-0 bg-card transition-all duration-300 shadow-sm hover:shadow-md">
      <CardContent className="p-4 md:p-6">
        {/* Mobile/Tablet optimized layout */}
        <div className="flex items-start gap-4">
          {/* Coffee Image */}
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-accent/10 md:h-24 md:w-24">
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
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
              {/* Title & English Name */}
              <div className="text-right">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
                  {persianName}
                </h3>
                {englishName ? (
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {englishName}
                  </p>
                ) : null}
              </div>
              
              {/* Prices */}
              {(singlePrice || doublePrice) ? (
                <div className="flex gap-2 flex-shrink-0">
                  {singlePrice ? (
                    <div className="text-center min-w-0">
                      <p className="text-xs text-muted-foreground">تک شات</p>
                      <p className="font-bold text-sm text-coffee-dark">{singlePrice}</p>
                    </div>
                  ) : null}
                  {doublePrice ? (
                    <div className="text-center min-w-0">
                      <p className="text-xs text-muted-foreground">جفت شات</p>
                      <p className="font-bold text-sm text-coffee-dark">{doublePrice}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            
            {/* Description */}
            {description ? (
              <p className="text-xs text-muted-foreground leading-relaxed mt-3 text-right">
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
