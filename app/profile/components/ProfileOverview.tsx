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
import {
  getUserProfile,
  getUserOrders,
  getUserFavorites,
} from "@/lib/common/profile-queries";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";

interface UserWithStats {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  phone: string | null;
  created_at: string;
  stats: {
    totalOrders: number;
    totalFavorites: number;
    totalSpent: number;
    vipStatus: string;
  };
}

export function ProfileOverview() {
  const { user: authUser, loading: authLoading } = useSupabaseUser();
  const t = useTranslations("profile.overview");
  const [user, setUser] = useState<UserWithStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentFavorites, setRecentFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;

      if (!authUser?.id) {
        setError(t("loginRequired"));
        setLoading(false);
        return;
      }

      try {
        setError(null);

        // Get user profile with stats
        const userProfile = await getUserProfile(Number.parseInt(authUser.id));
        if (!userProfile) {
          setError(t("loadError"));
          setLoading(false);
          return;
        }

        setUser(userProfile as UserWithStats);

        // Load additional data in parallel
        const [orders, favorites] = await Promise.allSettled([
          getUserOrders(Number.parseInt(authUser.id), undefined, 3),
          getUserFavorites(Number.parseInt(authUser.id)),
        ]);

        // Handle orders result
        if (orders.status === "fulfilled") {
          setRecentOrders(orders.value);
        } else {
          console.error("Error loading orders:", orders.reason);
        }

        // Handle favorites result
        if (favorites.status === "fulfilled") {
          setRecentFavorites(favorites.value.slice(0, 3));
        } else {
          console.error("Error loading favorites:", favorites.reason);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        setError(t("loadDataError"));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authUser, authLoading]);

  const getVipBadgeColor = (status: string) => {
    switch (status) {
      case "Gold":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300";
      case "Silver":
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: {
        label: "Processing",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      },
      shipped: {
        label: "Shipped",
        color: "bg-blue-50 text-blue-700 border-blue-200",
      },
      delivered: {
        label: "Delivered",
        color: "bg-green-50 text-green-700 border-green-200",
      },
      cancelled: {
        label: "Cancelled",
        color: "bg-red-50 text-red-700 border-red-200",
      },
      pending: {
        label: "Pending",
        color: "bg-gray-50 text-gray-700 border-gray-200",
      },
      confirmed: {
        label: "Confirmed",
        color: "bg-blue-50 text-blue-700 border-blue-200",
      },
      completed: {
        label: "Completed",
        color: "bg-green-50 text-green-700 border-green-200",
      },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  const getVipProgress = (status: string, spent: number) => {
    switch (status) {
      case "Gold":
        return {
          progress: 100,
          nextLevel: null,
          needed: 0,
          message: t("highestTier"),
        };
      case "Silver":
        return {
          progress: Math.min((spent / 1000) * 100, 99),
          nextLevel: "Gold",
          needed: Math.max(1000 - spent, 0),
          message: t("spendMore", {
            amount: (1000 - spent).toFixed(2),
            level: "Gold"
          }),
        };
      default:
        return {
          progress: Math.min((spent / 500) * 100, 99),
          nextLevel: "Silver",
          needed: Math.max(500 - spent, 0),
          message: t("spendMore", {
            amount: (500 - spent).toFixed(2),
            level: "Silver"
          }),
        };
    }
  };

  const getUserDisplayName = (user: UserWithStats) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return t("valuedCustomer");
  };

  const getUserInitials = (user: UserWithStats) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    if (user.first_name) {
      return user.first_name[0];
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="p-6">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("loadDataError")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const vipProgress = getVipProgress(
    user.stats.vipStatus,
    user.stats.totalSpent
  );
  const displayName = getUserDisplayName(user);
  const userInitials = getUserInitials(user);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-600 mt-1">
            {t("welcome", { name: user.first_name || t("valuedCustomer") })}
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Link href="/profile/settings">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              {t("editProfile")}
            </Button>
          </Link>
          <Link href="/profile/security">
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              {t("security")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {user.stats.totalOrders === 0 && (
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            {t("welcomeMessage")}
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user.avatar || "/placeholder.svg?height=96&width=96"}
              />
              <AvatarFallback className="text-xl font-medium bg-gradient-to-br from-gray-100 to-gray-200">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {displayName}
                </h2>
                <Badge
                  variant="secondary"
                  className={getVipBadgeColor(user.stats.vipStatus)}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  {user.stats.vipStatus} {t("vipMember")}
                </Badge>
              </div>
              <p className="text-gray-600">{user.email}</p>
              {user.phone && <p className="text-gray-600">{user.phone}</p>}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {t("memberSince")}{" "}
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  {t("vipMember")}
                </span>
              </div>

              {/* VIP Progress */}
              {vipProgress.nextLevel && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Progress to {vipProgress.nextLevel}
                    </span>
                    <span className="text-gray-600">
                      ${vipProgress.needed.toFixed(2)} to go
                    </span>
                  </div>
                  <Progress
                    value={Math.min(vipProgress.progress, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">{vipProgress.message}</p>
                </div>
              )}
              {user.stats.vipStatus === "Gold" && (
                <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-lg">
                  🎉 Congratulations! You've reached our highest VIP tier with
                  exclusive benefits.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {user.stats.totalOrders}
                </p>
                <p className="text-sm text-gray-600">{t("stats.totalOrders")}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {user.stats.totalFavorites}
                </p>
                <p className="text-sm text-gray-600">{t("stats.totalFavorites")}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  ${user.stats.totalSpent.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">{t("stats.totalSpent")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {user.stats.vipStatus}
                </p>
                <p className="text-sm text-gray-600">{t("vipMember")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              {t("stats.recentOrders")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.length > 0 ? (
              <>
                {recentOrders.map((order) => {
                  const statusInfo = getStatusBadge(order.status);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          #{order.code || `ORD-${order.id}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.order_items?.[0]?.product?.name_en ||
                            t("stats.orderItems")}
                          {order.order_items?.length > 1 &&
                            ` ${t("stats.moreItems", { count: order.order_items.length - 1 })}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  );
                })}
                <Link href="/profile/orders">
                  <Button variant="outline" className="w-full">
                    {t("stats.viewAllOrders")}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">{t("stats.noOrders")}</p>
                <p className="text-sm text-gray-400 mb-4">
                  {t("stats.startShopping")}
                </p>
                <Link href="/products">
                  <Button className="w-full">{t("stats.startShopping")}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              {t("stats.recentFavorites")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentFavorites.length > 0 ? (
              <>
                {recentFavorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={
                        favorite.product?.primary_image ||
                        "/placeholder.svg?height=48&width=48"
                      }
                      alt={favorite.product?.name_en || "Product"}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {favorite.product?.name_en}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${favorite.product?.price?.toFixed(2)}
                        {favorite.product?.currency &&
                          ` ${favorite.product.currency.symbol_en}`}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/profile/favorites">
                  <Button variant="outline" className="w-full">
                    {t("stats.viewAllFavorites")}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">{t("stats.noFavorites")}</p>
                <p className="text-sm text-gray-400 mb-4">
                  {t("stats.addFavorites")}
                </p>
                <Link href="/products">
                  <Button variant="outline" className="w-full">
                    {t("stats.startShopping")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              {t("security")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Email Verified</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  Secure
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Password</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-200"
                >
                  Strong
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Notifications</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-800 border-gray-200"
                >
                  On
                </Badge>
              </div>
            </div>

            <Link href="/profile/security">
              <Button variant="outline" className="w-full">
                {t("security")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* VIP Benefits */}
      {user.stats.vipStatus !== "Bronze" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              {t("vipBenefits.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">
                  {t("vipBenefits.prioritySupport.title")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("vipBenefits.prioritySupport.description")}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">{t("vipBenefits.freeShipping.title")}</h3>
                <p className="text-sm text-gray-600">
                  {t("vipBenefits.freeShipping.description")}
                </p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">
                  {t("vipBenefits.exclusiveAccess.title")}
                </h3>
                <p className="text-sm text-gray-600">
                  {t("vipBenefits.exclusiveAccess.description")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
