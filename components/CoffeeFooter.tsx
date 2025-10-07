import Image from "next/image";
import { Phone, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

const COFFEE_LOGO = "/assets/images/android-chrome-192x192.png";

const CoffeeFooter = () => {
  return (
    <footer className="w-full bg-black py-8 text-white">
      <div className="container mx-auto px-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coffee-cream/90 backdrop-blur-sm">
              <Image
                src={COFFEE_LOGO}
                alt="کافه ماین - mine cafe"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>  
          <h2 className="text-lg font-bold text-coffee-cream">کافه ماین</h2>
          <p className="text-sm text-coffee-cream/80">MINE CAFE</p>
        </div>
        {/* Location Info */}
        <div className="mx-auto max-w-md space-y-4">
          {/* Phone */}
          <div className="flex items-center justify-center gap-3">
            <Phone className="h-4 w-4 flex-shrink-0 text-coffee-cream" />
            <a 
              href="tel:+989054291840" 
              className="text-coffee-cream hover:opacity-80 transition-colors"
            >
              09054291840
            </a>
          </div>

          {/* Address */}
          <div className="flex justify-center gap-3">
            <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-coffee-cream" />
            <p className="text-center text-sm text-coffee-cream">
              مهرشهر , ساماندهی , میدان پلیس , بلوار ایمان , کافه ماین
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 pt-4">
            <a 
              href="https://maps.app.goo.gl/K7X7sTpGryTWTQJW8" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2 border-coffee-cream bg-transparent text-coffee-cream hover:bg-coffee-cream hover:text-black">
                <Navigation className="h-4 w-4" />
                مسیریابی
              </Button>
            </a>
            <a href="tel:+989054291840">
              <Button size="sm" className="gap-2 bg-coffee-cream text-black hover:bg-coffee-cream/80">
                <Phone className="h-4 w-4" />
                تماس
              </Button>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-coffee-cream/20 pt-4">
          <p className="text-xs text-coffee-cream/60">
            © ۱۴۰۳ کافه ماین. تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CoffeeFooter;
