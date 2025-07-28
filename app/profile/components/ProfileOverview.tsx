"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Heart,
  Crown,
  Edit,
  TrendingUp,
  Calendar,
  Star,
  Gift,
  Shield,
  Bell,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations, useLocale } from "next-intl";
import { formatPrice } from "@/lib/common/cart";
import type { User } from "@supabase/supabase-js";

interface UserWithStats {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string | null;
  stats: {
    totalOrders: number;
    totalFavorites: number;
    totalSpent: number;
    vipStatus: string;
  };
}

interface ProfileOverviewProps {
  initialUserProfile: UserWithStats | null;
  initialRecentOrders: any[];
  initialRecentFavorites: any[];
  authUser: User | null;
}

export function ProfileOverview({
  initialUserProfile,
  initialRecentOrders,
  initialRecentFavorites,
  authUser,
}: ProfileOverviewProps) {
  const { user: clientAuthUser, loading: authLoading } = useSupabaseUser();
  const t = useTranslations("profile.overview");
  const tStats = useTranslations("profile.overview.stats");
  const tSeo = useTranslations("seo");
  const locale = useLocale();
  const [user, setUser] = useState<UserWithStats | null>(initialUserProfile);
  const [recentOrders, setRecentOrders] = useState<any[]>(initialRecentOrders);
  const [recentFavorites, setRecentFavorites] = useState<any[]>(
    initialRecentFavorites
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the authUser from props, fallback to client auth user
  const currentUser = authUser || clientAuthUser;

  // No need for useEffect data fetching since data is passed as props

  const getVipBadgeColor = (status: string) => {
    switch (status) {
      case "Gold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Silver":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Bronze":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", color: "bg-gray-100 text-gray-800" },
      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
      processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
      shipped: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
      delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
      failed: { label: "Failed", color: "bg-red-100 text-red-800" },
      refunded: { label: "Refunded", color: "bg-orange-100 text-orange-800" },
      returned: { label: "Returned", color: "bg-orange-100 text-orange-800" },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  const getVipProgress = (status: string, spent: number) => {
    switch (status) {
      case "Gold":
        return Math.min((spent / 1000) * 100, 100);
      case "Silver":
        return Math.min((spent / 500) * 100, 100);
      case "Bronze":
        return Math.min((spent / 100) * 100, 100);
      default:
        return Math.min((spent / 100) * 100, 100);
    }
  };

  const getUserDisplayName = (user: UserWithStats) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getUserInitials = (user: UserWithStats) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t("loginRequired")}
        </h2>
        <p className="text-gray-600">{t("loginRequired")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <Spinner />
        <p className="mt-4 text-gray-600">{t("loadError")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={user.avatar || ""}
                  alt={getUserDisplayName(user)}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getUserDisplayName(user)}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {/* <Badge className={getVipBadgeColor(user.stats.vipStatus)}>
                    <Crown className="h-3 w-3 mr-1" />
                    {user.stats.vipStatus} VIP
                  </Badge> */}
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/settings">
                  <Edit className="h-4 w-4 mr-2" />
                  {t("editProfile")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/profile/security">
                  <Shield className="h-4 w-4 mr-2" />
                  {t("security")}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {tStats("totalOrders")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.stats.totalOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {tStats("totalFavorites")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.stats.totalFavorites}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {tStats("totalSpent")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(
                    user.stats.totalSpent,
                    { code: "AED" }, // Default to AED, could be made dynamic if needed
                    locale
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>{tStats("recentOrders")}</span>
            </span>
            <Link href="/profile/orders">
              <Button variant="ghost" size="sm">
                {tStats("viewAllOrders")}
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{tStats("noOrders")}</p>
              <Link href="/products">
                <Button className="mt-4">{tStats("startShopping")}</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const statusInfo = getStatusBadge(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          #{order.code || `ORD-${order.id}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      <Link href={`/orders/${order.code}`}>
                        <Button variant="ghost" size="sm">
                          {tStats("viewAllOrders")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Favorites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>{tStats("recentFavorites")}</span>
            </span>
            <Link href="/profile/favorites">
              <Button variant="ghost" size="sm">
                {tStats("viewAllFavorites")}
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentFavorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{tStats("noFavorites")}</p>
              <Link href="/products">
                <Button className="mt-4">{tStats("startShopping")}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentFavorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {favorite.product?.name_en ||
                          tSeo("product.defaultTitle")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {favorite.product?.price
                          ? formatPrice(
                              favorite.product.price,
                              {
                                code: favorite.product.currency?.code || "AED",
                              },
                              locale
                            )
                          : "Price not available"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
