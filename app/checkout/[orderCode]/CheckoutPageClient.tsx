"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
import { CheckoutFormData, checkoutSchema } from "@/lib/schemas/checkout";
import { completeCheckout } from "@/app/_actions/checkout";

import { formatPrice } from "@/lib/common/cart";

import { Database, OrderWithItems } from "@/lib/types/database.types";
import { useLocale, useTranslations } from "next-intl";
import SafeImage from "@/components/_common/safe-image";
import {
  getProductImageUrl,
  getFirstImageUrl,
} from "@/lib/constants/supabase-storage";
import Image from "next/image";
import { useCart } from "@/components/_core/providers/cart-provider";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];
type Order = OrderWithItems;
type Address = Database["public"]["Tables"]["addresses"]["Row"];
type State = Database["public"]["Tables"]["states"]["Row"];
interface CheckoutPageClientProps {
  user?: UserProfile | null;
  order: Order;
  userAddresses: Address[];
  states: State[];
}

export default function CheckoutPageClient({
  user,
  order,
  userAddresses,
  states,
}: CheckoutPageClientProps) {
  const t = useTranslations();
  const { clear } = useCart();
  const locale = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkedState, setCheckedState] = useState<State | undefined>(
    states[0]
  );

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      address: "",
      stateCode: states[0]?.code || "",
      notes: "",
      selectedAddressId: undefined,
      useNewAddress: !user || userAddresses.length === 0,
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const firstName = user?.first_name || "";
      const lastName = user?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const phone = user?.phone || user.phone || "";

      form.setValue("fullName", fullName);
      form.setValue("phone", phone);

      // Select default address
      const defaultAddress = userAddresses.find((addr) => addr.is_default);
      if (defaultAddress) {
        form.setValue("selectedAddressId", defaultAddress.id);
        form.setValue("useNewAddress", false);
      }
    }
  }, [user, userAddresses, form]);

  const getStateName = (stateCode: string) => {
    const state = states.find((s) => s.code === stateCode);
    return state
      ? locale === "ar"
        ? state.name_ar
        : state.name_en
      : stateCode;
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);

    try {
      if (!order.code) {
        toast.error("Order not found", {
          description: "Please try again or contact support",
          duration: 5000,
        });
        return;
      }
      const result = await completeCheckout(order.code, data);

      if (result.success) {
        clear();
        toast.success("Order placed successfully!", {
          description: `Order ${result.orderCode} has been confirmed`,
          duration: 5000,
        });

        router.push(`/orders/${result.orderCode}`);
      } else {
        toast.error("Checkout failed", {
          description: result.error || "An unexpected error occurred",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred", {
        description:
          "Please try again or contact support if the problem persists",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  if (!order.order_items || order.order_items?.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-900">
          No items in your cart
        </h2>
        <p className="text-gray-600">
          Please add items to your cart before proceeding to checkout.
        </p>
      </div>
    );
  }
  const subtotal = order.order_items.reduce(
    (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
    0
  );
  const tax = subtotal * 0.05; // 5% VAT
  const shipping = checkedState?.delivery_fee ?? 0; // Free shipping
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div
            className={`flex items-center gap-2 text-sm text-gray-600 mb-4 `}
          >
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Back Button */}
              <Link href="/cart">
                <Button type="button" variant="ghost" className={``}>
                  <ArrowLeft
                    className={`h-4 w-4 ${
                      locale == "ar" ? "ml-2 rotate-180" : "mr-2"
                    }`}
                  />
                  Back to Cart
                </Button>
              </Link>

              {/* Guest User Registration */}
              {!user && (
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-3}`}>
                      <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-secondary-600" />
                      </div>
                      <div className="px-3">Account Information</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a password"
                                  {...field}
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Confirm your password"
                                  {...field}
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <p className="text-sm text-gray-600">
                      By creating an account, you agree to our Terms of Service
                      and Privacy Policy.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Address Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-3 `}>
                    <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-secondary-600" />
                    </div>
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Existing Addresses */}
                  {user && userAddresses.length > 0 && (
                    <FormField
                      control={form.control}
                      name="selectedAddressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              value={field.value?.toString()}
                              onValueChange={(value) => {
                                field.onChange(Number.parseInt(value));
                                form.setValue("useNewAddress", false);
                              }}
                              className="space-y-4"
                            >
                              {userAddresses.map((address) => (
                                <div
                                  key={address.id}
                                  className="flex items-start space-x-3"
                                >
                                  <RadioGroupItem
                                    value={address.id.toString()}
                                    id={`address-${address.id}`}
                                  />
                                  <label
                                    htmlFor={`address-${address.id}`}
                                    className="flex-1 cursor-pointer border rounded-lg p-4 hover:border-gray-300"
                                  >
                                    <div
                                      className={`flex items-center gap-2 mb-2 `}
                                    >
                                      <h3 className="font-semibold text-gray-900">
                                        {address.full_name}
                                      </h3>
                                      {address.is_default && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-gray-600 mb-1">
                                      {address.phone}
                                    </p>
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
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {user && userAddresses.length > 0 && (
                    <FormField
                      control={form.control}
                      name="useNewAddress"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Use a new address</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* New Address Form */}
                  {(form.watch("useNewAddress") ||
                    !user ||
                    userAddresses.length === 0) && (
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user && userAddresses.length > 0
                          ? t("checkout.newAddress")
                          : t("checkout.deliveryAddress")}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter full name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter phone number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter full address"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stateCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emirate *</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                setCheckedState(
                                  states.find((s) => s.code === value)
                                );
                                field.onChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Emirate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {states.map((state) => (
                                  <SelectItem
                                    key={state.code}
                                    value={state.code}
                                  >
                                    {locale === "ar"
                                      ? state.name_ar
                                      : state.name_en}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special delivery instructions..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div className="space-y-4">
                    {order.order_items.map((item) => {
                      const primaryImage = item.product?.primary_image
                        ? getProductImageUrl(item.product.primary_image)
                        : getFirstImageUrl(item.product?.images);

                      const productName =
                        locale === "ar"
                          ? item.product?.name_ar || item.product?.name_en
                          : item.product?.name_en;

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
                                (item.price ?? 0) * (item.quantity ?? 1),
                                { code: item.product?.currency_code },
                                locale
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t pt-4">
                    <div className={`flex justify-between `}>
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        {formatPrice(
                          subtotal,
                          {
                            code: order.order_items[0]?.product?.currency_code,
                          },
                          locale
                        )}
                      </span>
                    </div>
                    <div className={`flex justify-between`}>
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-gray-600">
                        {!checkedState
                          ? "Select State"
                          : formatPrice(
                              shipping,
                              {
                                code: order.order_items[0]?.product
                                  ?.currency_code,
                              },
                              locale
                            )}
                      </span>
                    </div>
                    <div className={`flex justify-between `}>
                      <span className="text-gray-600">VAT (5%)</span>
                      <span className="font-semibold">
                        {formatPrice(
                          tax,
                          {
                            code: order.order_items[0]?.product?.currency_code,
                          },
                          locale
                        )}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between text-lg font-bold border-t pt-3 `}
                    >
                      <span>Total</span>
                      <span>
                        {formatPrice(
                          total,
                          {
                            code: order.order_items[0]?.product?.currency_code,
                          },
                          locale
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-secondary-600 hover:bg-secondary-700"
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
                        Complete Order
                      </div>
                    )}
                  </Button>

                  {/* Security Notice */}
                  <div
                    className={`flex items-center gap-2 text-xs text-gray-500`}
                  >
                    <Lock className="h-3 w-3" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
