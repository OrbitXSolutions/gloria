"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Filter,
  Eye,
  Download,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations, useLocale } from "next-intl";
import { formatPrice } from "@/lib/common/cart";
import type { User } from "@supabase/supabase-js";

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: Clock },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: XCircle },
  refunded: {
    label: "Refunded",
    color: "bg-orange-100 text-orange-800",
    icon: XCircle,
  },
  returned: {
    label: "Returned",
    color: "bg-orange-100 text-orange-800",
    icon: XCircle,
  },
};

interface OrdersClientProps {
  initialOrders: any[];
  authUser: User | null;
}

export function OrdersClient({ initialOrders, authUser }: OrdersClientProps) {
  const { user: clientAuthUser } = useSupabaseUser();
  const t = useTranslations("profile.orders");
  const tOrderStatus = useTranslations("orderStatus");
  const tSeo = useTranslations("seo");
  const locale = useLocale();
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Use the authUser from props, fallback to client auth user
  const currentUser = authUser || clientAuthUser;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items?.some(
        (item: any) =>
          item.products?.name_en
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.products?.name_ar
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t("authenticationRequired")}
        </h2>
        <p className="text-gray-600">
          {t("pleaseLoginToViewOrders")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t("errorLoadingOrders")}
        </h2>
        <p className="text-gray-600 mb-4">
          {error}
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t("downloadInvoice")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("searchOrders")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allOrders")}</SelectItem>
                <SelectItem value="pending">{tOrderStatus("pending")}</SelectItem>
                <SelectItem value="confirmed">{tOrderStatus("confirmed")}</SelectItem>
                <SelectItem value="processing">{tOrderStatus("processing")}</SelectItem>
                <SelectItem value="shipped">{tOrderStatus("shipped")}</SelectItem>
                <SelectItem value="delivered">{tOrderStatus("delivered")}</SelectItem>
                <SelectItem value="cancelled">{tOrderStatus("cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("noOrders")}
              </h3>
              <p className="text-gray-600">
                {t("noOrdersDescription")}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo =
              statusConfig[order.status as keyof typeof statusConfig] ||
              statusConfig.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t("orderNumber", { number: order.code || `ORD-${order.id}` })}
                        </h3>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {tOrderStatus(`${order.status}`)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{t("orderDate")}:</span>
                          <br />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">{t("orderTotal")}:</span>
                          <br />
                          {formatPrice(
                            order.total_price,
                            {
                              code: order.order_items?.[0]?.products?.currency_code || "AED",
                            },
                            locale
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{t("payment")}:</span>
                          <br />
                          {order.payment_method === "cash"
                            ? t("cashOnDelivery")
                            : t("cardPayment")}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">{t("items")}:</p>
                        {order.order_items?.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm text-gray-600"
                            >
                              <span>
                                {item.products?.name_en || tSeo("product.defaultTitle")} ×{" "}
                                {item.quantity}
                              </span>
                              <span>
                                {formatPrice(
                                  item.price,
                                  {
                                    code: order.order_items?.[0]?.products?.currency_code || "AED",
                                  },
                                  locale
                                )}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                      <Link href={`/orders/${order.code}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          {t("viewOrder")}
                        </Button>
                      </Link>
                      {order.status === "shipped" && (
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-2" />
                          {t("trackOrder")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
