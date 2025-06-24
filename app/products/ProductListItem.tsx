"use client";

import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star } from "lucide-react";

import { toast } from "sonner";
import { ProductWithUserData } from "@/lib/types/database.types";
import { formatPrice } from "@/lib/common/cart";
import { useLocale, useTranslations } from "next-intl";
import { useSupabase } from "@/components/_core/providers/SupabaseProvider";
import { useCart } from "@/components/_core/providers/cart-provider";
import { useFavorites } from "@/components/_core/providers/favorites-provider";
import SafeImage from "@/components/_common/safe-image";
import {
  getProductImageUrl,
  getFirstImageUrl,
} from "@/lib/constants/supabase-storage";
import Image from "next/image";

interface ProductListItemProps {
  product: ProductWithUserData;
}

export default function ProductListItem({ product }: ProductListItemProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const { user } = useSupabase();
  const { cart, addItem, updateQuantity, removeItem } = useCart();
  const { addFavorite, removeFavorite } = useFavorites();

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

  // Use client-side data if it exists (for real-time updates), otherwise use server-side
  const isInCart = clientIsInCart || serverIsInCart;
  const cartQuantity = clientCartQuantity || serverCartQuantity;
  const isFavorited = serverIsFavorite;

  const handleAddToCart = () => {
    if (!isInStock) return;

    addItem(product, 1);
    toast.success(t("products.addedToCart"), {
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
      removeFavorite(product.id);
      toast.success(t("favorites.removed"), {
        description: getProductName(),
      });
    } else {
      addFavorite(product.id);
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

  // Get primary image using the helper functions
  const primaryImage = product.primary_image
    ? getProductImageUrl(product.primary_image)
    : getFirstImageUrl(product.images);

  // Calculate rating from total_rates and rates_count
  const averageRating =
    product.total_rates && product.rates_count
      ? product.total_rates / product.rates_count
      : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className={`flex  gap-6 p-6`}>
        {/* Product Image */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <Image
            src={primaryImage || "/placeholder.svg"}
            alt={getProductName() || "Product"}
            fill
            className="object-cover rounded-lg"
            sizes="128px"
          />
          {!isInStock && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
              {t("products.outOfStock")}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {getProductName()}
              </h3>
              {getProductDescription() && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {getProductDescription()}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant={isFavorited ? "default" : "ghost"}
              className="ml-2 p-2"
              onClick={handleToggleFavorite}
            >
              <Heart
                className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
              />
            </Button>
          </div>

          {/* Rating */}
          {averageRating > 0 && (
            <div className={`flex items-center mb-3`}>
              <div className="flex items-center">
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
              <span className={`text-sm text-gray-500 ms-2`}>
                ({product.rates_count || 0})
              </span>
            </div>
          )}

          {/* Price and Stock */}
          <div className={`flex items-center justify-between mb-4 `}>
            <div className={`flex items-center space-x-2`}>
              <span className="text-xl font-bold text-gray-900">
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

          {/* Add to Cart / Quantity Controls */}
          <div className="flex items-center gap-3">
            {isInStock ? (
              isInCart ? (
                <div className="flex items-center bg-secondary-50 rounded-lg p-2 gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-secondary-200 hover:bg-secondary-100"
                    onClick={handleDecreaseQuantity}
                  >
                    <span className="text-secondary-600 font-bold">-</span>
                  </Button>
                  <span className="text-sm font-semibold text-secondary-700 min-w-[2rem] text-center">
                    {cartQuantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-secondary-200 hover:bg-secondary-100"
                    onClick={handleIncreaseQuantity}
                  >
                    <span className="text-secondary-600 font-bold">+</span>
                  </Button>
                </div>
              ) : (
                <Button
                  className="bg-secondary-600 hover:bg-secondary-700"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className={`h-4 w-4 me-2`} />
                  {t("products.addToCart")}
                </Button>
              )
            ) : (
              <Button disabled>{t("products.outOfStock")}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
