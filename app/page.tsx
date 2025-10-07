import Image from "next/image";
import Link from "next/link";
import { Instagram, MapPin } from "lucide-react";

const HomePage = () => {
  return (
    <div className="relative flex h-full min-h-screen flex-col justify-center overflow-hidden bg-background">
      <header className="flex justify-center pb-5 pt-10 md:pb-12 md:pt-20">
        <div className="logo-glow animate-fade-in-up flex flex-col items-center justify-center">
          <Image
            src="/assets/images/android-chrome-192x192.png"
            alt="کافه ماین - mine cafe"
            width={120}
            height={120}
            className="object-contain"
            priority
          />
          <h1 className="text-7xl font-bold tracking-widest text-black md:text-8xl">
            MINE
          </h1>
        </div>
      </header>

      <main className="flex flex-col items-center px-14 md:px-8">
        <div className="animate-fade-in-up stagger-1 space-y-8 text-center md:space-y-8">
          <p className="persian-text mx-auto max-w-sm text-xl font-semibold leading-relaxed text-accent md:max-w-md md:text-2xl">
            به کافه ماین خوش امدید
          </p>
          <h2 className="persian-text mb-2 text-xl font-light text-foreground md:mb-4 md:text-3xl">
            با مجموعه ای از تلخی ها و شیرینی ها در کنار شما هستیم
          </h2>
        </div>

        <div className="stagger-2 mt-10 w-full max-w-md animate-fade-in-up md:mt-12">
          <Link
            href="/menu"
            className="group block w-full cursor-pointer text-center transition-all duration-300 hover:scale-105"
          >
            <div className="mb-5 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transition-colors duration-300 group-hover:via-primary md:mb-6" />
            <div className="persian-text text-xl font-semibold text-accent transition-colors duration-300 group-hover:text-primary md:text-2xl">
              <span>منوی کافه</span>
            </div>
            <div className="mt-5 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent transition-colors duration-300 group-hover:via-primary md:mt-6" />
          </Link>
        </div>

        <div className="stagger-3 pt-10 text-center animate-fade-in-up md:pt-16">
          <blockquote className="persian-text flex items-center justify-center text-base font-light italic text-muted-foreground md:text-lg">
            <div className="flex space-x-6 rtl:space-x-reverse">
              <a
                href="https://www.instagram.com/_cafe.mine_?igsh=MXUydXhzOXRzaHpweQ=="
                className="bg-transparent flex h-12 w-12 items-center justify-center rounded-full backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white/70"
                aria-label="اینستاگرام"
              >
                <Instagram className="h-5 w-5 text-black" />
              </a>
              <a
                href="https://maps.app.goo.gl/K7X7sTpGryTWTQJW8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent flex h-12 w-12 items-center justify-center rounded-full backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white/70"
                aria-label="لوکیشن کافه"
              >
                <MapPin className="h-5 w-5 text-black" />
              </a>
            </div>
          </blockquote>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
