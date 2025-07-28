"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkoutSchema, type CheckoutFormData } from "@/lib/schemas/checkout";
import { CartItem } from "@/lib/common/cart";
import { createSsrClient } from "@/lib/supabase/server";
import { sendCheckoutNotificationEmails } from "./send-checkout-emails";

// Create pending order from cart
export async function createDraftOrder(cartItems: CartItem[]) {
  try {
    const supabase = await createSsrClient();

    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.product.price || 0) * item.quantity,
      0
    );
    const total = subtotal; // No tax, only delivery fees will be added during checkout

    // Generate order code
    const orderCode = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Create pending order without user/address (will be updated in checkout)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        code: orderCode,
        status: "draft", // Draft status until checkout is completed
        total_price: total,
        subtotal: subtotal,
        payment_method: "cash",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return { success: false, error: "Failed to create order" };
    }

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price || 0,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      return { success: false, error: "Failed to create order items" };
    }

    return { success: true, orderCode: order.code, orderId: order.id };
  } catch (error) {
    console.error("Create pending order error:", error);
    return { success: false, error: "Failed to create order" };
  }
}

// Complete checkout with user and address details
export async function completeCheckout(
  orderCode: string,
  formData: CheckoutFormData
) {
  try {
    const supabase = await createSsrClient();

    // Validate form data
    const validatedData = checkoutSchema.parse(formData);

    // Get current user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let userId: string | null = null;
    let userInternalId: number | null = null;

    // Handle user creation/authentication
    if (!authUser) {
      // Guest checkout - create user
      if (!validatedData.email || !validatedData.password) {
        return {
          success: false,
          error: "Email and password required for guest checkout",
        };
      }

      // Create auth user
      const { data: newAuthUser, error: authError } =
        await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            data: {
              first_name: validatedData.fullName.split(" ")[0] || "",
              last_name:
                validatedData.fullName.split(" ").slice(1).join(" ") || "",
              phone: validatedData.phone,
            },
          },
        });

      if (authError || !newAuthUser.user) {
        return {
          success: false,
          error: authError?.message || "Failed to create account",
        };
      }

      userId = newAuthUser.user.id;

      // Wait for user creation trigger
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get or create user record
      let { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (userError && userError.code === "PGRST116") {
        // Create user record
        const { data: newUserRecord, error: createUserError } = await supabase
          .from("users")
          .insert({
            user_id: userId,
            email: validatedData.email,
            first_name: validatedData.fullName.split(" ")[0] || "",
            last_name:
              validatedData.fullName.split(" ").slice(1).join(" ") || "",
            phone: validatedData.phone,
          })
          .select("id")
          .single();

        if (createUserError) {
          return { success: false, error: "Failed to create user record" };
        }
        userRecord = newUserRecord;
      } else if (userError) {
        return { success: false, error: "Failed to get user record" };
      }

      if (!userRecord) {
        return { success: false, error: "User record not found" };
      }
      userInternalId = userRecord.id;
    } else {
      // Authenticated user
      userId = authUser.id;

      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (userError) {
        return { success: false, error: "User record not found" };
      }

      userInternalId = userRecord.id;
    }

    // Handle address
    let addressId: number | null = null;

    if (validatedData.selectedAddressId && !validatedData.useNewAddress) {
      // Use existing address
      addressId = validatedData.selectedAddressId;
    } else {
      // Create new address
      const { data: newAddress, error: addressError } = await supabase
        .from("addresses")
        .insert({
          user_id: userInternalId,
          full_name: validatedData.fullName,
          phone: validatedData.phone,
          address: validatedData.address,
          state_code: validatedData.stateCode,
          notes: validatedData.notes,
          is_default: !validatedData.selectedAddressId, // First address is default
        })
        .select("id")
        .single();





      if (addressError) {
        console.error("Error creating address:", addressError);
        return { success: false, error: "Failed to create address" };
      }

      addressId = newAddress.id;
    }

    const { data: stateDeliveryFees, error: stateDeliveryFeesError } = await supabase
      .from("states")
      .select("delivery_fee")
      .eq("code", validatedData.stateCode)
      .single();

    if (stateDeliveryFeesError) {
      console.error("Error getting state delivery fees:", stateDeliveryFeesError);
      return { success: false, error: "Failed to get state delivery fees" };
    }
    // Update order with user and address
    const { data: orderTotalPrice, error: orderTotalPriceError } = await supabase.from("orders").select("total_price").eq("code", orderCode).single();
    if (orderTotalPriceError) {
      console.error("Error getting order:", orderTotalPriceError);
      return { success: false, error: "Failed to get order" };
    }
    const total = orderTotalPrice?.total_price || 0;
    const totalWithDeliveryFee = total + (stateDeliveryFees?.delivery_fee || 0);
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        user_id: userInternalId,
        address_id: addressId,
        status: "confirmed",
        user_note: validatedData.notes,
        total_price: totalWithDeliveryFee,
        shipping: stateDeliveryFees?.delivery_fee || 0,
      })
      .eq("code", orderCode);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return { success: false, error: "Failed to complete order" };
    }

    // Get the complete order with items for email notification
    const { data: completeOrder, error: orderFetchError } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name_en,
            sku,
            price,
            currency_code
          )
        ),
        users (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        addresses (
          id,
          full_name,
          phone,
          address,
          state_code
        )
      `)
      .eq("code", orderCode)
      .single();

    if (orderFetchError) {
      console.error("Error fetching complete order:", orderFetchError);
      // Don't fail the checkout if we can't send emails
    } else if (completeOrder) {
      // Send notification emails
      const customerName = validatedData.fullName;
      const customerEmail = validatedData.email || '';
      const customerPhone = validatedData.phone || '';

      // Only send emails if we have valid email
      if (customerEmail) {
        try {
          await sendCheckoutNotificationEmails({
            order: completeOrder as any, // Type assertion for now
            customerName,
            customerEmail,
            customerPhone,
          });
        } catch (emailError) {
          console.error("Error sending checkout notification emails:", emailError);
          // Don't fail the checkout if email sending fails
        }
      }
    }

    revalidatePath("/orders");
    return { success: true, orderCode };
  } catch (error) {
    console.error("Complete checkout error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Checkout failed",
    };
  }
}

// Redirect to checkout
export async function redirectToCheckout(cartItems: CartItem[]) {
  const supabase = await createSsrClient();

  // Check if user is authenticated
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser) {
    // Authenticated user - redirect directly to checkout without draft
    redirect('/checkout');
  } else {
    // Anonymous user - create draft order and redirect with code
    const result = await createDraftOrder(cartItems);

    if (result.success && result.orderCode) {
      redirect(`/checkout/${result.orderCode}`);
    } else {
      return { success: false, error: result.error };
    }
  }
}
