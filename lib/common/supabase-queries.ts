import { SignUpWithPasswordCredentials } from "@supabase/supabase-js";
import { createSsrClient } from "../supabase/server";
import {
  ProductWithUserData,
  ProductWithCurrency,
  ReviewWithUser,
} from "../types/database.types";

function isPhone(input: string): boolean {
  return /^(\+?\d{6,15})$/.test(input);
}

export async function registerUserWithPublicProfile({
  identifier,
  email,
  phone,
  password,
  firstName,
  lastName,
  avatar,
}: {
  identifier: "email" | "phone";
  email?: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}) {
  const supabase = await createSsrClient();
  const { data: user, error: insertError } = await supabase
    .from("users")
    .insert({
      email: email!,
      phone: phone,
      first_name: firstName!,
      last_name: lastName!,
      avatar: avatar!,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  try {
    const signUpData = {
      password,
      options: {
        data: {
          first_name: firstName ?? null,
          last_name: lastName ?? null,
          avatar: avatar ?? null,
          user_id: user?.id,
          [identifier ? "email" : "phone"]: null,
        },
      },
    } as SignUpWithPasswordCredentials;

    if (identifier === "phone") {
      Object.assign(signUpData, { phone: identifier });
    } else {
      Object.assign(signUpData, { email: identifier });
    }

    // Step 1: Sign up using Supabase Auth
    const { data, error } = await supabase.auth.signUp(signUpData);
    if (error) throw error;

    const authUser = data.user;
    if (!authUser) throw new Error("Signup succeeded but no user returned.");

    // Step 2: Update the user profile with the identifier
    const { error: updateError } = await supabase
      .from("users")
      .update({
        user_id: authUser.id,
      })
      .eq("id", user.id);
    if (updateError) throw updateError;

    return { success: true, user_id: authUser.id };
  } catch (err) {
    console.error("User registration failed:", err);
    // remove the user record if signup fails
    await supabase.from("users").delete().eq("id", user.id);
    // If the error is a Supabase error, return it directly

    return { success: false, error: String(err) };
  }
}
export async function getFeaturedProducts(
  limit = 6,
  userId?: number
): Promise<ProductWithUserData[]> {
  const supabase = await createSsrClient();

  let query = supabase
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

  if (userId) {
    query = query
      .eq("cart_items.user_id", userId)
      .eq("favorites.user_id", userId);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }

  // Transform the data to include user-specific flags
  return (data || []).map((product) => ({
    ...product,
    currency: product.currency ?? undefined,
    in_cart: product.cart_items && product.cart_items.length > 0,
    cart_quantity: product.cart_items?.[0]?.quantity || null,
    is_favorite: product.favorites && product.favorites.length > 0,
  }));
}

export async function getNewArrivals(
  limit = 4,
  userId?: number
): Promise<ProductWithUserData[]> {
  try {
    const supabase = await createSsrClient();

    let query = supabase
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

    if (userId) {
      query = query
        .eq("cart_items.user_id", userId)
        .eq("favorites.user_id", userId);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching new arrivals:", error);
      return [];
    }

    // Transform the data to include user-specific flags
    return (data || []).map((product) => ({
      ...product,
      currency: product.currency ?? undefined,

      in_cart: product.cart_items && product.cart_items.length > 0,
      cart_quantity: product.cart_items?.[0]?.quantity || null,
      is_favorite: product.favorites && product.favorites.length > 0,
    }));
  } catch (err) {
    console.error("Failed to fetch new arrivals:", err);
    return [];
  }
}

export async function getProductById(
  id: number
): Promise<ProductWithCurrency | null> {
  const supabase = await createSsrClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
    *,
    currency:currencies(*)
  `
    )
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data ? { ...data, currency: data.currency ?? undefined } : null;
}

export async function getProductBySlug(
  slug: string,
  userId?: number
): Promise<ProductWithUserData | null> {
  const supabase = await createSsrClient();

  let query = supabase
    .from("products")
    .select(
      `
    *, 
    meta_title_en, meta_title_ar, 
    meta_description_en, meta_description_ar, 
    meta_thumbnail,
    currency:currencies(*),
    cart_items!left(quantity, user_id),
    favorites!left(user_id)
  `
    )
    .eq("is_deleted", false)
    .or(`slug.eq.${slug},slug_ar.eq.${slug}`);

  if (userId) {
    query = query
      .eq("cart_items.user_id", userId)
      .eq("favorites.user_id", userId);
  }

  const { data, error } = await query.single();

  if (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }

  // Transform the data to include user-specific flags
  return {
    ...data,
    currency: data.currency ?? undefined,
    in_cart: data.cart_items && data.cart_items.length > 0,
    cart_quantity: data.cart_items?.[0]?.quantity || null,
    is_favorite: data.favorites && data.favorites.length > 0,
  };
}

export async function getProductReviews(
  productId: number,
  limit = 10
): Promise<ReviewWithUser[]> {
  const supabase = await createSsrClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
    *,
    user:users(*)
  `
    )
    .eq("product_id", productId)
    .eq("is_deleted", false)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }

  return (data || []).map((review) => ({
    ...review,
    user: review.user ?? undefined,
  }));
}

export async function searchProducts(
  query?: string,
  categoryId?: number,
  limit = 20,
  offset = 0
): Promise<ProductWithCurrency[]> {
  const supabase = await createSsrClient();

  let queryBuilder = supabase
    .from("products")
    .select(
      `
    *,
    currency:currencies(*)
  `
    )
    .eq("is_deleted", false)
    .not("quantity", "is", null)
    .gte("quantity", 0);

  if (query) {
    queryBuilder = queryBuilder.or(
      `name_en.ilike.%${query}%,name_ar.ilike.%${query}%,description_en.ilike.%${query}%,description_ar.ilike.%${query}%,keywords.ilike.%${query}%`
    );
  }

  if (categoryId) {
    queryBuilder = queryBuilder.eq("category_id", categoryId);
  }

  const { data, error } = await queryBuilder
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error searching products:", error);
    return [];
  }

  return (data || []).map((product) => ({
    ...product,
    currency: product.currency ?? undefined,
  }));
}

export async function getAllCurrencies() {
  const supabase = await createSsrClient();

  const { data, error } = await supabase
    .from("currencies")
    .select("*")
    .order("is_default", { ascending: false });

  if (error) {
    console.error("Error fetching currencies:", error);
    return [];
  }

  return data || [];
}

export async function getCategories(): Promise<any[]> {
  const supabase = await createSsrClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_deleted", false)
    .order("name_en", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}
