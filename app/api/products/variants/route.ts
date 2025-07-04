import { createSsrClient } from "@/lib/supabase/server";
import { ProductWithUserData } from "@/lib/types/database.types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variantGroup = searchParams.get("group");

    if (!variantGroup) {
      return NextResponse.json(
        { error: "Variant group is required" },
        { status: 400 }
      );
    }

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
      .eq("variant_group", variantGroup)
      .eq("is_deleted", false)
      .not("quantity", "is", null)
      .gte("quantity", 0);

    // Add user-specific filters if authenticated
    if (user?.id) {
      queryBuilder = queryBuilder
        .eq("cart_items.user_id", user.user_metadata.user_id)
        .eq("favorites.user_id", user.user_metadata.user_id);
    }

    const { data, error } = await queryBuilder.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching product variants:", error);
      return NextResponse.json(
        { error: "Failed to fetch variants" },
        { status: 500 }
      );
    }

    // Transform the data to include user-specific flags
    const variants: ProductWithUserData[] = (data || []).map((product) => ({
      ...product,
      currency: product.currency === null ? undefined : product.currency,
      in_cart: product.cart_items && product.cart_items.length > 0,
      cart_quantity: product.cart_items?.[0]?.quantity || null,
      is_favorite: product.favorites && product.favorites.length > 0,
    }));

    return NextResponse.json({ variants });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
