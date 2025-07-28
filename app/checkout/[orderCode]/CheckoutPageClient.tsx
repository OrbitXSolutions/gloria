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
import { PhoneInput } from "@/components/ui/phone-input";

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
        toast.error(t("toast.checkout.orderNotFound"), {
          description: t("toast.checkout.orderNotFoundDescription"),
          duration: 5000,
        });
        return;
      }
      const result = await completeCheckout(order.code, data);

      if (result.success) {
        clear();
        toast.success(t("toast.checkout.orderPlaced"), {
          description: t("toast.checkout.orderConfirmed", { orderCode: result.orderCode || "" }),
          duration: 5000,
        });

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
  const shipping = checkedState?.delivery_fee ?? 0; // Delivery fee based on selected state
  const total = subtotal + shipping;

  // Helper function to get primary currency for the order
  const getPrimaryCurrency = () => {
    if (!order.order_items || order.order_items.length === 0) return undefined;
    const firstItem = order.order_items[0];
    if (!firstItem?.product?.currency_code) return undefined;

    // Create a currency object with the code
    return {
      code: firstItem.product.currency_code,
      symbol_en: null,
      symbol_ar: null
    };
  };

  const primaryCurrency = getPrimaryCurrency();

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
            <span className="text-gray-900">{t("checkout.title")}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t("checkout.title")}</h1>
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
                    className={`h-4 w-4 ${locale == "ar" ? "ml-2 rotate-180" : "mr-2"
                      }`}
                  />
                  {t("checkout.backToCart")}
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
                      <div className="px-3">{t("checkout.account.title")}</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("checkout.account.email")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("checkout.account.emailPlaceholder")} {...field} />
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
                            <FormLabel>{t("checkout.account.password")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder={t("checkout.account.passwordPlaceholder")}
                                  {...field}
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
                            <FormLabel>{t("checkout.account.confirmPassword")}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder={t("checkout.account.confirmPasswordPlaceholder")}
                                  {...field}
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <p className="text-sm text-gray-600">
                      {t("checkout.account.termsNotice")}
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
                    {t("checkout.deliveryAddress.title")}
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
                                          {t("checkout.deliveryAddress.default")}
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
                            <FormLabel>{t("checkout.deliveryAddress.useNewAddress")}</FormLabel>
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
                            ? t("checkout.deliveryAddress.newAddress")
                            : t("checkout.deliveryAddress.title")}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("checkout.deliveryAddress.fullName")}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("checkout.deliveryAddress.fullNamePlaceholder")}
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
                                <FormLabel>{t("checkout.deliveryAddress.phone")}</FormLabel>
                                <FormControl>
                                  <PhoneInput
                                    placeholder={t("checkout.deliveryAddress.phonePlaceholder")}
                                    value={field.value}
                                    onChange={field.onChange}
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
                              <FormLabel>{t("checkout.deliveryAddress.address")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("checkout.deliveryAddress.addressPlaceholder")}
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
                              <FormLabel>{t("checkout.deliveryAddress.emirate")}</FormLabel>
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
                                    <SelectValue placeholder={t("checkout.deliveryAddress.emiratePlaceholder")} />
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
                              <FormLabel>{t("checkout.deliveryAddress.notes")}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={t("checkout.deliveryAddress.notesPlaceholder")}
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
                  <CardTitle>{t("checkout.orderSummary.title")}</CardTitle>
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
                              {t("checkout.orderSummary.quantity")}: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(
                                (item.price ?? 0) * (item.quantity ?? 1),
                                primaryCurrency,
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
                        {!checkedState
                          ? t("checkout.orderSummary.selectState")
                          : formatPrice(
                            shipping,
                            primaryCurrency,
                            locale
                          )}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between text-lg font-bold border-t pt-3 `}
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
                    type="submit"
                    size="lg"
                    className="w-full bg-secondary-600 hover:bg-secondary-700"
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
                  <div
                    className={`flex items-center gap-2 text-xs text-gray-500`}
                  >
                    <Lock className="h-3 w-3" />
                    <span>{t("checkout.orderSummary.secureNotice")}</span>
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
