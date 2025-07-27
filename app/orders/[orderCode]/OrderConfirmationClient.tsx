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
            <span className="text-gray-900">{t("orderConfirmation.breadcrumb")}</span>
          </div>
          <div className={`flex items-center gap-4`}>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("orderConfirmation.title")}
              </h1>
              <p className="text-gray-600">{t("orderConfirmation.subtitle")}</p>
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
                  className={`h-4 w-4 ${locale == "ar" ? "ml-2 rotate-180" : "mr-2"
                    }`}
                />
                {t("orderConfirmation.continueShopping")}
              </Button>
            </Link>

            {/* Order Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className={`flex items-center gap-3 mb-6`}>
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <Package className="h-4 w-4 text-secondary-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("orderConfirmation.orderInformation")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("orderConfirmation.orderNumber")}
                  </h3>
                  <p className="text-gray-600">{order.code}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("orderConfirmation.orderDate")}
                  </h3>
                  <p className="text-gray-600">
                    {new Date(order.created_at).toLocaleDateString(
                      locale === "ar" ? "ar-SA" : "en-US"
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t("orderConfirmation.status")}</h3>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("orderConfirmation.totalAmount")}
                  </h3>
                  <p className="text-lg font-bold text-secondary-600">
                    {formatPrice(
                      order.total_price,
                      {
                        code: order.order_items[0]?.product?.currency_code,
                      },
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
                  {t("orderConfirmation.deliveryAddress")}
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
                    <span className="font-medium">{t("orderConfirmation.notes")}:</span>{" "}
                    {order.address.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {t("orderConfirmation.orderItems")}
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
                          {t("orderConfirmation.quantity")}: {item.quantity}
                        </p>
                        <div className={`flex items-center justify-between `}>
                          <span className="text-sm text-gray-600">
                            {formatPrice(
                              item.price,
                              {
                                code: order.order_items[0]?.product
                                  ?.currency_code,
                              },
                              locale
                            )}{" "}
                            {t("orderConfirmation.each")}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(
                              item.price * item.quantity,
                              {
                                code: order.order_items[0]?.product
                                  ?.currency_code,
                              },
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
                {t("orderConfirmation.orderSummary")}
              </h2>

              <div className="space-y-3 mb-6">
                <div className={`flex justify-between `}>
                  <span className="text-gray-600">{t("orderConfirmation.subtotal")}</span>
                  <span className="font-semibold">
                    {formatPrice(
                      order.subtotal || order.total_price,
                      {
                        code: order.order_items[0]?.product?.currency_code,
                      },
                      locale
                    )}
                  </span>
                </div>
                <div className={`flex justify-between `}>
                  <span className="text-gray-600">{t("orderConfirmation.shipping")}</span>
                  <span className="font-semibold text-green-600">{t("orderConfirmation.free")}</span>
                </div>

                <div
                  className={`flex justify-between text-lg font-bold border-t pt-3 `}
                >
                  <span>{t("orderConfirmation.total")}</span>
                  <span>
                    {formatPrice(
                      order.total_price,
                      {
                        code: order.order_items[0]?.product?.currency_code,
                      },
                      locale
                    )}
                  </span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t("orderConfirmation.whatsNext")}
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t("orderConfirmation.emailConfirmation")}</li>
                  <li>• {t("orderConfirmation.shipmentNotification")}</li>
                  <li>• {t("orderConfirmation.trackOrderStatus")}</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link href="/profile/orders">
                  <Button variant="outline" className="w-full">
                    {t("orders.title")}
                  </Button>
                </Link>
                <Link href="/products">
                  <Button className="w-full bg-secondary-600 hover:bg-secondary-700">
                    {t("orderConfirmation.continueShopping")}
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
