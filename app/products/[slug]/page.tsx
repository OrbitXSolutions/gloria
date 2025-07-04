import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  getProductBySlug,
  getProductReviews,
} from "@/lib/common/supabase-queries";

import { createSsrClient } from "@/lib/supabase/server";
import { Header } from "@radix-ui/react-accordion";
import { Footer } from "react-day-picker";
import { Toaster } from "sonner";
import ProductDetailsClient from "./ProductDetailsClient";
import { useLocale } from "next-intl";
import { getProductImageUrl } from "@/lib/constants/supabase-storage";
import { getLocale } from "next-intl/server";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<URLSearchParams>;
}

export async function generateMetadata({
  params,
  searchParams: sp,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const searchParams = await sp;
  const locale = await getLocale();

  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const metaTitle =
    locale === "ar"
      ? product.meta_title_ar || product.name_ar
      : product.meta_title_en || product.name_en;
  const metaDescription =
    locale === "ar"
      ? product.meta_description_ar || product.description_ar
      : product.meta_description_en || product.description_en;

  const metaBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://eleva.com";

  let imageUrl = `${metaBaseUrl}/og-image.jpg`;
  if (product.meta_thumbnail) {
    imageUrl = getProductImageUrl(product.meta_thumbnail);
  } else if (product.primary_image) {
    imageUrl = getProductImageUrl(product.primary_image);
  }

  const images = [
    {
      url: imageUrl,
      width: 1200,
      height: 630,
      alt: metaTitle || "Product Image",
    },
  ];

  return {
    title: metaTitle || "Eleva Product",
    description: metaDescription || `Discover our premium product ${metaTitle}`,
    keywords:
      product.keywords ||
      ["perfume", "fragrance", "luxury", metaTitle].join(", "),
    alternates: {
      canonical: `/products/${slug}${locale !== "en" ? `?lang=${locale}` : ""}`,
      languages: {
        "en-US": `/products/${slug}?lang=en`,
        "ar-SA": `/products/${slug}?lang=ar`,
        "x-default": `/products/${slug}?lang=en`,
      },
    },
    openGraph: {
      title: metaTitle || "Eleva Product",
      description:
        metaDescription || `Discover our premium product ${metaTitle}`,
      url: `/products/${slug}${locale !== "en" ? `?lang=${locale}` : ""}`,
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: images,
      ...(product.price && {
        product: {
          price: {
            amount: product.price.toString(),
            currency: product.currency?.code || "USD",
          },
          availability:
            product.quantity && product.quantity > 0 ? "instock" : "oos",
        },
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle || "Eleva Product",
      description:
        metaDescription || `Discover our premium product ${metaTitle}`,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  // const localeFromParams = getLocaleFromSearchParams(await searchParams);

  // const translations = await getTranslations(locale);

  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [product, reviews] = await Promise.all([
    getProductBySlug(slug, user?.user_metadata?.user_id),
    getProductBySlug(slug).then((p) => (p ? getProductReviews(p.id, 10) : [])),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} reviews={reviews} />;
}
function getLocaleFromRequest(): any {
  throw new Error("Function not implemented.");
}
