"use client";

import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSupabase } from "@/components/_core/providers/SupabaseProvider";
import { useCart } from "@/components/_core/providers/cart-provider";
import { useFavorites } from "@/components/_core/providers/favorites-provider";
import { ProductWithUserData } from "@/lib/types/database.types";

export function useProductItem(product: ProductWithUserData) {
    const locale = useLocale();
    const t = useTranslations("toast");
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
        toast.success(t("favorites.addedToCart"), {
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

    // Calculate rating from total_rates and rates_count
    const averageRating =
        product.total_rates && product.rates_count
            ? product.total_rates / product.rates_count
            : 0;

    return {
        // Data
        getProductName,
        getProductDescription,
        isInStock,
        isInCart,
        cartQuantity,
        isFavorited,
        averageRating,

        // Actions
        handleAddToCart,
        handleToggleFavorite,
        handleIncreaseQuantity,
        handleDecreaseQuantity,
    };
} 