"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  Share2,
  ArrowLeft,
} from "lucide-react";

import { toast } from "sonner";

import Link from "next/link";
import { formatPrice } from "@/lib/common/cart";
import {
  ProductWithUserData,
  ReviewWithUser,
} from "@/lib/types/database.types";
import { useLocale, useTranslations } from "next-intl";
import { useSupabase } from "@/components/_core/providers/SupabaseProvider";
import SafeImage from "@/components/_common/safe-image";
import { useCart } from "@/components/_core/providers/cart-provider";
import { useFavorites } from "@/components/_core/providers/favorites-provider";
import { getProductImageUrl } from "@/lib/constants/supabase-storage";
import Image from "next/image";
import { addReview } from "@/app/_actions/add-review";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
interface ProductDetailsClientProps {
  product: ProductWithUserData;
  reviews: ReviewWithUser[];
}

export default function ProductDetailsClient({
  product,
  reviews,
}: ProductDetailsClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useSupabase();
  const { cart, addItem, updateQuantity, removeItem } = useCart();
  const [showReviewForm, setShowReviewForm] = useState(true);
  const { addFavorite, removeFavorite } = useFavorites();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [variants, setVariants] = useState<ProductWithUserData[]>([]);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductWithUserData>(product);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Fetch variants when component mounts
  useEffect(() => {
    const fetchVariants = async () => {
      if (!product.variant_group) return;

      setLoadingVariants(true);
      try {
        const response = await fetch(
          `/api/products/variants?group=${product.variant_group}`
        );
        const data = await response.json();
        if (data.variants) {
          setVariants(data.variants);
          // Find current product in variants or use the first one
          const currentVariant =
            data.variants.find(
              (v: ProductWithUserData) => v.id === product.id
            ) || product;
          setSelectedVariant(currentVariant);
        }
      } catch (error) {
        console.error("Error fetching variants:", error);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchVariants();
  }, [product.variant_group, product.id, locale, product]);

  const getProductName = () => {
    return locale === "ar"
      ? selectedVariant.name_ar || selectedVariant.name_en
      : selectedVariant.name_en;
  };

  const getProductDescription = () => {
    return locale === "ar"
      ? selectedVariant.description_ar || selectedVariant.description_en
      : selectedVariant.description_en;
  };

  const isInStock = selectedVariant.quantity && selectedVariant.quantity > 0;

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

  // Get all product images
  const allImages: string[] = [];

  // First add other images from the images array
  if (selectedVariant.images && selectedVariant.images.length > 0) {
    selectedVariant.images.forEach((img) => {
      const imageUrl = getProductImageUrl(img);
      allImages.push(imageUrl);
    });
  }

  // Then add primary image at the end if it exists and isn't already included
  if (selectedVariant.primary_image) {
    const primaryImageUrl = getProductImageUrl(selectedVariant.primary_image);
    if (!allImages.includes(primaryImageUrl)) {
      allImages.push(primaryImageUrl);
    }
  }

  // Fallback to placeholder if no images
  if (allImages.length === 0) {
    allImages.push("/placeholder.svg?height=600&width=600&text=Product");
  }

  const handleAddToCart = () => {
    if (!isInStock) return;

    addItem(selectedVariant, quantity);
    toast.success(t("favorites.addedToCart"), {
      description: `${quantity}x ${getProductName()}`,
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getProductName() ?? "",
          text: getProductDescription() ?? "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("toast.share.linkCopied"));
    }
  };

  // Calculate rating from total_rates and rates_count
  const averageRating = product.total_rates || 0;

  // Helper function to get unique attribute values
  const { colors, sizes, others } = useMemo(() => {
    if (!variants.length) return { colors: [], sizes: [], others: [] };

    const uniqueColors: Array<{
      value: any;
      hex?: string;
      product: ProductWithUserData;
    }> = [];
    const uniqueSizes: Array<{ value: string; product: ProductWithUserData }> =
      [];
    const uniqueOthers: Array<{
      key: string;
      value: string;
      product: ProductWithUserData;
    }> = [];

    const colorValues = new Set<string>();
    const sizeValues = new Set<string>();

    variants.forEach((variant) => {
      if (variant.attributes && typeof variant.attributes === "object") {
        const attrs = variant.attributes as Record<string, any>;

        Object.entries(attrs).forEach(([key, value]) => {
          const valueStr = String(
            typeof value === "object" && value?.name ? value.name : value
          );

          if (key.toLowerCase() === "color") {
            if (!colorValues.has(valueStr)) {
              uniqueColors.push({
                value: value, // Store original value for selection
                hex:
                  typeof value === "object" && value?.hex
                    ? value.hex
                    : undefined,
                product: variant,
              });
              colorValues.add(valueStr);
            }
          } else if (
            key.toLowerCase().includes("size") ||
            key.toLowerCase().includes("ml") ||
            key.toLowerCase().includes("oz")
          ) {
            if (!sizeValues.has(valueStr)) {
              uniqueSizes.push({ value: valueStr, product: variant });
              sizeValues.add(valueStr);
            }
          } else {
            // For 'others', uniqueness might be more complex (key-value pair)
            // For simplicity, this example doesn't ensure deep uniqueness for 'others' here
            // but rather lists all non-color/size attributes.
            // If specific unique 'other' attributes are needed, refine this.
            uniqueOthers.push({ key, value: valueStr, product: variant });
          }
        });
      }
    });
    return { colors: uniqueColors, sizes: uniqueSizes, others: uniqueOthers };
  }, [variants]);

  // Handle variant selection
  const handleVariantSelect = (newVariant: ProductWithUserData) => {
    setSelectedVariant(newVariant);
    // Update URL without page reload
    const newSlug =
      locale === "ar" && newVariant.slug_ar
        ? newVariant.slug_ar
        : newVariant.slug;
    if (newSlug) {
      window.history.replaceState(
        {},
        "",
        `/products/${newSlug}${window.location.search}`
      );
    }
  };

  const handleReviewSubmit = async (
    rating: number,
    comment: string,
    fullName?: string,
    id?: number
  ) => {
    // "use server";
    const productId = product.id;
    // const rating = Number(formData.get("rating"));
    // const comment = formData.get("reviewComment") as string;

    // Client-side validation (additional to server-side)
    if (!rating || rating < 1 || rating > 5) {
      return toast.error(t("toast.reviews.invalidRating"));
    }
    if (!comment || comment.trim().length === 0) {
      return toast.error(t("toast.reviews.emptyComment"));
    }

    // Call the server action to add the review
    try {
      await addReview({
        productId,
        rating,
        comment,
        fullName,
        user: {
          id: user?.id,
          firstName: user?.user_metadata?.first_name,
          lastName: user?.user_metadata?.last_name,
          email: user?.email,
        },
      });

      // Optimistically update the UI
      // toast.success(t("reviews.submitted"), {
      //   description: t("reviews.approvalInfo"),
      // });
    } catch (error) {
      toast.error(t("toast.reviews.submitError"));
      console.error("Error submitting review:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex items-center gap-2 text-sm text-gray-600 `}>
            <Link href="/" className="hover:text-gray-900">
              {t("header.nav.home")}
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">
              {t("header.nav.products")}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{getProductName()}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className={`mb-6`}
          onClick={() => window.history.back()}
        >
          <ArrowLeft
            className={`h-4 w-4 ${locale == "ar" ? "ml-2 rotate-180" : "mr-2"}`}
          />
          {t("common.back") || "Back"}
        </Button>

        <div className={`grid lg:grid-cols-2 gap-12`}>
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
              <Image
                src={allImages[selectedImageIndex]}
                alt={getProductName() || "Product"}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className={`flex gap-3`}>
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImageIndex === index
                      ? "border-secondary-600"
                      : "border-gray-200"
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`${getProductName()} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {getProductName()}
              </h1>

              {averageRating > 0 && (
                <div className={`flex items-center gap-2 mb-4`}>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({product.rates_count || 0}{" "}
                    {t("reviews.reviews") || "reviews"})
                  </span>
                </div>
              )}

              {selectedVariant.sku && (
                <p className="text-sm text-gray-500 mb-4">
                  SKU: {selectedVariant.sku}
                </p>
              )}
            </div>

            {/* Price */}
            <div className={`flex items-center gap-4`}>
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(
                  selectedVariant.price,
                  selectedVariant.currency,
                  locale
                )}
              </span>
              {selectedVariant.old_price &&
                selectedVariant.old_price > (selectedVariant.price || 0) && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(
                        selectedVariant.old_price,
                        selectedVariant.currency,
                        locale
                      )}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      {Math.round(
                        ((selectedVariant.old_price -
                          (selectedVariant.price || 0)) /
                          selectedVariant.old_price) *
                        100
                      )}
                      % OFF
                    </Badge>
                  </>
                )}
            </div>

            {/* Stock Status */}
            <div>
              {isInStock ? (
                <div className={`flex items-center gap-2`}>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    {/* {t("products.inStock")} ({selectedVariant.quantity}{" "} */}
                    {t("products.available") || "available"})
                  </span>
                </div>
              ) : (
                <div className={`flex items-center gap-2`}>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">
                    {t("products.outOfStock")}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            {isInStock && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("products.quantity") || "Quantity"}
                  </label>
                  <div className={`flex items-center gap-3`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setQuantity(
                          Math.min(selectedVariant.quantity || 1, quantity + 1)
                        )
                      }
                      disabled={quantity >= (selectedVariant.quantity || 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className={`flex gap-4`}>
                  <Button
                    size="lg"
                    className="flex-1 bg-secondary-600 hover:bg-secondary-700"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className={`h-5 w-5 me-2`} />
                    {t("products.addToCart")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleFavorite}
                    className={isFavorited ? "text-red-600 border-red-600" : ""}
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`}
                    />
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Variant Selection */}
            {variants.length > 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Available Options
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {variants.map((variant, index) => {
                    const isSelected = selectedVariant.id === variant.id;
                    const variantName =
                      locale === "ar"
                        ? variant.name_ar || variant.name_en
                        : variant.name_en;

                    // Extract key attributes for display
                    const displayAttributes: any[] = [];
                    if (
                      variant.attributes &&
                      typeof variant.attributes === "object"
                    ) {
                      const attrs = variant.attributes as Record<string, any>;
                      Object.entries(attrs).forEach(([key, value]) => {
                        if (key.toLowerCase() === "color") {
                          if (typeof value === "object" && value?.name) {
                            displayAttributes.push({
                              key: "Color",
                              value: value.name,
                              hex: value.hex,
                            });
                          } else {
                            displayAttributes.push({
                              key: "Color",
                              value: String(value),
                            });
                          }
                        } else if (
                          key.toLowerCase().includes("size") ||
                          key.toLowerCase().includes("ml") ||
                          key.toLowerCase().includes("oz")
                        ) {
                          displayAttributes.push({
                            key: "Size",
                            value: String(value),
                          });
                        } else {
                          displayAttributes.push({
                            key: key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase()),
                            value: String(value),
                          });
                        }
                      });
                    }

                    return (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${isSelected
                          ? "border-secondary-600 bg-secondary-50 ring-2 ring-secondary-200"
                          : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                          }`}
                      >
                        <div className="space-y-2">
                          {displayAttributes.map((attr, attrIndex) => (
                            <div
                              key={attrIndex}
                              className="flex items-center justify-between"
                            >
                              <span className="text-xs font-medium text-gray-600">
                                {attr.key}
                              </span>
                              <div className="flex items-center gap-1">
                                {attr.key === "Color" && attr.hex && (
                                  <div
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: attr.hex }}
                                  />
                                )}
                                <span
                                  className={`text-xs font-semibold ${isSelected
                                    ? "text-secondary-700"
                                    : "text-gray-900"
                                    }`}
                                >
                                  {attr.value}
                                </span>
                              </div>
                            </div>
                          ))}
                          {variant.price && (
                            <div className="pt-1 border-t border-gray-100">
                              <span
                                className={`text-sm font-bold ${isSelected
                                  ? "text-secondary-700"
                                  : "text-gray-900"
                                  }`}
                              >
                                {formatPrice(
                                  variant.price,
                                  variant.currency,
                                  locale
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Attributes */}
            {selectedVariant.attributes &&
              Object.keys(selectedVariant.attributes).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t("products.details") || "Product Details"}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid gap-3">
                      {Object.entries(
                        selectedVariant.attributes as Record<string, any>
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className={`flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0`}
                        >
                          <span className="font-medium text-gray-700 capitalize">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </span>
                          <span className="text-gray-900 flex items-center gap-2">
                            {key.toLowerCase() === "color" ? (
                              typeof value === "object" && value?.hex ? (
                                <>
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: value.hex }}
                                  />
                                  {value.name || value.hex}
                                </>
                              ) : typeof value === "string" &&
                                value.startsWith("#") ? (
                                <>
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: value }}
                                  />
                                  {value}
                                </>
                              ) : (
                                String(
                                  typeof value === "object" && value?.name
                                    ? value.name
                                    : value
                                )
                              )
                            ) : (
                              String(value)
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className="mt-4 space-y-8">
          {/* Description */}
          {getProductDescription() && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("products.description") || "Description"}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {getProductDescription() || ""}
                </ReactMarkdown>
              </p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {t("reviews.title")} ({reviews.length})
          </h2>

          {/* Rating Summary Section */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <div className={`grid md:grid-cols-2 gap-8 `}>
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="mb-6">
                    <div className="text-6xl font-bold text-secondary-600 mb-2">
                      {(
                        reviews.reduce(
                          (sum, review) => sum + (review.rating || 0),
                          0
                        ) / reviews.length
                      ).toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-7 w-7 ${i <
                            Math.floor(
                              reviews.reduce(
                                (sum, review) => sum + (review.rating || 0),
                                0
                              ) / reviews.length
                            )
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-1">
                      {(
                        reviews.reduce(
                          (sum, review) => sum + (review.rating || 0),
                          0
                        ) / reviews.length
                      ).toFixed(1)}{" "}
                      out of 5 stars
                    </p>
                    <p className="text-sm text-gray-500">
                      Based on {reviews.length} customer{" "}
                      {reviews.length === 1 ? "review" : "reviews"}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(
                          (reviews.filter((r) => (r.rating || 0) >= 4).length /
                            reviews.length) *
                          100
                        )}
                        %
                      </div>
                      <div className="text-xs text-gray-500">Recommend</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary-600">
                        {Math.round(
                          (reviews.filter((r) => (r.rating || 0) === 5).length /
                            reviews.length) *
                          100
                        )}
                        %
                      </div>
                      <div className="text-xs text-gray-500">5 Stars</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {reviews.length}
                      </div>
                      <div className="text-xs text-gray-500">Total Reviews</div>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.filter(
                      (review) => Math.floor(review.rating || 0) === rating
                    ).length;
                    const percentage =
                      reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                    return (
                      <div key={rating} className={`flex items-center gap-3`}>
                        <div className="flex items-center gap-1 min-w-[60px]">
                          <span className="text-sm font-medium text-gray-700">
                            {rating}
                          </span>
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 min-w-[40px] text-right">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Add Review Form */}
          {showReviewForm && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Write a Review
              </h3>

              <form className="space-y-4">
                {!user && (
                  <div>
                    <label
                      htmlFor="reviewerName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="reviewerName"
                      name="reviewerName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary-500 focus:border-secondary-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        className="p-1 hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.preventDefault();
                          // Handle rating selection
                          const stars =
                            e.currentTarget.parentElement?.querySelectorAll(
                              "button"
                            );
                          stars?.forEach((star, index) => {
                            const starIcon = star.querySelector("svg");
                            if (starIcon) {
                              if (index < rating) {
                                starIcon.classList.add(
                                  "text-yellow-400",
                                  "fill-current"
                                );
                                starIcon.classList.remove("text-gray-300");
                              } else {
                                starIcon.classList.remove(
                                  "text-yellow-400",
                                  "fill-current"
                                );
                                starIcon.classList.add("text-gray-300");
                              }
                            }
                          });
                          // Set hidden input value
                          const hiddenInput =
                            e.currentTarget.parentElement?.parentElement?.querySelector(
                              'input[name="rating"]'
                            ) as HTMLInputElement;
                          if (hiddenInput) {
                            hiddenInput.value = rating.toString();
                          }
                        }}
                      >
                        <Star className="h-6 w-6 text-gray-300 hover:text-yellow-400 transition-colors" />
                      </button>
                    ))}
                    <input type="hidden" name="rating" required />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reviewComment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Comment *
                  </label>
                  <textarea
                    id="reviewComment"
                    name="reviewComment"
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary-500 focus:border-secondary-500"
                    placeholder="Share your experience with this product..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    type="submit"
                    className="bg-secondary-600 hover:bg-secondary-700"
                    onClick={async (e) => {
                      e.preventDefault();
                      // Handle form submission
                      const reviewerName = user
                        ? `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""
                          }`.trim() || user.email
                        : (
                          e.currentTarget.form
                            ?.reviewerName as HTMLInputElement
                        )?.value;

                      const comment = (
                        e.currentTarget.form
                          ?.reviewComment as HTMLTextAreaElement
                      ).value;
                      const ratingInput = (
                        e.currentTarget.form?.rating as HTMLInputElement
                      ).value;
                      await handleReviewSubmit(
                        +ratingInput,
                        comment,
                        reviewerName,
                        user?.user_metadata?.id
                      );
                      setShowReviewForm(false);
                      toast.success(t("toast.reviews.submitted"), {
                        description:
                          "Your review will be published after admin approval.",
                      });
                    }}
                  >
                    Submit Review
                  </Button>
                  <p className="text-sm text-gray-500">
                    * Your review will be published after admin approval
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Existing Reviews */}
          {reviews.length > 0 ? (
            <div className="grid gap-6">
              {reviews
                .filter((review) => review.is_approved)
                .map((review) => {
                  // Determine reviewer name and avatar based on user_id
                  const reviewerName =
                    review.user_id && review.user
                      ? `${review.user.first_name || ""} ${review.user.last_name || ""
                        }`.trim() || review.user.email
                      : review.name || "Anonymous";

                  const reviewerAvatar =
                    review.user_id && review.user?.avatar
                      ? review.user.avatar
                      : review.avatar ||
                      "/placeholder.svg?height=50&width=50&text=User";

                  return (
                    <div
                      key={review.id}
                      className="bg-white rounded-lg p-6 shadow-sm"
                    >
                      <div className={`flex items-start gap-4`}>
                        <Image
                          src={reviewerAvatar}
                          alt={reviewerName}
                          width={50}
                          height={50}
                          className="rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div
                            className={`flex items-center justify-between mb-2`}
                          >
                            <h4 className="font-semibold text-gray-900">
                              {reviewerName}
                            </h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < (review.rating || 0)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 leading-relaxed">
                            {review.comment}
                          </p>
                          {review.created_at && (
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(review.created_at).toLocaleDateString(
                                locale === "ar" ? "ar-SA" : "en-US"
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No approved reviews yet. Be the first to review this product!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
