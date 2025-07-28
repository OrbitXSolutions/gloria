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
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    title: {
      default: t("title.default"),
      template: t("title.template"),
    },
    description: t("description"),
    keywords: t("keywords").split(","),
    authors: [{ name: "Eleva" }],
    creator: "Eleva",
    publisher: "Eleva",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL("https://eleva-boutique.net"),
    alternates: {
      canonical: "/",
      languages: {
        en: "/?lang=en",
        ar: "/?lang=ar",
      },
    },
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      url: "https://eleva-boutique.net",
      siteName: t("openGraph.siteName"),
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Eleva - Premium Fragrances",
        },
      ],
      locale: t("openGraph.locale"),
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitter.title"),
      description: t("twitter.description"),
      images: ["/og-image.jpg"],
      creator: t("twitter.creator"),
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
}
export const metadata: Metadata = {
  title: {
    default: "Gloria - Premium Fragrances for Every Occasion",
    template: "%s | Gloria",
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
  authors: [{ name: "Gloria" }],
  creator: "Gloria",
  publisher: "Gloria",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://glorianaturals.ae"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/?lang=en",
      ar: "/?lang=ar",
    },
  },
  openGraph: {
    title: "Gloria - Premium Fragrances for Every Occasion",
    description:
      "Discover our exquisite collection of premium perfumes. Fast delivery, 14-day returns, and authentic fragrances from top brands.",
    url: "https://glorianaturals.ae",
    siteName: "Gloria",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gloria - Premium Fragrances",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gloria - Premium Fragrances",
    description: "Discover our exquisite collection of premium perfumes",
    images: ["/og-image.jpg"],
    creator: "@gloria",
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
  // verification: {
  //   google: "your-google-verification-code",
  // },
};
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
      <GoogleAnalytics gaId="'G-9XCF65FS7X'" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootWrapper messages={messages}>
          <AppHeader />
          <main>{children}</main>
          <AppFooter />
        </RootWrapper>
      </body>
    </html>
  );
}
