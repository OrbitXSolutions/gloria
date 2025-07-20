"use server";
import { createSsrClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/common/supabase-queries";
import { queryProductsAction } from "@/app/_actions/query-products";
import { ProductsPageParams } from "@/lib/utils/products-page-utils";
import { notFound } from "next/navigation";

export interface ProductsPageData {
    products: any[];
    categories: any[];
    total: number;
    hasMore: boolean;
}

export async function fetchProductsPageData(
    params: ProductsPageParams
): Promise<ProductsPageData> {
    const supabase = await createSsrClient();

    // Get user for personalized data (if needed for future use)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Fetch products and categories in parallel
    const [categories, productsResult] = await Promise.all([
        getCategories(),
        queryProductsAction({
            queryString: params.query,
            category_slug: params.categorySlug,
            page: params.page,
            limit: params.limit,
            sort: params.sort,
            order: params.order,
        }),
    ]);

    if (!productsResult?.data) {
        notFound();
    }

    const { data: paginatedProducts } = productsResult;
    const hasMore = paginatedProducts.total > params.page * params.limit;

    return {
        products: paginatedProducts.data ?? [],
        categories: categories?.sort((a, b) => a.id - b.id) ?? [],
        total: paginatedProducts.total,
        hasMore,
    };
} 