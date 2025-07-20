"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { toast } from "sonner";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { formatPrice } from "@/lib/common/cart";
import { CheckoutData } from "@/lib/common/checkout";

import { Database, OrderWithItems } from "@/lib/types/database.types";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/components/_core/providers/cart-provider";
import { useSupabase } from "@/components/_core/providers/SupabaseProvider";
import SafeImage from "@/components/_common/safe-image";
import {
  getProductImageUrl,
  getFirstImageUrl,
} from "@/lib/constants/supabase-storage";
import Image from "next/image";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];
type Order = OrderWithItems;
type Address = Database["public"]["Tables"]["addresses"]["Row"];
type State = Database["public"]["Tables"]["states"]["Row"];
interface CheckoutPageClientProps {
  user: SupabaseUser | null;
  userAddresses: Address[];
  uaeStates: State[];
}

export default function CheckoutPageClient({
  user,
  userAddresses,
  uaeStates,
}: CheckoutPageClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { cart, clear } = useCart();
  const { supabase } = useSupabase();
  const router = useRouter();

  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Guest user fields
    email: "",
    password: "",
    confirmPassword: "",

    // Address fields
    fullName: "",
    phone: "",
    address: "",
    stateCode: "",
    notes: "",
  });

  // Initialize form data and address selection
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/cart");
      return;
    }

    if (user) {
      // Pre-fill user data
      const firstName = user.user_metadata?.first_name || "";
      const lastName = user.user_metadata?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const phone = user.user_metadata?.phone || user.phone || "";

      setFormData((prev) => ({
        ...prev,
        fullName,
        phone,
      }));

      // Select default address or show form
      const defaultAddress = userAddresses.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (userAddresses.length === 0) {
        setShowNewAddressForm(true);
      }
    } else {
      // Guest checkout - show address form
      setShowNewAddressForm(true);
    }

    // Set default state if available
    if (uaeStates.length > 0 && !formData.stateCode) {
      setFormData((prev) => ({
        ...prev,
        stateCode: uaeStates[0].code,
      }));
    }
  }, [
    user,
    userAddresses,
    uaeStates,
    cart.items.length,
    router,
    formData.stateCode,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const getStateName = (stateCode: string) => {
    const state = uaeStates.find((s) => s.code === stateCode);
    return state
      ? locale === "ar"
        ? state.name_ar
        : state.name_en
      : stateCode;
  };
  const handleAuthenticatedCheckout = async (checkoutData: CheckoutData) => {
    const response = await fetch("/api/checkout/authenticated", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Checkout failed");
    }

    return await response.json();
  };

  const handleGuestCheckout = async (checkoutData: CheckoutData) => {
    const response = await fetch("/api/checkout/guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Checkout failed");
    }

    return await response.json();
  };

  const validateForm = (): string | null => {
    if (!user) {
      // Guest checkout validation
      if (!formData.email) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return "Please enter a valid email address";
      if (!formData.password) return "Password is required";
      if (!formData.confirmPassword) return "Please confirm your password";
      if (formData.password !== formData.confirmPassword)
        return "Passwords do not match";
      if (formData.password.length < 6)
        return "Password must be at least 6 characters";
    }

    if (showNewAddressForm || !selectedAddressId) {
      // Address validation
      if (!formData.fullName.trim()) return "Full name is required";
      if (!formData.phone.trim()) return "Phone number is required";
      if (!/^[+]?[0-9\s\-$$$$]{7,15}$/.test(formData.phone.replace(/\s/g, "")))
        return "Please enter a valid phone number";
      if (!formData.address.trim()) return "Address is required";
      if (!formData.stateCode) return "Emirate is required";
    }

    if (!selectedAddressId && !showNewAddressForm && user) {
      return "Please select an address or add a new one";
    }

    if (cart.items.length === 0) {
      return "Your cart is empty";
    }

    return null;
  };

  const handleCheckout = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (cart.items.length === 0) {
      toast.error(t("toast.cart.empty"));
      router.push("/cart");
      return;
    }

    setIsLoading(true);

    try {
      const checkoutData: CheckoutData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        stateCode: formData.stateCode,
        notes: formData.notes,
        selectedAddressId: selectedAddressId || undefined,
        cartItems: cart.items,
      };
      let result;
      if (user) {
        result = await handleAuthenticatedCheckout(checkoutData);
      } else {
        result = await handleGuestCheckout(checkoutData);
      }

      if (result.success && result.orderCode) {
        // Clear cart
        clear();

        toast.success(t("toast.checkout.orderPlaced"), {
          description: t("toast.checkout.orderConfirmed", { orderCode: result.orderCode }),
          duration: 5000,
        });

        // Redirect to order confirmation
        router.push(`/orders/${result.orderCode}`);
      } else {
        toast.error(t("toast.checkout.checkoutFailed"), {
          description: result.error || t("toast.checkout.checkoutFailedDescription"),
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(t("toast.checkout.unexpectedError"), {
        description: t("toast.checkout.unexpectedErrorDescription"),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cart.total;
  const tax = subtotal * 0.08; // 8% tax
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  if (cart.items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className={`flex items-center gap-2 text-sm text-gray-600 mb-4`}>
            <Link href="/" className="hover:text-gray-900">
              {t("header.nav.home")}
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-gray-900">
              {t("cart.title")}
            </Link>
            <span>/</span>
            <span className="text-gray-900">Checkout</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back Button */}
            <Link href="/cart">
              <Button variant="ghost" className={``}>
                <ArrowLeft
                  className={`h-4 w-4 ${locale == "ar" ? "ml-2 rotate-180" : "mr-2"
                    }`}
                />
                Back to Cart
              </Button>
            </Link>

            {/* Guest User Registration */}
            {!user && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className={`flex items-center gap-3 mb-6`}>
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-600" />
                  </div>
                  <h2 className="text-xl mx-3 font-bold text-gray-900">
                    Account Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Password *
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          placeholder="Create a password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          placeholder="Confirm your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    By creating an account, you agree to our Terms of Service
                    and Privacy Policy.
                  </p>
                </div>
              </div>
            )}

            {/* Address Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`flex items-center gap-3 mb-6 `}>
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-secondary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Address
                </h2>
              </div>

              {/* Existing Addresses */}
              {user && userAddresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-4 mb-6">
                  {userAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${selectedAddressId === address.id
                        ? "border-secondary-600 bg-secondary-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <div className={`flex items-start justify-between `}>
                        <div className="flex-1">
                          <div className={`flex items-center gap-2 mb-2 `}>
                            <h3 className="font-semibold text-gray-900">
                              {address.full_name}
                            </h3>
                            {address.is_default && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-1">{address.phone}</p>
                          <p className="text-gray-600 mb-1">
                            {address.address}
                          </p>
                          <p className="text-gray-600">
                            {address.state_code &&
                              getStateName(address.state_code)}
                            , UAE
                          </p>
                          {address.notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              {address.notes}
                            </p>
                          )}
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${selectedAddressId === address.id
                            ? "border-secondary-600 bg-secondary-600"
                            : "border-gray-300"
                            }`}
                        >
                          {selectedAddressId === address.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => setShowNewAddressForm(true)}
                    className="w-full"
                  >
                    Add New Address
                  </Button>
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm ||
                (user && userAddresses.length === 0) ||
                !user) && (
                  <div className="space-y-4">
                    {user && userAddresses.length > 0 && (
                      <div className={`flex items-center justify-between mb-4 `}>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Add New Address
                        </h3>
                        <Button
                          variant="ghost"
                          onClick={() => setShowNewAddressForm(false)}
                          className="text-gray-500"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Full Name *
                        </label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          placeholder="Enter full name"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Phone Number *
                        </label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Address *
                      </label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder="Enter full address"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Emirate *
                      </label>
                      <select
                        id="state"
                        value={formData.stateCode}
                        onChange={(e) =>
                          handleInputChange("stateCode", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary-500 focus:border-secondary-500"
                        required
                      >
                        <option value="">Select Emirate</option>
                        {uaeStates.map((state) => (
                          <option key={state.code} value={state.code}>
                            {locale === "ar" ? state.name_ar : state.name_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Delivery Notes (Optional)
                      </label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        placeholder="Any special delivery instructions..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => {
                  const primaryImage = item.product.primary_image
                    ? getProductImageUrl(item.product.primary_image)
                    : getFirstImageUrl(item.product.images);

                  const productName =
                    locale === "ar"
                      ? item.product.name_ar || item.product.name_en
                      : item.product.name_en;

                  return (
                    <div key={item.id} className={`flex gap-3 `}>
                      <div className="w-16 h-16 flex-shrink-0">
                        <Image
                          src={primaryImage || "/placeholder.svg"}
                          alt={productName || "Product"}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {productName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(
                            (item.product.price || 0) * item.quantity,
                            item.product.currency,
                            locale
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 border-t pt-4">
                <div className={`flex justify-between `}>
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(
                      subtotal,
                      cart.items[0]?.product.currency,
                      locale
                    )}
                  </span>
                </div>
                <div className={`flex justify-between`}>
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className={`flex justify-between`}>
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">
                    {formatPrice(tax, cart.items[0]?.product.currency, locale)}
                  </span>
                </div>
                <div
                  className={`flex justify-between text-lg font-bold border-t pt-3`}
                >
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      total,
                      cart.items[0]?.product.currency,
                      locale
                    )}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <Button
                size="lg"
                className="w-full bg-secondary-600 hover:bg-secondary-700 mb-4"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 `}>
                    <CreditCard className="h-5 w-5" />
                    Place Order
                  </div>
                )}
              </Button>

              {/* Security Notice */}
              <div className={`flex items-center gap-2 text-xs text-gray-500 `}>
                <Lock className="h-3 w-3" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
