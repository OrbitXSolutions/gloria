import { Metadata } from "next";
import { getLocale } from "next-intl/server";

export interface ProductsPageParams {
  query: string;
  categorySlug?: string;
  page: number;
  limit: number;
  sort?: "created_at" | "name" | "price" | "total_rates";
  order?: "asc" | "desc";
}

export function parseProductsPageParams(searchParams: Record<string, string>) {
  const searchParamsObj = new URLSearchParams(searchParams);

  const pageParam = searchParamsObj.get("page");
  const limitParam = searchParamsObj.get("limit");

  return {
    queryString: searchParamsObj.get("q") || "",
    category_slug: searchParamsObj.get("category") ?? undefined,
    page: pageParam !== null ? Number.parseInt(pageParam) : undefined,
    limit: limitParam !== null ? Number.parseInt(limitParam) : undefined,
    sort: searchParamsObj.get("sort") as
      | "created_at"
      | "name"
      | "price"
      | "total_rates"
      | undefined,
    order: searchParamsObj.get("order") as "asc" | "desc" | undefined,
  };
}

export async function generateProductsPageMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const title = locale === "ar" ? "المنتجات - جلوريا" : "Products - Gloria";
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

export function calculateHasMore(
  total: number,
  page: number,
  limit: number
): boolean {
  return total > page * limit;
}
