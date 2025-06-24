import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import AppHeader from "@/components/organisms/layout/app-header.component";
import { getLocale } from "next-intl/server";
import { RootWrapper } from "@/components/_core/wrappers/root-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Eleva - Premium Fragrances for Every Occasion",
    template: "%s | Eleva",
  },
  description:
    "Discover our exquisite collection of premium perfumes. Fast delivery, 14-day returns, and authentic fragrances from top brands.",
  keywords: [
    "perfumes",
    "fragrances",
    "luxury perfumes",
    "designer perfumes",
    "cologne",
    "eau de parfum",
    "beauty",
    "cosmetics",
  ],
  authors: [{ name: "Eleva" }],
  creator: "Eleva",
  publisher: "Eleva",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://eleva-store.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/?lang=en",
      ar: "/?lang=ar",
    },
  },
  openGraph: {
    title: "Eleva - Premium Fragrances for Every Occasion",
    description:
      "Discover our exquisite collection of premium perfumes. Fast delivery, 14-day returns, and authentic fragrances from top brands.",
    url: "https://eleva-store.vercel.app",
    siteName: "Eleva",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Eleva - Premium Fragrances",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eleva - Premium Fragrances",
    description: "Discover our exquisite collection of premium perfumes",
    images: ["/og-image.jpg"],
    creator: "@eleva",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};
interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootWrapper>
          <AppHeader />
          {children}
        </RootWrapper>
      </body>
    </html>
  );
}
