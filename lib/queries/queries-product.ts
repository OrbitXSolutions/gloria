type FilterProductsRpcResult = {
    data: ProductWithUserData[];
    total: number;
    page: number;
    limit: number;
};

type FilterProductsRpcArgs = {
    p_page: number;
    p_page_size: number;
    p_sort_by: string;
    p_sort_order: boolean;
    p_show_deleted: boolean;
    p_query_string: string | null;
    p_category_id: string | null;
    p_category_slug: string | null;
    p_min_price: string | null;
    p_max_price: string | null;
    p_user_id: string | null;
};
import { createSsrClient } from "@/lib/supabase/server";
import createClient from "@/lib/supabase/client";
import { PaginatedResponse } from "@/lib/types/query/query";
import { ProductWithUserData } from "@/lib/types/database.types";


export interface ProductFilterParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: boolean;
    showDeleted?: boolean;
    queryString?: string;
    categoryId?: string;
    categorySlug?: string;
    minPrice?: string;
    maxPrice?: string;
}

export async function filterProducts(params: ProductFilterParams): Promise<PaginatedResponse<ProductWithUserData>> {
    const {
        page = 1,
        pageSize = 99,
        sortBy = "created_at",
        sortOrder = false,
        showDeleted = false,
        queryString,
        categoryId,
        categorySlug,
        minPrice,
        maxPrice,
    } = params;

    const supabase = createClient();

    // Get user for personalized data
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc('filter_products', {
        p_page: page,
        p_page_size: pageSize,
        p_sort_by: sortBy,
        p_sort_order: sortOrder,
        p_show_deleted: showDeleted,
        p_query_string: queryString ?? null,
        p_category_id: categoryId ?? null,
        p_category_slug: categorySlug ?? null,
        p_min_price: minPrice ?? null,
        p_max_price: maxPrice ?? null,
        p_user_id: user?.id ?? null,
    } as any);

    if (error) throw error;

    // The backend function returns: { data: any[]; total: number; page: number; limit: number; }
    const rpcResult = data as FilterProductsRpcResult | null;
    return {
        data: rpcResult?.data ?? [],
        total: rpcResult?.total ?? 0,
        page: rpcResult?.page ?? page,
        limit: rpcResult?.limit ?? pageSize,
    };
} 