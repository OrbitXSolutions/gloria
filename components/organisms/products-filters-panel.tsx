"use client";

import Form from "next/form";
import { useLocale } from "next-intl";
import ProductsSearchBar from "../molecules/products-search-bar";
import ProductsCategoryFilters from "../molecules/products-category-filters";
import ProductsSortControls from "../molecules/products-sort-controls";
import ViewModeToggle from "../atoms/view-mode-toggle";
import ProductsActiveFilters from "../molecules/products-active-filters";
import { Category, ViewMode, SortOption } from "@/lib/types/products-page";

interface Props {
    searchQuery: string;
    selectedCategory?: string;
    categories: Category[];
    viewMode: ViewMode;
    sortBy: SortOption;
    showFilters: boolean;
    isExecuting: boolean;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onToggleFilters: () => void;
    onCategoryChange: (categorySlug: string) => void;
    onClearAll: () => void;
    onClearCategory: () => void;
    onSortChange: (sort: SortOption) => void;
    onViewModeChange: (mode: ViewMode) => void;
    onRemoveSearch: () => void;
    onRemoveCategory: () => void;
}

export default function ProductsFiltersPanel({
    searchQuery,
    selectedCategory,
    categories,
    viewMode,
    sortBy,
    showFilters,
    isExecuting,
    onSearchChange,
    onSearch,
    onToggleFilters,
    onCategoryChange,
    onClearAll,
    onClearCategory,
    onSortChange,
    onViewModeChange,
    onRemoveSearch,
    onRemoveCategory,
}: Props) {
    const locale = useLocale();

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <Form action="/products" className="space-y-4">
                <ProductsSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    onSearch={onSearch}
                    onToggleFilters={onToggleFilters}
                    showFilters={showFilters}
                    isExecuting={isExecuting}
                />

                <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
                    <div className="space-y-4">
                        <ProductsCategoryFilters
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={onCategoryChange}
                            onClearAll={onClearCategory}
                            disabled={isExecuting}
                            locale={locale}
                        />

                        <div className="flex flex-col lg:flex-row gap-4 justify-between">
                            <ProductsSortControls
                                sortBy={sortBy}
                                onSortChange={onSortChange}
                                disabled={isExecuting}
                            />

                            <ViewModeToggle
                                viewMode={viewMode}
                                onViewModeChange={onViewModeChange}
                                disabled={isExecuting}
                            />
                        </div>
                    </div>
                </div>

                <input type="hidden" name="page" value="1" />
                <input type="hidden" name="lang" value={locale} />
            </Form>

            <ProductsActiveFilters
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                categories={categories}
                onRemoveSearch={onRemoveSearch}
                onRemoveCategory={onRemoveCategory}
                onClearAll={onClearAll}
                locale={locale}
            />
        </div>
    );
} 