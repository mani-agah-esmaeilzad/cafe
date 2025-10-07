import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "کافه ماین",
  description: "کافه ماین - تجربه‌ای گرم و دلنشین از طعم قهوه",
};

const vazir = localFont({
  src: [
    {
      path: "../public/fonts/Vazir-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.variable} bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
