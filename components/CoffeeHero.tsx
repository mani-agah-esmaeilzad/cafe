import Image from "next/image";
import { Instagram } from "lucide-react";

const HERO_BACKGROUND = "/assets/images/hero-bg.jpg";
const COFFEE_LOGO = "/assets/images/android-chrome-192x192.png";

const CoffeeHero = () => {
  return (
    <div className="w-full">
      {/* Minimal black header bar */}
      <header className="flex h-12 w-full items-center justify-between bg-black px-5 md:h-16">
        <span className="text-base font-semibold text-coffee-cream md:text-lg">MINE</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coffee-cream/90 backdrop-blur-sm md:h-10 md:w-10">
          <Image
            src={COFFEE_LOGO}
            alt="کافه ماین - mine cafe"
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
      </header>

      {/* Hero section */}
      <section
        className="coffee-hero flex min-h-[16rem] items-center justify-center overflow-hidden text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url(${HERO_BACKGROUND})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 py-10 text-center md:py-14">
          <h1 className="mb-2 text-3xl font-bold text-coffee-cream md:text-4xl">MINE</h1>
          <p className="mb-6 text-sm text-coffee-cream/80 md:text-lg">MINE IS YOURS</p>
          <div className="flex justify-center">
            <a
              href="https://www.instagram.com/_cafe.mine_?igsh=MXUydXhzOXRzaHpweQ=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-icon flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-transparent"
            >
              <Instagram className="h-5 w-5 text-coffee-cream" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoffeeHero;
