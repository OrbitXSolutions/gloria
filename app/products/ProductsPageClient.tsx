"use client";
import Form from "next/form";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  Grid,
  List,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpAZ,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProductListItem from "./ProductListItem";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAction } from "next-safe-action/hooks";
import { Database, ProductWithUserData } from "@/lib/types/database.types";
import { useLocale, useTranslations } from "next-intl";
import ProductCard from "@/components/molecules/product-card";
import CategoryIcon from "@/components/atoms/category-icon";
type Category = Database["public"]["Tables"]["categories"]["Row"];

interface ProductsPageClientProps {
  initialProducts: ProductWithUserData[];
  categories: Category[];
  initialQuery: string;
  initialCategorySlug?: string;
  currentPage: number;
  hasMore: boolean;
}

type ViewMode = "grid" | "list";
type SortOption =
  | "newest"
  | "oldest"
  | "price-low"
  | "price-high"
  | "name-az"
  | "name-za"
  | "rating-high"
  | "rating-low";

export default function ProductsPageClient({
  initialProducts,
  categories,
  initialQuery,
  initialCategorySlug,
  currentPage,
  hasMore,
}: ProductsPageClientProps) {
  const locale = useLocale();
  const t = useTranslations("products");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductWithUserData[]>(
    initialProducts ?? []
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialCategorySlug
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Initialize pagination data on mount
  useEffect(() => {
    // Calculate initial pagination based on products length and page size
    const pageSize = 8;
    const initialTotal =
      initialProducts.length >= pageSize
        ? Math.ceil(initialProducts.length * (hasMore ? 2 : 1))
        : initialProducts.length;
    const initialTotalPages = Math.ceil(initialTotal / pageSize);

    setTotalProducts(initialTotal);
    setTotalPages(initialTotalPages);
  }, [initialProducts.length, hasMore]);

  // Sync sortBy state with URL params
  useEffect(() => {
    const sortParam = searchParams.get("sort") as SortOption;
    if (
      sortParam &&
      [
        "newest",
        "oldest",
        "price-low",
        "price-high",
        "name-az",
        "name-za",
        "rating-high",
        "rating-low",
      ].includes(sortParam)
    ) {
      setSortBy(sortParam);
    }
  }, [searchParams]);
  useEffect(() => {
    setProducts(initialProducts ?? []);
  }, [initialProducts]);
  const getCategoryName = (category: Category) => {
    return locale === "ar"
      ? category.name_ar || category.name_en
      : category.name_en;
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return null;
    const category = categories.find(
      (cat) => cat.slug === selectedCategory || cat.slug_ar === selectedCategory
    );
    return category ? getCategoryName(category) : null;
  };

  const updateURL = useCallback(
    (params: Record<string, string | undefined>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          current.set(key, value);
        } else {
          current.delete(key);
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.replace(`${pathname}${query}`);
    },
    [pathname, router, searchParams]
  );

  const searchAction = useAction(
    async (params: any) => {
      const searchParams = new URLSearchParams();
      if (params.query) searchParams.set("q", params.query);
      if (params.categorySlug)
        searchParams.set("category", params.categorySlug);
      searchParams.set("page", params.page.toString());
      searchParams.set("sort", params.sort);

      const response = await fetch(`/api/products?${searchParams.toString()}`);
      const data = await response.json();
      return data;
    },
    {
      onSuccess: (data: any) => {
        if (!data || !data.products) {
          console.error("Invalid data format:", data);
          return;
        }
        setProducts(data.products ?? []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.total || 0);
      },
      onError: (error) => {
        console.error("Error searching products:", error);
      },
    }
  );

  const handleSearch = useCallback(
    async (query: string, categorySlug?: string, newPage = 1) => {
      // Update URL without reloading
      updateURL({
        q: query || undefined,
        category: categorySlug?.toString(),
        page: newPage > 1 ? newPage.toString() : undefined,
        sort: sortBy !== "newest" ? sortBy : undefined,
      });

      // Execute the search action
      searchAction.execute({
        query,
        categorySlug,
        page: newPage,
        sort: sortBy,
      });
    },
    [sortBy, updateURL, searchAction]
  );

  const handleCategoryChange = (categorySlug: string) => {
    const newCategorySlug = categorySlug === "all" ? undefined : categorySlug;
    setSelectedCategory(newCategorySlug);
    handleSearch(searchQuery, newCategorySlug, 1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(undefined);
    setSortBy("newest");
    updateURL({
      q: undefined,
      category: undefined,
      page: undefined,
      sort: undefined,
    });
    handleSearch("", undefined, 1);
  };

  const handlePageChange = (newPage: number) => {
    handleSearch(searchQuery, selectedCategory, newPage);
    // Scroll to top of products section
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const sortProducts = (
    products: ProductWithUserData[],
    sortOption: SortOption
  ) => {
    const sorted = [...products];
    switch (sortOption) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at!).getTime() -
            new Date(a.created_at!).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.created_at!).getTime() -
            new Date(b.created_at!).getTime()
        );
      case "price-low":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-high":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "name-az":
        return sorted.sort((a, b) => {
          const nameA =
            locale === "ar" ? a.name_ar || a.name_en || "" : a.name_en || "";
          const nameB =
            locale === "ar" ? b.name_ar || b.name_en || "" : b.name_en || "";
          return nameA.localeCompare(nameB);
        });
      case "name-za":
        return sorted.sort((a, b) => {
          const nameA =
            locale === "ar" ? a.name_ar || a.name_en || "" : a.name_en || "";
          const nameB =
            locale === "ar" ? b.name_ar || b.name_en || "" : b.name_en || "";
          return nameB.localeCompare(nameA);
        });
      case "rating-high":
        return sorted.sort(
          (a, b) => (b.total_rates || 0) - (a.total_rates || 0)
        );
      case "rating-low":
        return sorted.sort(
          (a, b) => (a.total_rates || 0) - (b.total_rates || 0)
        );
      default:
        return sorted;
    }
  };

  const sortedProducts = sortProducts(products, sortBy);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-secondary-400 via-50% via-secondary to-secondary-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {t("title") || "Our Products"}
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {t("description") ||
                "Discover our complete collection of premium fragrances"}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <Form action="/products" className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search
                  className={`absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5`}
                />
                <Input
                  type="text"
                  name="q"
                  placeholder={t("search") || "Search perfumes..."}
                  defaultValue={searchQuery}
                  className={`ps-10 h-12`}
                  disabled={searchAction.isExecuting}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-secondary-600 hover:bg-secondary-700"
                disabled={searchAction.isExecuting}
              >
                {searchAction.isExecuting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
                disabled={searchAction.isExecuting}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>

            {/* Filters Row */}
            <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    {t("categories.title") || "Categories"}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant={!selectedCategory ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(undefined);
                        setSearchQuery("");
                        setSortBy("newest");
                        updateURL({
                          q: undefined,
                          category: undefined,
                          page: undefined,
                          sort: undefined,
                        });
                        handleSearch("", undefined, 1);
                      }}
                      className="flex flex-col items-center gap-1 h-auto py-2 px-3"
                      disabled={searchAction.isExecuting}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Grid className="h-4 w-4 text-secondary-600" />
                      </div>
                      <span className="text-xs">
                        {t("categories.all") || "All"}
                      </span>
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        type="button"
                        variant={
                          selectedCategory === category.slug
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          const slug = category.slug;
                          if (!slug) return;
                          setSelectedCategory(slug);
                          handleSearch(searchQuery, slug, 1);
                        }}
                        className="flex flex-col items-center gap-1 h-auto py-2 px-3"
                        disabled={searchAction.isExecuting}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-pink-100 rounded-full flex items-center justify-center">
                          <CategoryIcon
                            className="w-6 h-6 text-secondary-200 rounded-full"
                            name={category.slug || ""}
                          />
                        </div>
                        <span className="text-xs">
                          {getCategoryName(category)}
                        </span>
                      </Button>
                    ))}
                  </div>
                  <input
                    type="hidden"
                    name="category"
                    value={selectedCategory?.toString() || ""}
                  />
                </div>

                {/* Sort and View Controls */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                  {/* Sort Filter */}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Sort By
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={sortBy === "newest" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSortBy("newest");
                          handleSearch(searchQuery, selectedCategory, 1);
                        }}
                        className="flex items-center gap-2"
                        disabled={searchAction.isExecuting}
                      >
                        <Clock className="h-4 w-4" />
                        {t("sort.newest") || "Newest"}
                      </Button>
                      <Button
                        type="button"
                        variant={sortBy === "price-low" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSortBy("price-low");
                          handleSearch(searchQuery, selectedCategory, 1);
                        }}
                        className="flex items-center gap-2"
                        disabled={searchAction.isExecuting}
                      >
                        <TrendingUp className="h-4 w-4" />
                        {t("sort.priceLow") || "Price ↑"}
                      </Button>
                      <Button
                        type="button"
                        variant={
                          sortBy === "price-high" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSortBy("price-high");
                          handleSearch(searchQuery, selectedCategory, 1);
                        }}
                        className="flex items-center gap-2"
                        disabled={searchAction.isExecuting}
                      >
                        <TrendingDown className="h-4 w-4" />
                        {t("sort.priceHigh") || "Price ↓"}
                      </Button>
                      <Button
                        type="button"
                        variant={sortBy === "name-az" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSortBy("name-az");
                          handleSearch(searchQuery, selectedCategory, 1);
                        }}
                        className="flex items-center gap-2"
                        disabled={searchAction.isExecuting}
                      >
                        <ArrowUpAZ className="h-4 w-4" />
                        {t("sort.nameAZ") || "A-Z"}
                      </Button>
                      <Button
                        type="button"
                        variant={
                          sortBy === "rating-high" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSortBy("rating-high");
                          handleSearch(searchQuery, selectedCategory, 1);
                        }}
                        className="flex items-center gap-2"
                        disabled={searchAction.isExecuting}
                      >
                        <Star className="h-4 w-4" />
                        {t("sort.ratingHigh") || "Rating ↓"}
                      </Button>
                      <Button
                        type="button"
                        variant={
                          sortBy === "rating-low" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSortBy("rating-low");
                          handleSearch(searchQuery, selectedCategory, 1);
                        }}
                        className="flex items-center gap-2"
                        disabled={searchAction.isExecuting}
                      >
                        <Star className="h-4 w-4" />
                        {t("sort.ratingLow") || "Rating ↑"}
                      </Button>
                    </div>
                    <input type="hidden" name="sort" value={sortBy} />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex flex-col items-start lg:items-end">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      View
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setViewMode("grid")}
                        className="px-4"
                        disabled={searchAction.isExecuting}
                      >
                        <Grid className="h-5 w-5" />
                      </Button>
                      <Button
                        type="button"
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="lg"
                        onClick={() => setViewMode("list")}
                        className="px-4"
                        disabled={searchAction.isExecuting}
                      >
                        <List className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden inputs for maintaining state */}
            <input type="hidden" name="page" value="1" />
            <input type="hidden" name="lang" value={locale} />
          </Form>

          {/* Active Filters */}
          {(searchQuery || selectedCategory) && (
            <div className={`flex items-center gap-2 mt-4 pt-4 border-t`}>
              <span className="text-sm text-gray-600">
                {t("activeFilters") || "Active filters"}:
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSearchQuery("");
                      updateURL({ q: undefined });
                      handleSearch("", selectedCategory, 1);
                    }}
                  />
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getSelectedCategoryName()}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(undefined);
                      updateURL({ category: undefined });
                      handleSearch(searchQuery, undefined, 1);
                    }}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-secondary-600"
                disabled={searchAction.isExecuting}
              >
                {t("clearAll") || "Clear All"}
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {products.length > 0 ? (
              <>
                {t("resultsCount") || "Showing"} {(page - 1) * 8 + 1}-
                {Math.min(page * 8, Math.max(products.length, totalProducts))}{" "}
                {t("of") || "of"}{" "}
                {totalProducts > 0 ? totalProducts : products.length}{" "}
                {t("results") || "results"}
                {searchQuery && ` ${t("for") || "for"} "${searchQuery}"`}
              </>
            ) : (
              `0 ${t("results") || "results"}`
            )}
          </p>
          {(totalPages > 1 || (products.length >= 8 && hasMore)) && (
            <p className="text-sm text-gray-500">
              {t("page") || "Page"} {page} {t("of") || "of"}{" "}
              {totalPages > 0 ? totalPages : Math.ceil(products.length / 8)}
            </p>
          )}
        </div>

        {/* Products Grid/List */}
        {searchAction.isExecuting ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-secondary-600" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : sortedProducts.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {sortedProducts.map((product) => (
                  <ProductListItem key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(totalPages > 1 || (products.length >= 8 && hasMore)) &&
              !searchAction.isExecuting && (
                <div className="flex justify-center mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href={
                            page <= 1
                              ? undefined
                              : `?${new URLSearchParams({
                                  ...Object.fromEntries(searchParams.entries()),
                                  page: (page - 1).toString(),
                                }).toString()}`
                          }
                          className={
                            page <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        {
                          length: Math.max(
                            totalPages,
                            Math.ceil(products.length / 8)
                          ),
                        },
                        (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href={`?${new URLSearchParams({
                                  ...Object.fromEntries(searchParams.entries()),
                                  page: pageNum.toString(),
                                }).toString()}`}
                                isActive={pageNum === page}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href={
                            page >=
                            Math.max(totalPages, Math.ceil(products.length / 8))
                              ? undefined
                              : `?${new URLSearchParams({
                                  ...Object.fromEntries(searchParams.entries()),
                                  page: (page + 1).toString(),
                                }).toString()}`
                          }
                          className={
                            page >=
                            Math.max(totalPages, Math.ceil(products.length / 8))
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("noResults") || "No products found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("noResultsDescription") ||
                  "Try adjusting your search or filters to find what you're looking for."}
              </p>
              <Button
                onClick={() => {
                  window.location.href = "/products";
                }}
                className="bg-secondary-600 hover:bg-secondary-700"
              >
                {t("clearFilters") || "Clear Filters"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
