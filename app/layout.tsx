import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import AppHeader from "@/components/organisms/layout/app-header.component";
import { getLocale, getTranslations, getMessages } from "next-intl/server";
import { RootWrapper } from "@/components/_core/wrappers/root-wrapper";
import { Footer } from "react-day-picker";
import AppFooter from "@/components/organisms/layout/app-footer";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const brand = 'Eleva';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eleva-boutique.net';

  // Enhanced home page meta per SEO spec
  const titleHome = `Luxury Perfumes Online | ${brand} – Dubai & Worldwide`;
  const descriptionHome = 'Shop luxury, Arabic & niche perfumes online at Eleva. Premium fragrances, fast UAE delivery, worldwide shipping. Buy authentic scents in Dubai today.';

  return {
    title: {
      default: titleHome,
      template: `%s | ${brand}`,
    },
    description: descriptionHome,
    keywords: [
      'luxury perfumes',
      'Arabic perfumes',
      'niche fragrances',
      'buy perfume online Dubai',
      'UAE fragrances',
      'premium eau de parfum',
      'Eleva boutique'
    ],
    authors: [{ name: brand }],
    creator: brand,
    publisher: brand,
    formatDetection: { email: false, address: false, telephone: false },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: '/',
      languages: { en: '/?lang=en', ar: '/?lang=ar' },
    },
    openGraph: {
      title: titleHome,
      description: descriptionHome,
      url: baseUrl,
      siteName: brand,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: `${brand} Luxury Perfumes` }],
      locale: locale === 'ar' ? 'ar_AE' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleHome,
      description: descriptionHome,
      images: ['/og-image.jpg'],
      creator: '@eleva'
    },
    robots: { index: true, follow: true },
    verification: {
      google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || 'your-google-verification-code'
    }
  };
}
interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  children: React.ReactNode;
}

export default async function RootLayout({ children, searchParams }: Props) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <GoogleAnalytics gaId="G-VHR5QKPREW" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootWrapper messages={messages}>
          {/* Global Organization / WebSite JSON-LD */}
          <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                name: 'Eleva',
                url: 'https://eleva-boutique.net',
                logo: 'https://eleva-boutique.net/og-image.jpg',
                sameAs: [
                  'https://www.instagram.com/eleva.boutique_79',
                  'https://www.facebook.com/Eleva.Boutique79'
                ]
              },
              {
                '@type': 'WebSite',
                name: 'Eleva',
                url: 'https://eleva-boutique.net',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: 'https://eleva-boutique.net/products?q={search_term_string}',
                  'query-input': 'required name=search_term_string'
                }
              }
            ]
          })}</script>
          <AppHeader />
          <main>{children}</main>
          <AppFooter />
        </RootWrapper>
      </body>
    </html>
  );
}
