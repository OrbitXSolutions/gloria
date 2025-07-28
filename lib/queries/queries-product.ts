import { createSsrClient } from "@/lib/supabase/server";
import { PaginatedResponse } from "@/lib/types/query/query";
import { ProductWithUserData } from "@/lib/types/database.types";

// Helper function to build cart query - simplified to match actual database schema
async function buildCartQuery(supabase: any, userId: number, productIds: number[]) {
    return supabase
        .from("cart_items")
        .select("product_id, quantity")
        .eq("user_id", userId)
        .in("product_id", productIds);
}

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

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createSsrClient();

    // Get user for personalized data
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Build the base query
    let query = supabase
        .from("products")
        .select("*, category:categories(name_en, name_ar, slug, slug_ar), currency:currencies(*)", {
            count: "exact",
        });

    // Apply is_deleted filter
    if (!showDeleted) {
        query = query.eq("is_deleted", false);
    }

    // Apply queryString search filter
    if (queryString) {
        query = query.or(
            `name_en.ilike.%${queryString}%,name_ar.ilike.%${queryString}%,description_en.ilike.%${queryString}%,description_ar.ilike.%${queryString}%,keywords.ilike.%${queryString}%,sku.ilike.%${queryString}%`
        );
    }

    // Apply category filter
    if (categoryId) {
        query = query.eq("category_id", Number(categoryId));
    }

    if (categorySlug) {
        const { data: category, error: categoryError } = await supabase
            .from("categories")
            .select("id")
            .or(`slug.eq.${categorySlug},slug_ar.eq.${categorySlug}`)
            .maybeSingle();

        if (categoryError) throw categoryError;
        if (category?.id) {
            query = query.eq("category_id", category.id);
        }
    }

    // Apply price filters
    if (minPrice) {
        query = query.gte("price", Number(minPrice));
    }
    if (maxPrice) {
        query = query.lte("price", Number(maxPrice));
    }

    // Execute the query with pagination and sorting
    const { data: products, count, error } = await query
        .range(from, to)
        .order(sortBy, {
            ascending: sortOrder,
        });

    if (error) throw error;

    const result: PaginatedResponse<ProductWithUserData> = {
        data: (products || []).map(p => ({
            ...p,
            currency: p.currency || undefined, // Convert null to undefined to match type
        })) as ProductWithUserData[],
        total: count ?? 0,
        page,
        limit: pageSize,
    };

    // If no user, return basic result
    if (!user) {
        return result;
    }

    // If no products, return early
    if (!products || products.length === 0) {
        return result;
    }

    // Get user's database ID (not the Supabase auth ID)
    const { data: dbUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (userError) {
        console.error("Error fetching user:", userError);
        return result;
    }

    if (!dbUser) {
        return result;
    }

    // Get user-specific data (favorites and cart items)
    const ids = products.map((p) => p.id);
    const [favorites, cartItems] = await Promise.all([
        supabase
            .from("favorites")
            .select("product_id")
            .eq("user_id", dbUser.id)
            .in("product_id", ids),
        buildCartQuery(supabase, dbUser.id, ids),
    ]);

    const favSet = new Set(favorites.data?.map((f: any) => f.product_id) || []);
    const cartMap = new Map(
        cartItems.data?.map((c: any) => [c.product_id, c.quantity]) || []
    );

    // Enhance products with user-specific data
    result.data = products.map((p) => {
        const inCart = cartMap.has(p.id);
        return {
            ...p,
            currency: p.currency || undefined, // Convert null to undefined to match type
            in_favorites: favSet.has(p.id),
            in_cart: inCart,
            ...(inCart ? { cart_quantity: cartMap.get(p.id) } : {}),
        } as ProductWithUserData;
    });

    return result;
} 