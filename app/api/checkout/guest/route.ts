import { NextRequest, NextResponse } from "next/server";
import { processGuestCheckout, CheckoutData } from "@/lib/common/checkout";

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutData = await request.json();

    // Validate required fields for guest checkout
    if (!body.email || !body.password || !body.confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (!body.fullName || !body.phone || !body.address || !body.stateCode) {
      return NextResponse.json(
        { success: false, error: "All address fields are required" },
        { status: 400 }
      );
    }

    if (!body.cartItems || body.cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    const result = await processGuestCheckout(body);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Guest checkout API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
