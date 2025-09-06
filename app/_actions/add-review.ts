"use server";

import { createSsrClient } from "@/lib/supabase/server";

export async function addReview({
  productId,
  rating,
  comment,
  fullName,
  user,
}: {
  productId: number;
  rating: number;
  comment: string;
  fullName?: string;
  user?: {
    id?: number | string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}) {
  const supabase = await createSsrClient();

  const reviewerName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.email ||
    fullName
    : fullName;

  const { data, error } = await supabase.from("reviews").insert({
    product_id: productId,
    rating,
    comment,
    name: reviewerName,
    user_id: user?.id ? Number(user.id) : null,
  });

  if (error) {
    throw new Error(`Failed to add review: ${error.message}`);
  }

  return data;
}