import { createSsrClient } from "../supabase/server";
import { createClient } from "../supabase/client";
import type { Database } from "../types/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];
type Address = Database["public"]["Tables"]["addresses"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
type Product = Database["public"]["Tables"]["products"]["Row"];
type CartItem = Database["public"]["Tables"]["cart_items"]["Row"];
type Favorite = Database["public"]["Tables"]["favorites"]["Row"];

// Get user profile with stats
export async function getUserProfile(userId: number) {
  const supabase = await createSsrClient();

  try {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .eq("is_deleted", false)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return null;
    }

    // Get user stats with proper error handling
    const [ordersResult, favoritesResult, totalSpentResult] =
      await Promise.allSettled([
        supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId)
          .eq("is_deleted", false),
        supabase
          .from("favorites")
          .select("id")
          .eq("user_id", userId)
          .eq("is_deleted", false),
        supabase
          .from("orders")
          .select("total_price")
          .eq("user_id", userId)
          .eq("is_deleted", false)
          .in("status", ["delivered", "delivered"]),
      ]);

    // Handle results with fallbacks
    const totalOrders =
      ordersResult.status === "fulfilled"
        ? ordersResult.value.data?.length || 0
        : 0;
    const totalFavorites =
      favoritesResult.status === "fulfilled"
        ? favoritesResult.value.data?.length || 0
        : 0;
    const totalSpent =
      totalSpentResult.status === "fulfilled"
        ? totalSpentResult.value.data?.reduce(
            (sum, order) => sum + (order.total_price || 0),
            0
          ) || 0
        : 0;

    const getVipStatus = (spent: number) => {
      if (spent >= 1000) return "Gold";
      if (spent >= 500) return "Silver";
      return "Bronze";
    };

    return {
      ...user,
      stats: {
        totalOrders,
        totalFavorites,
        totalSpent,
        vipStatus: getVipStatus(totalSpent),
      },
    };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

// Get user addresses
export async function getUserAddresses(userId: number) {
  const supabase = await createSsrClient();

  const { data, error } = await supabase
    .from("addresses")
    .select(
      `
      *,
      state:states(*)
    `
    )
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }

  return data || [];
}

// Get user orders with better error handling
export async function getUserOrders(
  userId: number,
  status?: Database["public"]["Enums"]["order_status"] | "all",
  limit?: number
) {
  const supabase = await createSsrClient();

  try {
    let query = supabase
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          product:products(*)
        ),
        address:addresses(*),
        user:users(*)
      `
      )
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    return [];
  }
}

// Get user favorites with better error handling
export async function getUserFavorites(userId: number, categoryId?: number) {
  const supabase = await createSsrClient();

  try {
    let query = supabase
      .from("favorites")
      .select(
        `
        *,
        product:products(
          *,
          currency:currencies(*),
          cart_items!left(quantity, user_id)
        )
      `
      )
      .eq("user_id", userId)
      .eq("is_deleted", false);

    if (categoryId) {
      query = query.eq("products.category_id", categoryId);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }

    // Transform to include user-specific data
    return (data || [])
      .map((favorite) => ({
        ...favorite,
        product: favorite.product
          ? {
              ...favorite.product,
              in_cart:
                favorite.product.cart_items &&
                favorite.product.cart_items.length > 0,
              cart_quantity: favorite.product.cart_items?.[0]?.quantity || null,
              is_favorite: true,
            }
          : null,
      }))
      .filter((fav) => fav.product !== null); // Filter out favorites with deleted products
  } catch (error) {
    console.error("Error in getUserFavorites:", error);
    return [];
  }
}

// Client-side functions
export async function addToFavorites(productId: number, userId: number) {
  const supabase = createClient();

  const { error } = await supabase.from("favorites").insert({
    product_id: productId,
    user_id: userId,
  });

  if (error) {
    console.error("Error adding to favorites:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function removeFromFavorites(productId: number, userId: number) {
  const supabase = createClient();

  const { error } = await supabase
    .from("favorites")
    .update({ is_deleted: true })
    .eq("product_id", productId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing from favorites:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function addToCart(
  productId: number,
  userId: number,
  quantity = 1
) {
  const supabase = createClient();

  // Check if item already in cart
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .single();

  if (existingItem) {
    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity! + quantity })
      .eq("id", existingItem.id);

    if (error) {
      console.error("Error updating cart:", error);
      return { success: false, error: error.message };
    }
  } else {
    // Add new item
    const { error } = await supabase.from("cart_items").insert({
      product_id: productId,
      user_id: userId,
      quantity,
    });

    if (error) {
      console.error("Error adding to cart:", error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

// Address management
export async function createAddress(
  address: Omit<Database["public"]["Tables"]["addresses"]["Insert"], "user_id">,
  userId: number
) {
  const supabase = createClient();

  // If this is set as default, unset other defaults first
  if (address.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      ...address,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating address:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateAddress(
  addressId: number,
  updates: Database["public"]["Tables"]["addresses"]["Update"],
  userId: number
) {
  const supabase = createClient();

  // If this is set as default, unset other defaults first
  if (updates.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const { data, error } = await supabase
    .from("addresses")
    .update(updates)
    .eq("id", addressId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating address:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteAddress(addressId: number, userId: number) {
  const supabase = createClient();

  const { error } = await supabase
    .from("addresses")
    .update({ is_deleted: true })
    .eq("id", addressId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Update user profile
export async function updateUserProfile(
  userId: number,
  updates: Database["public"]["Tables"]["users"]["Update"]
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
