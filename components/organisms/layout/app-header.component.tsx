"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { useServerTranslation } from "@/hooks/useServerTranslation";
// import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname } from "next/navigation";
import LoadingIndicator from "@/components/atoms/LoadingIndicator";
import { useTranslations } from "next-intl";
import { useCart } from "@/components/_core/providers/cart-provider";
import LanguageSwitcher from "@/components/atoms/langauge-switcher";
// import AuthButton from "./AuthButton";



export default function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {cart} = useCart();

  const t = useTranslations("header");
  
//   const { t, isRTL } = {
// 	t: (key: string) => key, // Placeholder for translation function
// 	isRTL: false, // Placeholder for RTL check
//   };
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return (
        pathname === "/" ||
        (!pathname.includes("/products") &&
          !pathname.includes("/gifts") &&
          !pathname.includes("/about"))
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="max-md:hidden bg-secondary py-2">
        <div className="container flex mx-auto text-white px-3 justify-between items-center text-sm">
          <div>{t("topBar.freeShipping")}</div>
          <div className="flex gap-4">
            <Link href="/track-order" className="hover:">
              {t("topBar.trackOrder")}
            </Link>
            <Link href="/help" className="hover:">
              {t("topBar.help")}
            </Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-primary text-white shadow-sm ">
        <div className="container mx-auto px-4">
          {/* Top bar */}

          {/* Main header */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold ">
              {t("brand")}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-8">
              <Link
                href="/"
                className={`font-medium transition-colors flex items-center gap-2 ${
                  isActiveLink("/")
                    ? "text-secondary-300 border-b-2 border-secondary pb-1"
                    : "hover:text-secondary-300"
                }`}
              >
                {t("nav.home")}
                <LoadingIndicator loaderClassName="text-secondary" />
              </Link>
              <Link
                href="/products"
                className={`font-medium transition-colors flex items-center gap-2 ${
                  isActiveLink("/products")
                    ? "text-secondary-300 border-b-2 border-secondary pb-1"
                    : "hover:text-secondary-300"
                }`}
              >
                {t("nav.products")}
                <LoadingIndicator loaderClassName="text-secondary" />
              </Link>
              <Link
                href="/gifts"
                className={`font-medium transition-colors flex items-center gap-2 ${
                  isActiveLink("/gifts")
                    ? "text-secondary-300 border-b-2 border-secondary pb-1"
                    : "hover:text-secondary-300"
                }`}
              >
                {t("nav.gifts")}
                <LoadingIndicator loaderClassName="text-secondary" />
              </Link>
              <Link
                href="/about"
                className={`font-medium transition-colors flex items-center gap-2 ${
                  isActiveLink("/about")
                    ? "text-secondary-300 border-b-2 border-secondary pb-1"
                    : "hover:text-secondary-300"
                }`}
              >
                {t("nav.about")}
                <LoadingIndicator loaderClassName="text-secondary" />
              </Link>
            </nav>

            {/* Search and Actions */}
            <div className={`flex items-center space-x-4`}>
              {/* Search */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Search className={`h-4 w-4 text-gray-500 mx-2`} />
                <input
                  type="text"
                  placeholder={t("search")}
                  className="bg-transparent outline-none text-sm w-48"
                />
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Action buttons */}
              {/* <AuthButton /> */}
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Heart className="h-5 w-5" />
              </Button>
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cart.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.items.length}
                  </span>
                )}
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t py-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 mb-4">
                  <Search className={`h-4 w-4 text-gray-500 mx-2`} />
                  <input
                    type="text"
                    placeholder={t("search")}
                    className="bg-transparent outline-none text-sm flex-1"
                  />
                </div>
                <Link
                  href="/"
                  className={`font-medium transition-colors flex items-center gap-2 ${
                    isActiveLink("/")
                      ? "text-secondary bg-purple-50 px-3 py-2 rounded-lg"
                      : "hover:text-secondary/40"
                  }`}
                >
                  {t("nav.home")}
                  <LoadingIndicator loaderClassName="text-secondary" />
                </Link>
                <Link
                  href="/products"
                  className={`font-medium transition-colors flex items-center gap-2 ${
                    isActiveLink("/products")
                      ? "text-secondary bg-purple-50 px-3 py-2 rounded-lg"
                      : "hover:text-secondary/40"
                  }`}
                >
                  {t("nav.products")}
                  <LoadingIndicator loaderClassName="text-secondary" />
                </Link>
                <Link
                  href="/gifts"
                  className={`font-medium transition-colors flex items-center gap-2 ${
                    isActiveLink("/gifts")
                      ? "text-secondary bg-purple-50 px-3 py-2 rounded-lg"
                      : "hover:text-secondary/40"
                  }`}
                >
                  {t("nav.gifts")}
                  <LoadingIndicator loaderClassName="text-secondary" />
                </Link>
                <Link
                  href="/about"
                  className={`font-medium transition-colors flex items-center gap-2 ${
                    isActiveLink("/about")
                      ? "text-secondary bg-purple-50 px-3 py-2 rounded-lg"
                      : "hover:text-secondary/40"
                  }`}
                >
                  {t("nav.about")}
                  <LoadingIndicator loaderClassName="text-secondary" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
