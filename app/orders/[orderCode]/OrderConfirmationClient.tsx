"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, MapPin, ArrowLeft } from "lucide-react";

import { formatPrice } from "@/lib/common/cart";
import { useLocale, useTranslations } from "next-intl";
import SafeImage from "@/components/_common/safe-image";
import {
  getProductImageUrl,
  getFirstImageUrl,
} from "@/lib/constants/supabase-storage";
import Image from "next/image";

interface OrderConfirmationClientProps {
  order: any; // Order with address and order_items
}

export default function OrderConfirmationClient({
  order,
}: OrderConfirmationClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const getProductName = (product: any) => {
    return locale === "ar"
      ? product.name_ar || product.name_en
      : product.name_en;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-secondary-100 text-secondary-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
            <span className="text-gray-900">Order Confirmation</span>
          </div>
          <div className={`flex items-center gap-4`}>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order Confirmed!
              </h1>
              <p className="text-gray-600">Thank you for your purchase</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back Button */}
            <Link href="/">
              <Button variant="ghost" className={``}>
                <ArrowLeft
                  className={`h-4 w-4 ${
                    locale == "ar" ? "ml-2 rotate-180" : "mr-2"
                  }`}
                />
                Continue Shopping
              </Button>
            </Link>

            {/* Order Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`flex items-center gap-3 mb-6`}>
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-secondary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Order Number
                  </h3>
                  <p className="text-gray-600">{order.code}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Order Date
                  </h3>
                  <p className="text-gray-600">
                    {new Date(order.created_at).toLocaleDateString(
                      locale === "ar" ? "ar-SA" : "en-US"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Total Amount
                  </h3>
                  <p className="text-lg font-bold text-secondary-600">
                    {formatPrice(
                      order.total_price,
                      { code: order.currency_code },
                      locale
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`flex items-center gap-3 mb-6`}>
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-secondary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delivery Address
                </h2>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-gray-900">
                  {order.address.full_name}
                </p>
                <p className="text-gray-600">{order.address.phone}</p>
                <p className="text-gray-600">{order.address.address}</p>
                <p className="text-gray-600">UAE</p>
                {order.address.notes && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Notes:</span>{" "}
                    {order.address.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Items
              </h2>

              <div className="space-y-4">
                {order.order_items.map((item: any) => {
                  const primaryImage = item.product.primary_image
                    ? getProductImageUrl(item.product.primary_image)
                    : getFirstImageUrl(item.product.images);

                  return (
                    <div
                      key={item.id}
                      className={`flex gap-4 p-4 border border-gray-100 rounded-lg `}
                    >
                      <div className="w-20 h-20 flex-shrink-0">
                        <Image
                          src={primaryImage || "/placeholder.svg"}
                          alt={getProductName(item.product)}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {getProductName(item.product)}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Quantity: {item.quantity}
                        </p>
                        <div className={`flex items-center justify-between `}>
                          <span className="text-sm text-gray-600">
                            {formatPrice(
                              item.price,
                              { code: order.currency_code },
                              locale
                            )}{" "}
                            each
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(
                              item.total_price,
                              { code: order.currency_code },
                              locale
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className={`flex justify-between `}>
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(
                      order.subtotal || order.total_price,
                      { code: order.currency_code },
                      locale
                    )}
                  </span>
                </div>
                <div className={`flex justify-between `}>
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className={`flex justify-between `}>
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">
                    {formatPrice(
                      order.total_price - (order.subtotal || order.total_price),
                      { code: order.currency_code },
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
                      order.total_price,
                      { code: order.currency_code },
                      locale
                    )}
                  </span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What's Next?
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You'll receive an email confirmation shortly</li>
                  <li>• We'll notify you when your order ships</li>
                  <li>• Track your order status anytime</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  Track Order
                </Button>
                <Link href="/products">
                  <Button className="w-full bg-secondary-600 hover:bg-secondary-700">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
