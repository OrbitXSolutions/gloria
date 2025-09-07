"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkoutSchema, type CheckoutFormData } from "@/lib/schemas/checkout";
import { ZodError } from "zod";
import { CartItem } from "@/lib/common/cart";
import { createSsrClient } from "@/lib/supabase/server";
import { sendCheckoutNotificationEmails } from "./send-checkout-emails";

// Create pending order from cart
export async function createDraftOrder(cartItems: CartItem[]) {
  const supabase = await createSsrClient();

  // Log draft order creation attempt
  try {
    await supabase.rpc('add_app_log', {
      p_level: 'info',
      p_message: 'Draft order creation attempt',
      p_user_id: null,
      p_category: 'checkout',
      p_source: 'create_draft_order',
      p_context: {
        cart_items_count: cartItems?.length || 0,
        timestamp: new Date().toISOString()
      },
      p_stack_trace: null,
    });
  } catch (logError) {
    console.error('Failed to log draft order creation attempt:', logError);
  }

  try {

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
    // const orderCode = `ORD-${Date.now()}-${Math.random()
    //   .toString(36)
    //   .substr(2, 9)
    //   .toUpperCase()}`;

    // Generate shorter order code
    const orderCode = `ORD${Date.now().toString().slice(-6)}${Math.random()
      .toString(36)
      .substring(2, 2)
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
      // Log order creation error
      try {
        await supabase.rpc('add_app_log', {
          p_level: 'error',
          p_message: `Failed to create draft order: ${orderError.message}`,
          p_user_id: null,
          p_category: 'checkout',
          p_source: 'create_draft_order',
          p_context: {
            cart_items_count: cartItems?.length || 0,
            error: orderError.message,
            error_code: orderError.code || 'unknown'
          },
          p_stack_trace: null,
        });
      } catch (logError) {
        console.error('Failed to log order creation error:', logError);
      }
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
      // Log order items creation error
      try {
        await supabase.rpc('add_app_log', {
          p_level: 'error',
          p_message: `Failed to create order items: ${itemsError.message}`,
          p_user_id: null,
          p_category: 'checkout',
          p_source: 'create_draft_order',
          p_context: {
            order_id: order.id,
            order_code: order.code,
            items_count: orderItems.length,
            error: itemsError.message,
            error_code: itemsError.code || 'unknown'
          },
          p_stack_trace: null,
        });
      } catch (logError) {
        console.error('Failed to log order items creation error:', logError);
      }
      return { success: false, error: "Failed to create order items" };
    }

    // Log successful draft order creation
    try {
      await supabase.rpc('add_app_log', {
        p_level: 'info',
        p_message: 'Draft order created successfully',
        p_user_id: null,
        p_category: 'checkout',
        p_source: 'create_draft_order',
        p_context: {
          order_id: order.id,
          order_code: order.code,
          items_count: orderItems.length,
          total_price: order.total_price
        },
        p_stack_trace: null,
      });
    } catch (logError) {
      console.error('Failed to log successful draft order creation:', logError);
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
  const supabase = await createSsrClient();

  // Log checkout completion attempt
  try {
    await supabase.rpc('add_app_log', {
      p_level: 'info',
      p_message: 'Checkout completion attempt',
      p_user_id: null,
      p_category: 'checkout',
      p_source: 'complete_checkout',
      p_context: {
        order_code: orderCode,
        timestamp: new Date().toISOString()
      },
      p_stack_trace: null,
    });
  } catch (logError) {
    console.error('Failed to log checkout completion attempt:', logError);
  }

  try {

    // Validate form data
    let validatedData: CheckoutFormData;
    try {
      validatedData = checkoutSchema.parse(formData);
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map(i => i.message).join("; ");
        return { success: false, error: issues, errorCode: "VALIDATION_ERROR" as const };
      }
      throw err;
    }

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
      const { data: newAuthUser, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            first_name: validatedData.fullName.split(" ")[0] || "",
            last_name: validatedData.fullName.split(" ").slice(1).join(" ") || "",
            phone: validatedData.phone,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`,
        },
      });

      if (authError || !newAuthUser.user) {
        // If account already exists try signing in instead of failing
        const alreadyExists = authError?.message?.toLowerCase().includes("already") || authError?.message?.toLowerCase().includes("registered");
        if (alreadyExists) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: validatedData.email,
            password: validatedData.password,
          });
          if (signInError || !signInData.user) {
            return {
              success: false,
              error: "EXISTING_ACCOUNT_PASSWORD_MISMATCH",
              errorCode: "EXISTING_ACCOUNT_PASSWORD_MISMATCH" as const,
            };
          }
          userId = signInData.user.id;
        } else {
          return {
            success: false,
            error: authError?.message || "Failed to create account",
            errorCode: "ACCOUNT_CREATION_FAILED" as const,
          };
        }
      } else {
        userId = newAuthUser.user.id;
      }

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
          return { success: false, error: "Failed to create user record", errorCode: "USER_RECORD_CREATE_FAILED" as const };
        }
        userRecord = newUserRecord;
      } else if (userError) {
        return { success: false, error: "Failed to get user record", errorCode: "USER_RECORD_FETCH_FAILED" as const };
      }

      if (!userRecord) {
        return { success: false, error: "User record not found", errorCode: "USER_RECORD_NOT_FOUND" as const };
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
        return { success: false, error: "User record not found", errorCode: "USER_RECORD_NOT_FOUND" as const };
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
        return { success: false, error: "Failed to create address", errorCode: "ADDRESS_CREATE_FAILED" as const };
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
      return { success: false, error: "Failed to get state delivery fees", errorCode: "STATE_FEE_FETCH_FAILED" as const };
    }
    // Update order with user and address
    const { data: orderTotalPrice, error: orderTotalPriceError } = await supabase.from("orders").select("total_price").eq("code", orderCode).single();
    if (orderTotalPriceError) {
      console.error("Error getting order:", orderTotalPriceError);
      return { success: false, error: "Failed to get order", errorCode: "ORDER_FETCH_FAILED" as const };
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
      return { success: false, error: "Failed to complete order", errorCode: "ORDER_UPDATE_FAILED" as const };
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

    // Log successful checkout completion
    try {
      await supabase.rpc('add_app_log', {
        p_level: 'info',
        p_message: 'Checkout completed successfully',
        p_user_id: userId,
        p_category: 'checkout',
        p_source: 'complete_checkout',
        p_context: {
          order_code: orderCode,
          user_id: userId,
          customer_email: validatedData.email || null,
          // Use server-calculated values instead of a non-existent validatedData.deliveryFee field
          subtotal: total,
          delivery_fee: stateDeliveryFees?.delivery_fee || 0,
          total_price: totalWithDeliveryFee
        },
        p_stack_trace: null,
      });
    } catch (logError) {
      console.error('Failed to log successful checkout completion:', logError);
    }

    return { success: true, orderCode };
  } catch (error) {
    console.error("Complete checkout error:", error);

    // Log checkout error
    try {
      await supabase.rpc('add_app_log', {
        p_level: 'error',
        p_message: `Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        p_user_id: null,
        p_category: 'checkout',
        p_source: 'complete_checkout',
        p_context: {
          order_code: orderCode,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack_trace: error instanceof Error ? error.stack : null
        },
        p_stack_trace: error instanceof Error ? error.stack : null,
      });
    } catch (logError) {
      console.error('Failed to log checkout error:', logError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Checkout failed",
      errorCode: "UNHANDLED_CHECKOUT_ERROR" as const,
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
