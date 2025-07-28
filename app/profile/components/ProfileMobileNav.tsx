"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  Package,
  Heart,
  MapPin,
  Shield,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslations } from "next-intl";

export function ProfileMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = useTranslations("profile.sidebar");

  const navigation = [
    { name: t("overview"), href: "/profile", icon: User },
    { name: t("orders"), href: "/profile/orders", icon: Package },
    { name: t("favorites"), href: "/profile/favorites", icon: Heart },
    { name: t("addresses"), href: "/profile/addresses", icon: MapPin },
    { name: t("security"), href: "/profile/security", icon: Shield },
  ];

  const currentPage = navigation.find((item) => item.href === pathname);

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        {currentPage?.icon && (
          <currentPage.icon className="h-5 w-5 text-gray-600" />
        )}
        <h1 className="text-lg font-semibold text-gray-900">
          {currentPage?.name || t("overview")}
        </h1>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{t("profileMenu")}</h2>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
