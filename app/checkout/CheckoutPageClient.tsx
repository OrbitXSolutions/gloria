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
  CheckCircle2,
  Circle,
  AlertCircle
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
import { PhoneInput } from "@/components/ui/phone-input";
import { logger } from "@/lib/utils/logger";

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
  const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
  // Page level error (inline display under title)
  const [pageError, setPageError] = useState<string | null>(null);

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

  // Inline form errors (guest password fields)
  const [formErrors, setFormErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  // Derived password requirement state (guest only)
  const passwordValue = formData.password || '';
  const confirmValue = formData.confirmPassword || '';
  const lengthOk = passwordValue.length >= 8;
  const mixOk = /[A-Za-z]/.test(passwordValue) && /[0-9]/.test(passwordValue);
  const matchOk = passwordValue.length > 0 && confirmValue.length > 0 && passwordValue === confirmValue;

  // Initialize form data and address selection
  useEffect(() => {
    if (cart.items.length === 0 && !isCheckoutComplete) {
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
        // Set state code from default address
        setFormData(prev => ({
          ...prev,
          stateCode: defaultAddress.state_code || ""
        }));
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
    isCheckoutComplete,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Live validation for guest password / confirmPassword fields
    if (!user) {
      if (field === "password") {
        setFormErrors((prev) => ({
          ...prev,
          password:
            value.length > 0 && value.length < 8
              ? t("validation.password.tooShort")
              : "",
          confirmPassword:
            formData.confirmPassword && value !== formData.confirmPassword
              ? t("validation.password.mismatch")
              : prev.confirmPassword && value === formData.confirmPassword
                ? ""
                : prev.confirmPassword,
        }));
      } else if (field === "confirmPassword") {
        setFormErrors((prev) => ({
          ...prev,
          confirmPassword:
            value.length > 0 && value !== formData.password
              ? t("validation.password.mismatch")
              : "",
        }));
      }
    }
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
      throw new Error(errorData.error || t("toast.checkout.checkoutFailed"));
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
      throw new Error(errorData.error || t("toast.checkout.checkoutFailed"));
    }

    return await response.json();
  };

  const validateForm = (): string | null => {
    if (!user) {
      // Guest checkout validation
      if (!formData.email) return t("validation.email.required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return t("validation.email.invalid");
      if (!formData.password) return t("validation.password.required");
      if (!formData.confirmPassword) return t("validation.password.confirmRequired");
      if (formData.password !== formData.confirmPassword)
        return t("validation.password.mismatch");
      if (formData.password.length < 8)
        return t("validation.password.tooShort");
    }

    if (showNewAddressForm || !selectedAddressId) {
      // Address validation
      if (!formData.fullName.trim()) return t("validation.address.fullNameRequired");
      if (!formData.phone.trim()) return t("validation.address.phoneRequired");
      if (!/^[+]?[0-9\s\-$$$$]{7,15}$/.test(formData.phone.replace(/\s/g, "")))
        return t("validation.address.phoneInvalid");
      if (!formData.address.trim()) return t("validation.address.addressRequired");
      if (!formData.stateCode) return t("validation.address.emirateRequired");
    }

    // Ensure state is selected for shipping calculation
    if (!formData.stateCode) {
      return t("validation.address.emirateRequired");
    }

    if (!selectedAddressId && !showNewAddressForm && user) {
      return t("validation.address.selectOrAdd");
    }

    if (cart.items.length === 0) {
      return t("validation.cart.empty");
    }

    return null;
  };

  const handleCheckout = async () => {
    logger.buttonClick('checkout_place_order_click', {
      userAuthenticated: !!user,
      cartItems: cart.items.length,
    });

    const validationError = validateForm();
    if (validationError) {
      setPageError(validationError);
      toast.error(validationError);
      return;
    }

    if (cart.items.length === 0) {
      toast.error(t("toast.cart.empty"));
      router.push("/cart");
      return;
    }

    setPageError(null);
    setIsLoading(true);
    logger.info('Checkout submission started', { source: 'CheckoutPageClient', userAuthenticated: !!user });

    try {
      // Get state code from selected address if using existing address
      let stateCode = formData.stateCode;
      if (selectedAddressId && !showNewAddressForm) {
        const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
        stateCode = selectedAddress?.state_code || formData.stateCode;
      }

      const checkoutData: CheckoutData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        stateCode: stateCode,
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
      if ((result as any).errorCode === 'EXISTING_ACCOUNT_PASSWORD_MISMATCH') {
        const mismatchMsg = t('validation.password.mismatch') + ' - ' + t('auth.loginRequired');
        setPageError(mismatchMsg);
        toast.error(t('toast.checkout.checkoutFailed'), {
          description: mismatchMsg,
          duration: 6000,
        });
        logger.warn('Existing account password mismatch during checkout', { source: 'CheckoutPageClient', email: formData.email });
        setIsLoading(false);
        return;
      }
      if (result.success && result.orderCode) {
        // Set checkout complete flag to prevent cart redirect
        setIsCheckoutComplete(true);

        // Clear cart
        clear();

        toast.success(t("toast.checkout.orderPlaced"), {
          description: t("toast.checkout.orderConfirmed", { orderCode: result.orderCode }),
          duration: 5000,
        });

        logger.formSubmit('checkout_form', true, { orderCode: result.orderCode, userAuthenticated: !!user });
        // Redirect to order confirmation
        router.push(`/orders/${result.orderCode}`);
      } else {
        const errMsg = result.error || t("toast.checkout.checkoutFailedDescription");
        setPageError(errMsg);
        toast.error(t("toast.checkout.checkoutFailed"), {
          description: errMsg,
          duration: 5000,
        });
        logger.formSubmit('checkout_form', false, { error: errMsg });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const unexpected = t("toast.checkout.unexpectedErrorDescription");
      setPageError(unexpected);
      toast.error(t("toast.checkout.unexpectedError"), {
        description: unexpected,
        duration: 5000,
      });
      logger.error('Checkout unexpected error', { source: 'CheckoutPageClient', error: (error as Error)?.message });
    } finally {
      setIsLoading(false);
      logger.info('Checkout submission finished', { source: 'CheckoutPageClient' });
    }
  };

  // Calculate totals
  const subtotal = cart.total;
  const shipping = formData.stateCode ?
    uaeStates.find(s => s.code === formData.stateCode)?.delivery_fee || 0 : 0;
  const total = subtotal + shipping;

  // Helper function to get primary currency for the cart
  const getPrimaryCurrency = () => {
    if (cart.items.length === 0) return undefined;
    // Use the first item's currency as primary, assuming all items have same currency
    return cart.items[0]?.product.currency || undefined;
  };

  const primaryCurrency = getPrimaryCurrency();

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
            <span className="text-gray-900">{t("checkout.title")}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t("checkout.title")}</h1>
          {pageError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {pageError}
            </div>
          )}
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
                {t("checkout.backToCart")}
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
                    {t("checkout.account.title")}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("checkout.account.email")}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder={t("checkout.account.emailPlaceholder")}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("checkout.account.password")}
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          placeholder={t("checkout.account.passwordPlaceholder")}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute end-2 top-1/2 transform -translate-y-1/2 p-1"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {formErrors.password && !user && (
                        <p className="mt-2 text-[11px] text-red-600">{formErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("checkout.account.confirmPassword")}
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          placeholder={t("checkout.account.confirmPasswordPlaceholder")}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute end-2 top-1/2 transform -translate-y-1/2 p-1"
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
                      {!user && formErrors.confirmPassword && (
                        <p className="mt-2 text-[11px] text-red-600">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                    {/* Unified password requirements block spanning both columns */}
                    {!user && (
                      <div className="md:col-span-2 -mt-2 text-[11px] text-gray-600 leading-relaxed">
                        <p className="font-medium mb-1">{t("auth.passwordStrength.requirements")}{":"}</p>
                        <ul className="space-y-1">
                          <li className={`flex items-center gap-2 ${lengthOk ? 'text-green-600' : 'text-gray-500'}`}>
                            {lengthOk ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                            <span>{t("auth.passwordStrength.minLength")}</span>
                          </li>
                          <li className={`flex items-center gap-2 ${mixOk ? 'text-green-600' : 'text-gray-500'}`}>
                            {mixOk ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                            <span>{t("auth.passwordStrength.mixRecommendation")}</span>
                          </li>
                          {confirmValue.length > 0 && (
                            <li className={`flex items-center gap-2 ${matchOk ? 'text-green-600' : 'text-red-600'}`}>
                              {matchOk ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                              <span>{matchOk ? t("auth.passwordStrength.match") : t("auth.passwordStrength.noMatch")}</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    {t("checkout.account.termsNotice")}
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
                  {t("checkout.deliveryAddress.title")}
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
                                {t("checkout.deliveryAddress.default")}
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
                    {t("checkout.deliveryAddress.newAddress")}
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
                          {t("checkout.deliveryAddress.newAddress")}
                        </h3>
                        <Button
                          variant="ghost"
                          onClick={() => setShowNewAddressForm(false)}
                          className="text-gray-500"
                        >
                          {t("common.back")}
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          {t("checkout.deliveryAddress.fullName")}
                        </label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          placeholder={t("checkout.deliveryAddress.fullNamePlaceholder")}
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          {t("checkout.deliveryAddress.phone")}
                        </label>
                        <PhoneInput
                          id="phone"
                          value={formData.phone}
                          onChange={(value) => handleInputChange("phone", value)}
                          placeholder={t("checkout.deliveryAddress.phonePlaceholder")}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("checkout.deliveryAddress.address")}
                      </label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        placeholder={t("checkout.deliveryAddress.addressPlaceholder")}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("checkout.deliveryAddress.emirate")}
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
                        <option value="">{t("checkout.deliveryAddress.emiratePlaceholder")}</option>
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
                        {t("checkout.deliveryAddress.notes")}
                      </label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                        placeholder={t("checkout.deliveryAddress.notesPlaceholder")}
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
                {t("checkout.orderSummary.title")}
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
                          alt={productName || t("seo.product.defaultTitle")}
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
                          {t("checkout.orderSummary.quantity")}: {item.quantity}
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
                  <span className="text-gray-600">{t("checkout.orderSummary.subtotal")}</span>
                  <span className="font-semibold">
                    {formatPrice(
                      subtotal,
                      primaryCurrency,
                      locale
                    )}
                  </span>
                </div>
                <div className={`flex justify-between`}>
                  <span className="text-gray-600">{t("checkout.orderSummary.shipping")}</span>
                  <span className="font-semibold text-gray-600">
                    {!formData.stateCode
                      ? t("checkout.orderSummary.selectState")
                      : formatPrice(
                        shipping,
                        primaryCurrency,
                        locale
                      )}
                  </span>
                </div>

                {/* Payment Method */}
                <div className={`flex justify-between py-2 bg-yellow-50 px-3 rounded-lg border border-yellow-200`}>
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-medium">{t("checkout.orderSummary.paymentMethod")}</span>
                    <span className="text-sm text-gray-500">{t("checkout.orderSummary.payOnDelivery")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-700 font-semibold">💰</span>
                    <span className="text-yellow-800 font-semibold">{t("checkout.orderSummary.cashOnDelivery")}</span>
                  </div>
                </div>

                <div
                  className={`flex justify-between text-lg font-bold border-t pt-3`}
                >
                  <span>{t("checkout.orderSummary.total")}</span>
                  <span>
                    {formatPrice(
                      total,
                      primaryCurrency,
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
                    {t("checkout.orderSummary.processing")}
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 `}>
                    <CreditCard className="h-5 w-5" />
                    {t("checkout.orderSummary.completeOrder")}
                  </div>
                )}
              </Button>

              {/* Security Notice */}
              <div className={`flex items-center gap-2 text-xs text-gray-500 `}>
                <Lock className="h-3 w-3" />
                <span>{t("checkout.orderSummary.secureNotice")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
