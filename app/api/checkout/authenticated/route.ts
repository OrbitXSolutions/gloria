import { NextRequest, NextResponse } from "next/server";
import {
  processAuthenticatedCheckout,
  CheckoutData,
} from "@/lib/common/checkout";
import { createSsrClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSsrClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: CheckoutData = await request.json();

    // Validate required fields
    if (
      !body.selectedAddressId &&
      (!body.fullName || !body.phone || !body.address || !body.stateCode)
    ) {
      return NextResponse.json(
        { success: false, error: "Address information is required" },
        { status: 400 }
      );
    }

    if (!body.cartItems || body.cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const result = await processAuthenticatedCheckout(user.id, body);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Authenticated checkout API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
