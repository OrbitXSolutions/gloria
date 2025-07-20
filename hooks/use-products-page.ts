"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useLocale } from "next-intl";
import { queryProductsAction } from "@/app/_actions/query-products";
import { ProductWithUserData } from "@/lib/types/database.types";
import { Category, ViewMode, SortOption } from "@/lib/types/products-page";
import { sortProducts, mapSortOptionToDatabaseSort } from "@/lib/utils/products-sort";

interface UseProductsPageProps {
    initialProducts: ProductWithUserData[];
    categories: Category[];
    initialQuery: string;
    initialCategorySlug?: string;
    initialSort: "created_at" | "name" | "price" | "total_rates";
    initialOrder: "asc" | "desc";
    currentPage: number;
    hasMore: boolean;
}

export function useProductsPage({
    initialProducts,
    categories,
    initialQuery,
    initialCategorySlug,
    initialSort,
    initialOrder,
    currentPage,
    hasMore,
}: UseProductsPageProps) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Map initial sort to UI sort option
    const getInitialSortOption = (): SortOption => {
        if (initialSort === "created_at") {
            return initialOrder === "desc" ? "newest" : "oldest";
        }
        if (initialSort === "price") {
            return initialOrder === "asc" ? "price-low" : "price-high";
        }
        if (initialSort === "name") {
            return initialOrder === "asc" ? "name-az" : "name-za";
        }
        if (initialSort === "total_rates") {
            return initialOrder === "desc" ? "rating-high" : "rating-low";
        }
        return "newest";
    };

    const searchAction = useAction(queryProductsAction, {
        onSuccess: ({ data }) => {
            if (!data) return;
            setProducts(data?.data ?? []);
            setPage(data?.page ?? 1);
            setTotalPages(data.total);
            setTotalProducts(data.total);
        },
        onError: ({ error }) => {
            console.error("Error fetching products:", error);
            // Reset to initial state on error
            setProducts(initialProducts ?? []);
            setPage(currentPage);
            setTotalPages(1);
            setTotalProducts(initialProducts.length);
        },
    });

    const { execute, isExecuting, reset } = searchAction;

    const [products, setProducts] = useState<ProductWithUserData[]>(
        initialProducts ?? []
    );
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
        initialCategorySlug
    );
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [sortBy, setSortBy] = useState<SortOption>(getInitialSortOption());
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(currentPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    // Initialize pagination data on mount
    useEffect(() => {
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

    const handleSearch = useCallback(
        async (query: string, categorySlug?: string, newPage = 1) => {
            const { sort, order } = mapSortOptionToDatabaseSort(sortBy);

            // Update URL without reloading
            updateURL({
                q: query || undefined,
                category: categorySlug?.toString(),
                page: newPage > 1 ? newPage.toString() : undefined,
                sort: sortBy !== "newest" ? sortBy : undefined,
            });

            // Execute the search action
            execute({
                queryString: query,
                category_slug: categorySlug,
                page: newPage,
                sort,
                order,
                limit: 8,
            });
        },
        [sortBy, updateURL, execute]
    );

    const handleCategoryChange = (categorySlug: string) => {
        const newCategorySlug = categorySlug === "all" ? undefined : categorySlug;
        setSelectedCategory(newCategorySlug);
        reset(); // Reset action state
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
        reset(); // Reset action state
        handleSearch("", undefined, 1);
    };

    const handleClearCategory = () => {
        setSelectedCategory(undefined);
        updateURL({
            category: undefined,
            page: undefined,
        });
        reset(); // Reset action state
        handleSearch(searchQuery, undefined, 1);
    };

    const handlePageChange = (newPage: number) => {
        reset(); // Reset action state
        handleSearch(searchQuery, selectedCategory, newPage);
        // Scroll to top of products section
        window.scrollTo({ top: 400, behavior: "smooth" });
    };

    const handleRemoveSearch = () => {
        setSearchQuery("");
        updateURL({ q: undefined });
        reset(); // Reset action state
        handleSearch("", selectedCategory, 1);
    };

    const handleRemoveCategory = () => {
        setSelectedCategory(undefined);
        updateURL({ category: undefined });
        reset(); // Reset action state
        handleSearch(searchQuery, undefined, 1);
    };

    const handleSortChange = (newSort: SortOption) => {
        setSortBy(newSort);
        reset(); // Reset action state
        handleSearch(searchQuery, selectedCategory, 1);
    };

    const handleViewModeChange = (newViewMode: ViewMode) => {
        setViewMode(newViewMode);
    };

    const handleToggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const sortedProducts = sortProducts(products, sortBy, locale);

    return {
        // State
        products: sortedProducts,
        searchQuery,
        selectedCategory,
        viewMode,
        sortBy,
        showFilters,
        page,
        totalPages,
        totalProducts,
        isExecuting,

        // Actions
        onSearchChange: setSearchQuery,
        onSearch: () => {
            reset(); // Reset action state
            handleSearch(searchQuery, selectedCategory, 1);
        },
        onCategoryChange: handleCategoryChange,
        onClearAll: handleClearFilters,
        onClearCategory: handleClearCategory,
        onPageChange: handlePageChange,
        onRemoveSearch: handleRemoveSearch,
        onRemoveCategory: handleRemoveCategory,
        onSortChange: handleSortChange,
        onViewModeChange: handleViewModeChange,
        onToggleFilters: handleToggleFilters,
    };
} 