"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

import { formatPrice } from "@/lib/common/cart";

import { toast } from "sonner";
import { redirectToCheckout } from "../_actions/checkout";
import { useCart } from "@/components/_core/providers/cart-provider";
import { useLocale, useTranslations } from "next-intl";
import SafeImage from "@/components/_common/safe-image";
import {
  getProductImageUrl,
  getFirstImageUrl,
} from "@/lib/constants/supabase-storage";
import Image from "next/image";

export default function CartPageClient() {
  const { cart, updateQuantity, removeItem, clear } = useCart();
  const t = useTranslations("cart");
  const tNav = useTranslations("header.nav");
  const locale = useLocale();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error(t("toast.cart.empty"));
      return;
    }

    setIsCheckingOut(true);
    const result = await redirectToCheckout(cart.items);
    if (result.success) {
      toast.success(t("toast.cart.checkoutSuccess"));
    } else {
      toast.error(result.error || t("toast.cart.checkoutFailed"));
    }
    setIsCheckingOut(false);


  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t("empty.title")}
            </h1>
            <p className="text-gray-600 mb-8">{t("empty.description")}</p>
            <Link href="/products">
              <Button
                size="lg"
                className="bg-secondary-600 hover:bg-secondary-700"
              >
                {t("empty.shopNow")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className={`flex items-center gap-2 text-sm text-gray-600 mb-4`}>
            <Link href="/" className="hover:text-gray-900">
              {tNav("home")}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{t("title")}</span>
          </div>
          <div className={`flex items-center justify-between`}>
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
            <Badge variant="secondary" className="text-sm">
              {cart.items.length} {cart.items.length === 1 ? t("item") : t("items")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const primaryImage = item.product.primary_image
                ? getProductImageUrl(item.product.primary_image)
                : getFirstImageUrl(item.product.images);

              const productName =
                locale === "ar"
                  ? item.product.name_ar || item.product.name_en
                  : item.product.name_en;

              const productPrice = item.product.price || 0;
              const itemTotal = productPrice * item.quantity;

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className={`flex gap-4`}>
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0">
                        <Image
                          src={primaryImage || "/placeholder.svg"}
                          alt={productName || t("seo.product.defaultTitle")}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`flex justify-between items-start mb-2`}
                        >
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="text-lg font-semibold text-gray-900 hover:text-secondary-600 line-clamp-2"
                            >
                              {productName}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatPrice(
                                productPrice,
                                item.product.currency,
                                locale
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div className={`flex items-center justify-between`}>
                          <div className={`flex items-center gap-2`}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(
                              itemTotal,
                              item.product.currency,
                              locale
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {t("summary.title")}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className={`flex justify-between`}>
                    <span className="text-gray-600">
                      {t("summary.subtotal")}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(
                        cart.total,
                        cart.items[0]?.product.currency,
                        locale
                      )}
                    </span>
                  </div>
                  <div className={`flex justify-between`}>
                    <span className="text-gray-600">
                      {t("summary.shipping")}
                    </span>
                    <span className="flex items-center text-xs text-gray-600">
                      {t("shippingCalculated")}
                    </span>
                  </div>
                  <div className={`flex justify-between`}>
                    <span className="text-gray-600">{t("summary.tax")}</span>
                    <span className="font-semibold">
                      {formatPrice(
                        cart.total * 0.05,
                        cart.items[0]?.product.currency,
                        locale
                      )}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between text-lg font-bold border-t pt-3`}
                  >
                    <span>{t("summary.total")}</span>
                    <span>
                      {formatPrice(
                        cart.total * 1.05,
                        cart.items[0]?.product.currency,
                        locale
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-secondary-600 hover:bg-secondary-700 mb-4"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2`}>
                      <span>{t("checkout")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={clear}
                >
                  {t("clear")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
