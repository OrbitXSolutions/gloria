import { notFound } from "next/navigation";
import CheckoutPageClient from "./CheckoutPageClient";
import { createSsrClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types/database.types";
import { getUAEStates, getUserAddresses } from "@/lib/common/checkout";

interface CheckoutPageProps {
  params: Promise<{ orderCode: string }>;
}

export default async function Page({ params }: CheckoutPageProps) {
  const { orderCode } = await params;
  const supabase = await createSsrClient();

  // Get current user
  const {
    data: { user: supaUser },
  } = await supabase.auth.getUser();

  const { data: user } = !supaUser
    ? { data: null }
    : await supabase
      .from("users")
      .select("*")
      .eq("user_id", supaUser.id)
      .single();

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        product:products (*,currencies(*))
      )
    `
    )
    .eq("code", orderCode)
    .eq("status", "draft")
    .single();

  if (orderError || !order) {
    notFound();
  }

  // Get user addresses if authenticated
  let userAddresses: Database["public"]["Tables"]["addresses"]["Row"][] = [];
  if (user) {
    userAddresses = await getUserAddresses(user.id);
  }

  // Get UAE states
  const uaeStates = await getUAEStates();
  if (!order || !uaeStates) {
    throw new Error("Order or UAE states not found");
  }
  return (
    <CheckoutPageClient
      user={user}
      order={order}
      userAddresses={userAddresses}
      states={uaeStates}
    />
  );
}
