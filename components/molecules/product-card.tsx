"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { ProductWithUserData } from "@/lib/types/database.types";
import { useLocale, useTranslations } from "next-intl";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getProductImageUrl, getFirstImageUrl } from "@/lib/constants/supabase-storage";
import SafeImage from "../_common/safe-image";
import { formatPrice } from "@/lib/common/cart";
import { useCart } from "../_core/providers/cart-provider";
import Link from "next/link";
import Image from "next/image";


interface ProductCardProps {
  product: ProductWithUserData;
  showNewBadge?: boolean;
}

export default function ProductCard({
  product,
  showNewBadge = false,
}: ProductCardProps) {
  const t = useTranslations('');
  const locale = useLocale();
  const { user } = useSupabaseUser();
  const { cart, addItem, updateQuantity, removeItem } = useCart();

//   const { addFavorite, removeFavorite } = useFavorites();
  const searchParams = useSearchParams();

  const getProductName = () => {
    return locale === "ar"
      ? product.name_ar || product.name_en
      : product.name_en;
  };

  const getProductDescription = () => {
    return locale === "ar"
      ? product.description_ar || product.description_en
      : product.description_en;
  };

  const isInStock = product.quantity && product.quantity > 0;

  // Use server-side data if available, fallback to client-side for real-time updates
  const serverIsInCart = product.in_cart || false;
  const serverCartQuantity = product.cart_quantity || 0;
  const serverIsFavorite = product.is_favorite || false;

  // Check client-side cart for real-time updates
  const clientCartItem = cart.items.find(
    (item) => item.product.id === product.id
  );
  const clientIsInCart = !!clientCartItem;
  const clientCartQuantity = clientCartItem?.quantity || 0;
//   const clientIsInCart = false;
//   const clientCartQuantity = 0;

  // Use client-side data if it exists (for real-time updates), otherwise use server-side
  const isInCart = clientIsInCart || serverIsInCart;
  const cartQuantity = clientCartQuantity || serverCartQuantity;
  const isFavorited = serverIsFavorite; // Keep server-side for favorites since it's less frequently updated

  const handleAddToCart = () => {
    if (!isInStock) return;

    addItem(product, 1);
    toast.success(t("addedToCart"), {
      description: getProductName(),
      action: {
        label: t("cart.viewCart"),
        onClick: () => {
          window.location.href = "/cart";
        },
      },
    });
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast.error(t("auth.loginRequired"), {
        description: t("auth.loginToAddFavorites"),
        action: {
          label: t("auth.login"),
          onClick: () => {
            window.location.href = "/auth/login";
          },
        },
      });
      return;
    }

    if (isFavorited) {
    //   removeFavorite(product.id);
      toast.success(t("favorites.removed"), {
        description: getProductName(),
      });
    } else {
    //   addFavorite(product.id);
      toast.success(t("favorites.added"), {
        description: getProductName(),
      });
    }
  };

  const handleIncreaseQuantity = () => {
    if (!isInStock) return;
    addItem(product, 1);
  };

  const handleDecreaseQuantity = () => {
    if (cartQuantity > 1) {
      updateQuantity(product.id, cartQuantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const handleImageError = (error: string, src: string) => {
    console.warn(`Product image failed to load for product ${product.id}:`, {
      error,
      src,
    });
  };

  // Get primary image using the helper functions
  const primaryImage = product.primary_image
    ? getProductImageUrl(product.primary_image)
    : getFirstImageUrl(product.images);

  // Calculate rating from total_rates and rates_count
  const averageRating = product.total_rates || 0;

  const getProductSlug = () => {
    if (locale === "ar" && product.slug_ar) {
      return product.slug_ar;
    }
    return product.slug || product.id.toString();
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  const currentSearchParams = searchParams.toString();
  const productLink = `/products/${getProductSlug()}${
    currentSearchParams ? `?${currentSearchParams}` : ""
  }`;
  // return <></>;
  return (
    <Link href={productLink} className="block">
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer">
        <div className="relative h-[250px] overflow-hidden">
          <Image
            src={primaryImage || "/placeholder.svg"}
            alt=""
            fill
            className="bg-amber-50/20"
            objectFit="contain"
          />
          {/* <SafeImage
            src={primaryImage || "/placeholder.svg"}
            alt={getProductName() || "Product"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            fallbackType="product"
            context={`Product ${product.id} - ${getProductName()}`}
            onImageError={handleImageError}
            priority={showNewBadge} // Prioritize new arrivals
          /> */}

          {showNewBadge && (
            <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium z-10">
              {t("products.new")}
            </div>
          )}

          {!isInStock && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
              {t("products.outOfStock")}
            </div>
          )}

          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Button
              size="sm"
              variant={isFavorited ? "default" : "default"}
              className="rounded-full p-2"
              onClick={(e) => handleButtonClick(e, handleToggleFavorite)}
            >
              <Heart
                className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
              />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h3 className=" text-lg font-semibold text-primary text-center mb-1 line-clamp-2">
              {getProductName()}
            </h3>
            {getProductDescription() && (
              <p className="text-xs text-center text-gray-600 line-clamp-2">
                {getProductDescription()}
              </p>
            )}
          </div>

          {averageRating > 0 && (
            <div className={`flex items-center justify-center mb-3`}>
              <div className="flex items-center ">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-sm text-gray-500 `}>
                ({product.rates_count || 0})
              </span>
            </div>
          )}

          <div className="flex items-center justify-center  mb-3">
            <div
              className={`flex items-center flex-wrap justify-center space-x-2 `}
            >
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price, product.currency, locale)}
              </span>
              {product.old_price &&
                product.old_price > (product.price || 0) && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.old_price, product.currency, locale)}
                  </span>
                )}
            </div>
            {product.quantity && product.quantity <= 5 && (
              <span className="text-sm text-gray-500">
                {product.quantity} {t("products.inStock")}
              </span>
            )}
          </div>

          {isInStock ? (
            isInCart ? (
              <div className="flex items-center justify-between bg-primary-50 rounded-lg p-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-primary-200 hover:bg-primary-100"
                  onClick={(e) => handleButtonClick(e, handleDecreaseQuantity)}
                >
                  <span className="text-secondary font-bold">-</span>
                </Button>
                <span className="text-sm font-semibold text-primary-700 px-3">
                  {cartQuantity}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 border-primary-200 hover:bg-primary-100"
                  onClick={(e) => handleButtonClick(e, handleIncreaseQuantity)}
                >
                  <span className="text-secondary font-bold">+</span>
                </Button>
              </div>
            ) : (
              <Button
                className="w-full bg-primary hover:bg-secondary-700"
                size="sm"
                onClick={(e) => handleButtonClick(e, handleAddToCart)}
              >
                <ShoppingBag className={`h-4 w-4`} />
                {t("products.addToCart")}
              </Button>
            )
          ) : (
            <Button className="w-full" size="sm" disabled>
              {t("products.outOfStock")}
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
