import type { Metadata } from "next";


import ProductsPageClient from "./ProductsPageClient";
import {
  generateProductsPageMetadata,
  parseProductsPageParams
} from "@/lib/utils/products-page-utils";
import { queryProductsAction } from "../_actions/query-products";
import { ProductsQuerySchema } from "@/lib/schemas/query/products-query.schema";
import { getCategories } from "@/lib/common/supabase-queries";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  return generateProductsPageMetadata();
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const pageParams = parseProductsPageParams(params as Record<string, string>);
  const { data: products } = await queryProductsAction(pageParams);
  const categories = await getCategories();

  return (
    <ProductsPageClient
      initialProducts={products?.data ?? []}
      categories={categories}
      initialQuery={pageParams.query}
      initialCategorySlug={pageParams.categorySlug}
      currentPage={pageParams.page}
      hasMore={(products?.total ?? 0) > pageParams.page * pageParams.limit}
      initialSort={pageParams.sort ?? "created_at"}
      initialOrder={pageParams.order ?? "desc"}
    />
  );
}
