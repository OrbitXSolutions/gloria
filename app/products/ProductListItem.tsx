"use client";

import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { ProductWithUserData } from "@/lib/types/database.types";
import { getProductImageUrl, getFirstImageUrl } from "@/lib/constants/supabase-storage";
import { useProductItem } from "@/hooks/use-product-item";
import ProductRating from "@/components/atoms/product-rating";
import ProductPrice from "@/components/atoms/product-price";
import ProductStockBadge from "@/components/atoms/product-stock-badge";
import QuantityControls from "@/components/atoms/quantity-controls";

interface Props {
  product: ProductWithUserData;
}

export default function ProductListItem({ product }: Props) {
  const t = useTranslations("products");

  const {
    getProductName,
    getProductDescription,
    isInStock,
    isInCart,
    cartQuantity,
    isFavorited,
    averageRating,
    handleAddToCart,
    handleToggleFavorite,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
  } = useProductItem(product);

  // Get primary image using the helper functions
  const primaryImage = product.primary_image
    ? getProductImageUrl(product.primary_image)
    : getFirstImageUrl(product.images);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="flex gap-6 p-6">
        {/* Product Image */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <Image
            src={primaryImage || "/placeholder.svg"}
            alt={getProductName() || "Product"}
            fill
            className="object-cover rounded-lg"
            sizes="128px"
          />
          <ProductStockBadge
            quantity={product.quantity}
            isOutOfStock={!isInStock}
          />
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
          <ProductRating
            averageRating={averageRating}
            ratesCount={product.rates_count || 0}
          />

          {/* Price and Stock */}
          <div className="flex items-center justify-between mb-4">
            <ProductPrice
              price={product.price}
              oldPrice={product.old_price}
              currency={product.currency}
            />
            <ProductStockBadge
              quantity={product.quantity}
              isOutOfStock={!isInStock}
            />
          </div>

          {/* Add to Cart / Quantity Controls */}
          <div className="flex items-center gap-3">
            {isInStock ? (
              isInCart ? (
                <QuantityControls
                  quantity={cartQuantity}
                  onIncrease={handleIncreaseQuantity}
                  onDecrease={handleDecreaseQuantity}
                />
              ) : (
                <Button
                  className="bg-secondary-600 hover:bg-secondary-700"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-4 w-4 me-2" />
                  {t("addToCart")}
                </Button>
              )
            ) : (
              <Button disabled>{t("outOfStock")}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
