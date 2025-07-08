import type { Metadata } from "next";
import { Suspense } from "react";

import CartPageClient from "./CartPageClient";

import { Header } from "@radix-ui/react-accordion";
import { Footer } from "react-day-picker";
import { getLocale } from "next-intl/server";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  // const params = await searchParams;
  // const searchParamsObj = new URLSearchParams(await params as Record<string, string>);
  const locale = await getLocale();

  const title =
    locale === "ar" ? "سلة التسوق - جلوريا" : "Shopping Cart - Gloria";
  const description =
    locale === "ar"
      ? "راجع عناصر سلة التسوق الخاصة بك وأكمل عملية الشراء"
      : "Review your cart items and complete your purchase";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/cart?lang=${locale}`,
      languages: {
        en: "/cart?lang=en",
        ar: "/cart?lang=ar",
      },
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
  return <CartPageClient />;
}
