import type { Metadata } from "next";
import { Suspense } from "react";

import ProductsPageClient from "./ProductsPageClient";
import { searchProducts, getCategories } from "@/lib/common/supabase-queries";

import { createSsrClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const locale = await getLocale();

  const title = locale === "ar" ? "المنتجات - إليفا" : "Products - Eleva";
  const description =
    locale === "ar"
      ? "تصفح مجموعتنا الكاملة من العطور الفاخرة. اعثر على عطرك المثالي من أفضل العلامات التجارية العالمية."
      : "Browse our complete collection of premium fragrances. Find your perfect scent from the world's finest brands.";

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
      canonical: `/products?lang=${locale}`,
      languages: {
        en: "/products?lang=en",
        ar: "/products?lang=ar",
      },
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchParamsObj = new URLSearchParams(params as Record<string, string>);

  // Get search parameters
  const query = searchParamsObj.get("q") || "";
  const categorySlug = searchParamsObj.get("category") ?? undefined; // Changed from categoryId to categorySlug
  const page = Number.parseInt(searchParamsObj.get("page") || "1");
  const limit = 8; // Changed from 20 to 8
  const offset = (page - 1) * limit;

  // Get user for personalized data
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch products and categories
  const [categories] = await Promise.all([getCategories()]);

  const products = await searchProducts(query, categorySlug, limit, offset);

  return (
    <ProductsPageClient
      initialProducts={products}
      categories={categories?.sort((a, b) => a.id - b.id)}
      initialQuery={query}
      initialCategorySlug={categorySlug}
      currentPage={page}
      hasMore={products.length === limit}
    />
  );
}
