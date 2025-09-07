import { createAdminClient } from "../supabase/admin";
import createClient from "../supabase/client";
import { createSsrClient } from "../supabase/server";
import { CartItem } from "./cart";

export interface CheckoutData {
  // User details (for guest checkout)
  email?: string;
  password?: string;
  confirmPassword?: string;

  // Address details
  fullName: string;
  phone: string;
  address: string;
  stateCode: string;
  notes?: string;

  // Address selection (for existing users)
  selectedAddressId?: number;

  // Cart items
  cartItems: CartItem[];
}

export interface CheckoutResult {
  success: boolean;
  orderId?: number;
  orderCode?: string;
  error?: string;
}

// Get user's addresses
export async function getUserAddresses(userId: number) {
  const supabase = await createSsrClient();
  const supabaseAdmin = await createAdminClient();

  // First get the user's internal ID
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching user:", userError);
    return [];
  }

  const { data, error } = await supabase
    .from("addresses")
    .select(
      `
      *,
      state:states(*)
    `
    )
    .eq("user_id", userData.id)
    .eq("is_deleted", false)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }

  return data || [];
}

// Get UAE states for dropdown
export async function getUAEStates() {
  const supabase = await createSsrClient();

  const { data, error } = await supabase
    .from("states")
    .select()
    .eq("country_code", "AE")
    .order("name_en");

  if (error) {
    console.error("Error fetching UAE states:", error);
    return [];
  }

  return data || [];
}

// Create address for user
export async function createAddress(
  userInternalId: number,
  addressData: {
    fullName: string;
    phone: string;
    address: string;
    stateCode: string;
    notes?: string;
    isDefault?: boolean;
  }
) {
  const supabase = await createSsrClient();

  // If this is set as default, unset other defaults first
  if (addressData.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userInternalId);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userInternalId,
      full_name: addressData.fullName,
      phone: addressData.phone,
      address: addressData.address,
      state_code: addressData.stateCode,
      notes: addressData.notes,
      is_default: addressData.isDefault || false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating address:", error);
    throw new Error("Failed to create address");
  }

  return data;
}

// Get or create user in public.users table
async function getOrCreateUser(
  authUserId: string,
  userData?: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
) {
  const supabase = await createSsrClient();

  // Try to get existing user
  let { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", authUserId)
    .single();

  if (error && error.code === "PGRST116") {
    // User doesn't exist, create it
    if (!userData) {
      throw new Error("User data required for new user creation");
    }

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        user_id: authUserId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Error creating user:", createError);
      throw new Error("Failed to create user record");
    }

    user = newUser;
  } else if (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }

  return user;
}

// Calculate order totals
function calculateOrderTotals(cartItems: CartItem[], deliveryFee = 0) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.price || 0) * item.quantity,
    0
  );
  const total = subtotal + deliveryFee;

  return {
    subtotal,
    tax: 0, // No tax, only delivery fees
    deliveryFee,
    total,
  };
}

// Process checkout for authenticated user
export async function processAuthenticatedCheckout(
  authUserId: string,
  checkoutData: CheckoutData
): Promise<CheckoutResult> {
  const supabase = await createSsrClient();

  try {
    // Get user's internal ID and details
    const user = await getOrCreateUser(authUserId);
    const userInternalId = user?.id;
    if (!userInternalId) throw new Error("User not found");

    // Get user details for email
    const { data: userDetails } = await supabase
      .from("users")
      .select("email")
      .eq("id", userInternalId)
      .single();

    let addressId = checkoutData.selectedAddressId;

    // Create new address if not using existing one
    if (!addressId) {
      const newAddress = await createAddress(userInternalId, {
        fullName: checkoutData.fullName,
        phone: checkoutData.phone,
        address: checkoutData.address,
        stateCode: checkoutData.stateCode,
        notes: checkoutData.notes,
        isDefault: false,
      });
      addressId = newAddress.id;
    }

    // Get delivery fee for the state
    const { data: stateData } = await supabase
      .from("states")
      .select("delivery_fee")
      .eq("code", checkoutData.stateCode)
      .single();

    const deliveryFee = Number(stateData?.delivery_fee || 0);

    // Calculate totals
    const totals = calculateOrderTotals(checkoutData.cartItems, deliveryFee);

    // Create order
    // const orderCode = `ORD-${Date.now()}-${Math.random()
    //   .toString(36)
    //   .substr(2, 9)
    //   .toUpperCase()}`;

    const today = new Date();
    const datePart = today.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
    const randPart = Math.random().toString(36).substr(2, 5).toUpperCase(); // 5 random chars

    const orderCode = `ORD${datePart}${randPart}`;
    console.log(orderCode);


    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        code: orderCode,
        user_id: userInternalId,
        address_id: addressId,
        status: "confirmed", // Direct to confirmed for authenticated users
        total_price: totals.total,
        subtotal: totals.subtotal,
        shipping: deliveryFee,
        payment_method: "cash", // Default to cash on delivery
        user_note: checkoutData.notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items
    const orderItems = checkoutData.cartItems.map((item) => ({
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
      throw new Error("Failed to create order items");
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
      const customerName = checkoutData.fullName;
      const customerEmail = userDetails?.email || '';
      const customerPhone = checkoutData.phone || '';

      // Only send emails if we have valid email
      if (customerEmail) {
        try {
          // Import the email function dynamically to avoid circular dependencies
          const { sendCheckoutNotificationEmails } = await import("@/app/_actions/send-checkout-emails");
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

    // Revalidate orders page
    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/orders");
    } catch (error) {
      console.error("Error revalidating orders page:", error);
    }

    return {
      success: true,
      orderId: order.id,
      orderCode: order.code ?? "",
    };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Checkout failed",
    };
  }
}

// Process checkout for guest user
export async function processGuestCheckout(
  checkoutData: CheckoutData
): Promise<CheckoutResult> {
  const supabase = await createSsrClient();
  const supabaseAdmin = await createAdminClient();

  // Helper to log app events (best-effort)
  const log = async (
    level: 'info' | 'error',
    message: string,
    source: string,
    context?: Record<string, any>
  ) => {
    try {
      await supabaseAdmin.rpc('add_app_log', {
        p_level: level,
        p_message: message,
        p_user_id: null,
        p_category: 'checkout',
        p_source: source,
        p_context: context || null,
        p_stack_trace: level === 'error' && context?.errorStack ? context.errorStack : null,
      });
    } catch (_) {
      // silent
    }
  };

  try {
    await log('info', 'Guest checkout attempt', 'guest_checkout', {
      cart_items: checkoutData.cartItems?.length || 0,
      email_present: !!checkoutData.email,
    });
    // Validate guest data
    if (
      !checkoutData.email ||
      !checkoutData.password ||
      !checkoutData.confirmPassword
    ) {
      throw new Error("Email and password are required for guest checkout");
    }

    if (checkoutData.password !== checkoutData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (checkoutData.password.length < 8) {
      await log('error', 'Password too short', 'guest_checkout', { providedLength: checkoutData.password.length });
      throw new Error('PASSWORD_TOO_SHORT');
    }

    // Parse full name
    const nameParts = checkoutData.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // First attempt a sign-in (account may already exist)
    let authData: any = null; let authError: any = null;
    const preSignIn = await supabase.auth.signInWithPassword({
      email: checkoutData.email,
      password: checkoutData.password,
    });
    if (preSignIn.data?.user) {
      await log('info', 'Existing account detected via pre sign-in', 'guest_checkout', { email: checkoutData.email });
      return await processAuthenticatedCheckout(preSignIn.data.user.id, checkoutData);
    }

    // Proceed with sign-up (retry on timeout)
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      attempts++;
      const { data, error } = await supabase.auth.signUp({
        email: checkoutData.email,
        password: checkoutData.password,
        options: {
          data: { first_name: firstName, last_name: lastName, phone: checkoutData.phone },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/auth/confirm`
        },
      });
      authData = data; authError = error;
      if (!authError) break; // success
      const status = (authError as any)?.status;
      const msgLower = (authError as any)?.message?.toLowerCase?.() || '';
      const timeoutLike = status === 504 || msgLower.includes('timeout');
      const already = msgLower.includes('already') || msgLower.includes('registered');
      await log('error', 'Auth signUp attempt failed', 'guest_checkout', { attempt: attempts, status, message: authError.message });
      if (already) break; // handle already existing below
      if (!timeoutLike) break; // other errors -> break
      if (attempts < maxAttempts) await new Promise(r => setTimeout(r, 1000));
    }

    if (authError) {
      const msg = (authError as any)?.message?.toLowerCase?.() || '';
      const isAlreadyExists = msg.includes('already') || msg.includes('registered');
      const isTimeout = (authError as any)?.status === 504 || msg.includes('timeout');
      if (isAlreadyExists) {
        // Try sign in with provided password
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: checkoutData.email,
          password: checkoutData.password,
        });
        if (signInError || !signInData.user) {
          await log('error', 'Existing account password mismatch', 'guest_checkout', { email: checkoutData.email });
          throw new Error('EXISTING_ACCOUNT_PASSWORD_MISMATCH');
        }
        await log('info', 'Existing account reused via sign-in', 'guest_checkout', { email: checkoutData.email });
        return await processAuthenticatedCheckout(signInData.user.id, checkoutData);
      } else if (isTimeout) {
        // Attempt a silent sign-in just in case account was created server-side despite timeout
        for (let i = 0; i < 3; i++) {
          try {
            await new Promise(r => setTimeout(r, 800));
            const { data: maybeSignIn } = await supabase.auth.signInWithPassword({
              email: checkoutData.email,
              password: checkoutData.password,
            });
            if (maybeSignIn?.user) {
              await log('info', 'Recovered from timeout via delayed sign-in', 'guest_checkout', { email: checkoutData.email, attempt: i + 1 });
              return await processAuthenticatedCheckout(maybeSignIn.user.id, checkoutData);
            }
          } catch (_) {
            // ignore each attempt
          }
        }
        await log('error', 'Network timeout during account creation', 'guest_checkout', { email: checkoutData.email });
        throw new Error('NETWORK_TIMEOUT');
      } else {
        await log('error', 'Account creation failed', 'guest_checkout', { email: checkoutData.email, message: authError.message });
        throw new Error('ACCOUNT_CREATION_FAILED');
      }
    } else {
      await log('info', 'Account created successfully', 'guest_checkout', { email: checkoutData.email });
    }

    if (!authData?.user) {
      throw new Error("Failed to create user account");
    }

    const authUserId = authData.user.id;

    // Wait for auth user to be created
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create user record in public.users table
    const user = await getOrCreateUser(authUserId, {
      email: checkoutData.email,
      firstName,
      lastName,
      phone: checkoutData.phone,
    });

    const userInternalId = user?.id;
    if (!userInternalId) {
      throw new Error("Failed to create user record");
    }

    // Create address
    const newAddress = await createAddress(userInternalId, {
      fullName: checkoutData.fullName,
      phone: checkoutData.phone,
      address: checkoutData.address,
      stateCode: checkoutData.stateCode,
      notes: checkoutData.notes,
      isDefault: true, // First address is default
    });

    // Get delivery fee for the state
    const serverSupabase = await createSsrClient();
    const { data: stateData } = await serverSupabase
      .from("states")
      .select("delivery_fee")
      .eq("code", checkoutData.stateCode)
      .single();

    const deliveryFee = Number(stateData?.delivery_fee || 0);

    // Calculate totals
    const totals = calculateOrderTotals(checkoutData.cartItems, deliveryFee);

    // Create order
    const orderCode = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const { data: order, error: orderError } = await serverSupabase
      .from("orders")
      .insert({
        code: orderCode,
        user_id: userInternalId,
        address_id: newAddress.id,
        status: "pending",
        total_price: totals.total,
        payment_method: "cash", // Default to cash on delivery
        user_note: checkoutData.notes,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items
    const orderItems = checkoutData.cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price || 0,
    }));

    const { error: itemsError } = await serverSupabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw new Error("Failed to create order items");
    }

    await log('info', 'Guest checkout order created', 'guest_checkout', { order_id: order.id, order_code: order.code });
    return {
      success: true,
      orderId: order.id,
      orderCode: order.code ?? "",
    };
  } catch (error) {
    console.error("Guest checkout error:", error);
    await log('error', 'Guest checkout failed', 'guest_checkout', {
      error: error instanceof Error ? error.message : 'Unknown',
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof Error) {
      const raw = error.message;
      // Pass through sentinel codes; mapping handled client-side
      return { success: false, error: raw };
    }
    return { success: false, error: 'Checkout failed' };
  }
}
