import { metadata } from "./../../layout";
import { createSsrClient } from "@/lib/supabase/server";
import { ProductWithUserData } from "@/lib/types/database.types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const categoryId = searchParams.get("category")
      ? Number.parseInt(searchParams.get("category")!)
      : undefined;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const sort = searchParams.get("sort") || "newest";
    const limit = 8; // Changed from 20 to 8
    const offset = (page - 1) * limit;

    const supabase = await createSsrClient();

    // Get user for personalized data
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let queryBuilder = supabase
      .from("products")
      .select(
        `
        *,
        currency:currencies(*),
        cart_items!left(quantity, user_id),
        favorites!left(user_id)
      `
      )
      .eq("is_deleted", false)
      .not("quantity", "is", null)
      .gte("quantity", 0);

    // Add user-specific filters if authenticated
    if (user?.id) {
      queryBuilder = queryBuilder
        .eq("cart_items.user_id", user.user_metadata.user_id)
        .eq("favorites.user_id", user.user_metadata.user_id);
    }

    // Add search filter
    if (query) {
      queryBuilder = queryBuilder.or(
        `name_en.ilike.%${query}%,name_ar.ilike.%${query}%,description_en.ilike.%${query}%,description_ar.ilike.%${query}%,keywords.ilike.%${query}%`
      );
    }

    // Add category filter
    if (categoryId) {
      queryBuilder = queryBuilder.eq("category_id", categoryId);
    }

    // Add sorting
    switch (sort) {
      case "oldest":
        queryBuilder = queryBuilder.order("created_at", { ascending: true });
        break;
      case "price-low":
        queryBuilder = queryBuilder.order("price", { ascending: true });
        break;
      case "price-high":
        queryBuilder = queryBuilder.order("price", { ascending: false });
        break;
      case "name-az":
        queryBuilder = queryBuilder.order("name_en", { ascending: true });
        break;
      case "name-za":
        queryBuilder = queryBuilder.order("name_en", { ascending: false });
        break;
      case "rating-high":
        queryBuilder = queryBuilder.order("total_rates", { ascending: false });
        break;
      case "rating-low":
        queryBuilder = queryBuilder.order("total_rates", { ascending: true });
        break;
      default: // newest
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
    }

    const { data, error } = await queryBuilder.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false)
      .not("quantity", "is", null)
      .gte("quantity", 0);

    // Apply same filters for count
    if (query) {
      countQuery = countQuery.or(
        `name_en.ilike.%${query}%,name_ar.ilike.%${query}%,description_en.ilike.%${query}%,description_ar.ilike.%${query}%,keywords.ilike.%${query}%`
      );
    }

    if (categoryId) {
      countQuery = countQuery.eq("category_id", categoryId);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Error counting products:", countError);
    }

    const totalProducts = count || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    // Transform the data to include user-specific flags
    const products: ProductWithUserData[] = (data || []).map((product) => ({
      ...product,
      currency: product.currency === null ? undefined : product.currency,
      in_cart: product.cart_items && product.cart_items.length > 0,
      cart_quantity: product.cart_items?.[0]?.quantity || null,
      is_favorite: product.favorites && product.favorites.length > 0,
    }));

    return NextResponse.json({
      products,
      total: totalProducts,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
