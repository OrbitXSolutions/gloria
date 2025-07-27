"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, ShoppingCart, Trash2 } from "lucide-react";
import {
  getUserFavorites,
  removeFromFavorites,
  addToCart,
} from "@/lib/common/profile-queries";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "next-intl";

export function FavoritesClient() {
  const { user: authUser } = useSupabaseUser();
  const t = useTranslations("toast");
  const favoritesT = useTranslations("profile.favorites");
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function loadFavorites() {
      if (!authUser?.id) return;

      try {
        const favoritesData = await getUserFavorites(
          Number.parseInt(authUser.id)
        );
        setFavorites(favoritesData);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [authUser]);

  const handleRemoveFromFavorites = async (productId: number) => {
    if (!authUser?.id) return;

    const result = await removeFromFavorites(
      productId,
      Number.parseInt(authUser.id)
    );
    if (result.success) {
      setFavorites((prev) =>
        prev.filter((fav) => fav.product_id !== productId)
      );
      toast.success(t("favorites.removed"));
    } else {
      toast.error(t("favorites.removeFailed"));
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!authUser?.id) return;

    const result = await addToCart(productId, Number.parseInt(authUser.id));
    if (result.success) {
      toast.success(t("favorites.addedToCart"));
    } else {
      toast.error(t("favorites.addToCartFailed"));
    }
  };

  const filteredFavorites = favorites.filter((favorite) => {
    const product = favorite.product;
    if (!product) return false;

    const matchesSearch =
      product.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());

    // For category filter, you'd need to join with categories table
    const matchesCategory = categoryFilter === "all"; // Simplified for now

    return matchesSearch && matchesCategory;
  });

  // Sort favorites
  filteredFavorites.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "price-low":
        return (a.product?.price || 0) - (b.product?.price || 0);
      case "price-high":
        return (b.product?.price || 0) - (a.product?.price || 0);
      case "name":
        return (a.product?.name_en || "").localeCompare(
          b.product?.name_en || ""
        );
      default:
        return 0;
    }
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{favoritesT("title")}</h1>
          <p className="text-gray-600 mt-1">{favorites.length} {favoritesT("subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={favoritesT("searchFavorites")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {favoritesT("noFavorites")}
            </h3>
            <p className="text-gray-600">
              {favoritesT("noFavoritesDescription")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavorites.map((favorite) => {
            const product = favorite.product;
            if (!product) return null;

            return (
              <Card
                key={favorite.id}
                className="group hover:shadow-lg transition-shadow duration-200"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={
                        product.primary_image ||
                        "/placeholder.svg?height=200&width=200"
                      }
                      alt={product.name_en || t("seo.product.defaultTitle")}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={() => handleRemoveFromFavorites(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                        <Badge
                          variant="secondary"
                          className="bg-white text-gray-900"
                        >
                          {t("products.outOfStock")}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {product.name_en}
                      </h3>
                      {product.name_ar && (
                        <p className="text-sm text-gray-600">
                          {product.name_ar}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price?.toFixed(2)}
                        </span>
                        {product.old_price &&
                          product.old_price > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.old_price.toFixed(2)}
                            </span>
                          )}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={product.quantity === 0}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.quantity === 0 ? t("products.outOfStock") : favoritesT("addToCart")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
