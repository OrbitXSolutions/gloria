'use client'

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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    AlertCircle,
    X,
} from "lucide-react";
import { toast } from "sonner";

import type { ProductWithUserData, Database } from "@/lib/types/database.types";
import { CheckoutFormData, checkoutSchema } from "@/lib/schemas/checkout";
import { formatPrice } from "@/lib/common/cart";
import type { CheckoutData } from "@/lib/common/checkout";
import { useLocale, useTranslations } from "next-intl";
import SafeImage from "@/components/_common/safe-image";
import {
    getProductImageUrl,
    getFirstImageUrl,
} from "@/lib/constants/supabase-storage";
import Image from "next/image";
import { PhoneInput } from "@/components/ui/phone-input";

// Types
type User = Database["public"]["Tables"]["users"]["Row"];
type Address = Database["public"]["Tables"]["addresses"]["Row"];
type State = Database["public"]["Tables"]["states"]["Row"];

type Props = {
    product: ProductWithUserData;
    user: User | null;
    userAddresses: Address[];
    uaeStates: State[];
};

export default function CheckoutNowPageClient({ product, user, userAddresses, uaeStates }: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [checkedState, setCheckedState] = useState<State | undefined>(uaeStates[0]);

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            email: "",
            password: user ? undefined : "",
            confirmPassword: user ? undefined : "",
            fullName: "",
            phone: "",
            address: "",
            stateCode: uaeStates[0]?.code || "",
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
            const email = user?.email || "";

            form.setValue("email", email);
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
        const state = uaeStates.find((s) => s.code === stateCode);
        return state
            ? locale === "ar"
                ? state.name_ar
                : state.name_en
            : stateCode;
    };

    // Calculate totals for single product
    const subtotal = (product.price || 0) * quantity;
    const shipping = checkedState?.delivery_fee ?? 0;
    const total = subtotal + shipping;

    const handleAuthenticatedCheckout = async (checkoutData: CheckoutData) => {
        const response = await fetch('/api/checkout/authenticated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData)
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || t('toast.checkout.checkoutFailed'))
        }

        return await response.json()
    }

    const handleGuestCheckout = async (checkoutData: CheckoutData) => {
        const response = await fetch('/api/checkout/guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData)
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || t('toast.checkout.checkoutFailed'))
        }

        return await response.json()
    }

    // Handle form submit
    const onSubmit = async (data: CheckoutFormData) => {
        setIsLoading(true)
        setError(null) // Clear previous errors
        try {
            // Ensure stateCode is set when using an existing address
            let stateCode = data.stateCode
            if (data.selectedAddressId && !data.useNewAddress) {
                const selectedAddress = userAddresses.find(a => a.id === data.selectedAddressId)
                stateCode = selectedAddress?.state_code || data.stateCode
            }

            // Build a single-item cart for Buy Now
            const cartItems: CheckoutData['cartItems'] = [
                {
                    id: Date.now(),
                    product: product as any,
                    quantity,
                    addedAt: new Date().toISOString()
                }
            ]

            const checkoutData: CheckoutData = {
                email: data.email,
                password: user ? undefined : data.password,
                confirmPassword: user ? undefined : data.confirmPassword,
                fullName: data.fullName,
                phone: data.phone,
                address: data.address,
                stateCode,
                notes: data.notes,
                selectedAddressId: data.selectedAddressId,
                cartItems
            }

            const result = user
                ? await handleAuthenticatedCheckout(checkoutData)
                : await handleGuestCheckout(checkoutData)

            if (result.success && result.orderCode) {
                toast.success(t('toast.checkout.orderPlaced'), {
                    description: t('toast.checkout.orderConfirmed', { orderCode: result.orderCode }),
                    duration: 5000
                })
                router.push(`/orders/${result.orderCode}`)
            } else {
                const errorMessage = result.error || t('toast.checkout.checkoutFailedDescription')
                setError(errorMessage)
                toast.error(t('toast.checkout.checkoutFailed'), {
                    description: errorMessage,
                    duration: 5000
                })
            }
        } catch (error: any) {
            const errorMessage = error.message || t('toast.checkout.checkoutFailedDescription')
            setError(errorMessage)
            toast.error(t('toast.checkout.checkoutFailed'), {
                description: errorMessage,
                duration: 5000
            })
        } finally {
            setIsLoading(false)
        }
    };

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
                        <span className="text-gray-900">{t("products.buyNow")}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{t("products.buyNow")}</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Error Alert at the top */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setError(null)}
                                className="h-auto p-1 hover:bg-transparent"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>

                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid lg:grid-cols-3 gap-8"
                    >
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Back Button */}
                            <Link href="/products">
                                <Button type="button" variant="ghost" className={``}>
                                    <ArrowLeft className={`h-4 w-4 ${locale == "ar" ? "ml-2 rotate-180" : "mr-2"}`} />
                                    {t("common.back")} {t("header.nav.products")}
                                </Button>
                            </Link>

                            {/* Customer Information for Logged-in Users */}
                            {user && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className={`flex items-center gap-3`}>
                                            <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                                                <User className="h-4 w-4 text-secondary-600" />
                                            </div>
                                            <div className="px-3">{t("checkout.account.customerInfo")}</div>
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
                                                        <Input
                                                            placeholder={t("checkout.account.emailPlaceholder")}
                                                            {...field}
                                                            disabled={true}
                                                            className="bg-gray-50"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}

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
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder={t("checkout.account.confirmPasswordPlaceholder")}
                                                                    {...field}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="absolute end-2 top-1/2 transform -translate-y-1/2 p-1"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                                                        <p className="text-gray-600 mb-1">{address.address}</p>
                                                                        <p className="text-gray-600">
                                                                            {address.state_code && getStateName(address.state_code)}, UAE
                                                                        </p>
                                                                        {address.notes && (
                                                                            <p className="text-sm text-gray-500 mt-2">{address.notes}</p>
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
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>{t("checkout.deliveryAddress.useNewAddress")}</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {/* New Address Form */}
                                    {(form.watch("useNewAddress") || !user || userAddresses.length === 0) && (
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
                                                                <Input placeholder={t("checkout.deliveryAddress.fullNamePlaceholder")} {...field} />
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
                                                            <Input placeholder={t("checkout.deliveryAddress.addressPlaceholder")} {...field} />
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
                                                                setCheckedState(uaeStates.find((s) => s.code === value));
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
                                                                {uaeStates.map((state) => (
                                                                    <SelectItem key={state.code} value={state.code}>
                                                                        {locale === "ar" ? state.name_ar : state.name_en}
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
                                                            <Textarea placeholder={t("checkout.deliveryAddress.notesPlaceholder")} rows={3} {...field} />
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
                                    {/* Product Item */}
                                    <div className="space-y-4">
                                        <div className={`flex gap-3`}>
                                            <div className="w-16 h-16 flex-shrink-0">
                                                <Image
                                                    src={getProductImageUrl(product.primary_image) || getFirstImageUrl(product.images) || "/placeholder.svg"}
                                                    alt={product.name_en || "Product"}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                    {locale === "ar" ? product.name_ar || product.name_en : product.name_en}
                                                </h3>
                                                <p className="text-sm text-gray-500">{t("checkout.orderSummary.quantity")}: {quantity}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {formatPrice((product.price || 0) * quantity, product.currency, locale)}
                                                    </span>
                                                    {product.old_price && product.old_price > (product.price || 0) && (
                                                        <span className="text-xs text-gray-500 line-through">
                                                            {formatPrice(product.old_price, product.currency, locale)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span>{t("checkout.orderSummary.quantityLabel")}</span>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={product.quantity || 99}
                                                        value={quantity}
                                                        onChange={e => setQuantity(Number(e.target.value))}
                                                        className="border rounded px-2 py-1 w-20"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Totals */}
                                    <div className="space-y-3 border-t pt-4">
                                        <div className={`flex justify-between `}>
                                            <span className="text-gray-600">{t("checkout.orderSummary.subtotal")}</span>
                                            <span className="font-semibold">
                                                {formatPrice(subtotal, product.currency, locale)}
                                            </span>
                                        </div>
                                        <div className={`flex justify-between`}>
                                            <span className="text-gray-600">{t("checkout.orderSummary.shipping")}</span>
                                            <span className="font-semibold text-gray-600">
                                                {!checkedState
                                                    ? t("checkout.orderSummary.selectState")
                                                    : formatPrice(shipping, product.currency, locale)}
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

                                        <div className={`flex justify-between text-lg font-bold border-t pt-3 `}>
                                            <span>{t("checkout.orderSummary.total")}</span>
                                            <span>
                                                {formatPrice(total, product.currency, locale)}
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

                                    {/* Error Alert under checkout button */}
                                    {error && (
                                        <Alert variant="destructive" className="mt-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="flex items-center justify-between">
                                                <span className="text-sm">{error}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setError(null)}
                                                    className="h-auto p-1 hover:bg-transparent"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Security Notice */}
                                    <div className={`flex items-center gap-2 text-xs text-gray-500`}>
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