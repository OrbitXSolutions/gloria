"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Package,
  Heart,
  Settings,
  CreditCard,
  MapPin,
  Bell,
  Shield,
  LogOut,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { getUserAvatarUrl } from "@/lib/constants/supabase-storage";
import { useTranslations } from "next-intl";

export function ProfileSidebar() {
  const pathname = usePathname();
  const { user } = useSupabaseUser();
  const t = useTranslations("profile.sidebar");

  const navigation = [
    {
      name: t("overview"),
      href: "/profile",
      icon: User,
      description: t("overviewDescription"),
    },
    {
      name: t("orders"),
      href: "/profile/orders",
      icon: Package,
      description: t("ordersDescription"),
    },
    {
      name: t("favorites"),
      href: "/profile/favorites",
      icon: Heart,
      description: t("favoritesDescription"),
    },
    {
      name: t("addresses"),
      href: "/profile/addresses",
      icon: MapPin,
      description: t("addressesDescription"),
    },
    {
      name: t("paymentMethods"),
      href: "/profile/payment",
      icon: CreditCard,
      description: t("paymentMethodsDescription"),
    },
    {
      name: t("notifications"),
      href: "/profile/notifications",
      icon: Bell,
      description: t("notificationsDescription"),
    },
    {
      name: t("security"),
      href: "/profile/security",
      icon: Shield,
      description: t("securityDescription"),
    },
    {
      name: t("settings"),
      href: "/profile/settings",
      icon: Settings,
      description: t("settingsDescription"),
    },
  ];

  const firstLetters = `${user?.user_metadata.first_name?.[0] ?? ""}${user?.user_metadata.last_name?.[0] ?? ""
    }`.toUpperCase();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage
            src={getUserAvatarUrl(user?.user_metadata.avatar, "s")}
          />
          <AvatarFallback className="text-lg font-medium bg-gradient-to-br from-gray-100 to-gray-200">
            {firstLetters}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900">
            {user?.user_metadata?.first_name ?? ""}{" "}
            {user?.user_metadata?.last_name ?? ""}
          </h3>
          <p className="text-sm text-gray-500">
            {user?.email ?? user?.user_metadata.email ?? ""}
          </p>
          <Badge variant="secondary" className="mt-2">
            <Crown className="h-3 w-3 mr-1" />
            {t("vipMember")}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div
                  className={cn(
                    "text-xs mt-0.5",
                    isActive ? "text-gray-300" : "text-gray-500"
                  )}
                >
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t("signOut")}
        </Button>
      </div>
    </div>
  );
}
