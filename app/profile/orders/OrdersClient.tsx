"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getUserOrders } from "@/lib/common/profile-queries";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";

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

export function OrdersClient() {
  const { user: authUser } = useSupabaseUser();
  const t = useTranslations("profile.orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function loadOrders() {
      if (!authUser?.id) return;

      try {
        const ordersData = await getUserOrders(Number.parseInt(authUser.id));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [authUser]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_items?.some(
        (item: any) =>
          item.product?.name_en
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.product?.name_ar
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesTab = activeTab === "all" || order.status === activeTab;

    return matchesSearch && matchesStatus && matchesTab;
  });

  if (loading) {
    return <Spinner />;
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Order Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">{t("allOrders")}</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
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
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {t("orderNumber", { number: order.code || `ORD-${order.id}` })}
                          </h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
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
                            <br />${order.total_price?.toFixed(2) || "0.00"}
                          </div>
                          <div>
                            <span className="font-medium">Payment:</span>
                            <br />
                            {order.payment_method === "cash"
                              ? "Cash on Delivery"
                              : "Card Payment"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">Items:</p>
                          {order.order_items?.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm text-gray-600"
                              >
                                <span>
                                  {item.product?.name_en || t("seo.product.defaultTitle")} ×{" "}
                                  {item.quantity}
                                </span>
                                <span>${item.price?.toFixed(2) || "0.00"}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          {t("viewOrder")}
                        </Button>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
