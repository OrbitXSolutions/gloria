import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";
import {
  generateProductsPageMetadata,
  parseProductsPageParams,
} from "@/lib/utils/products-page-utils";
import { queryProductsAction } from "../_actions/query-products";
import { getCategories } from "@/lib/common/supabase-queries";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  return generateProductsPageMetadata();
}

// Loading skeleton component
function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-64 bg-gray-200 animate-pulse" />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-8 w-1/3" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function Page({ searchParams }: PageProps) {
  try {
    const params = await searchParams;
    const pageParams = parseProductsPageParams(
      params as Record<string, string>
    );

    // Fetch data in parallel for better performance
    const [productsResult, categoriesResult] = await Promise.allSettled([
      queryProductsAction(pageParams),
      getCategories(),
    ]);

    // Handle products fetch result
    if (productsResult.status === "rejected") {
      console.error("Failed to fetch products:", productsResult.reason);
      throw new Error("Failed to fetch products");
    }

    const { data: products } = productsResult.value;
    if (!products) {
      throw new Error("No products data received");
    }

    // Handle categories fetch result
    if (categoriesResult.status === "rejected") {
      console.error("Failed to fetch categories:", categoriesResult.reason);
      throw new Error("Failed to fetch categories");
    }

    const categories = categoriesResult.value;

    return (
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsPageClient
          initialProducts={products.data ?? []}
          categories={categories}
          initialQuery={pageParams.queryString}
          initialCategorySlug={pageParams.category_slug}
          currentPage={pageParams.page ?? 1}
          hasMore={
            (products.total ?? 0) >
            (pageParams.page ?? 1) * (pageParams.limit ?? 8)
          }
          initialSort={pageParams.sort ?? "created_at"}
          initialOrder={pageParams.order ?? "desc"}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in products page:", error);

    // Return a user-friendly error page
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the products. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
}
