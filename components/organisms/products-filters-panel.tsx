'use client'

import { useLocale } from 'next-intl'
import ProductsSearchBar from '../molecules/products-search-bar'
import ProductsCategoryFilters from '../molecules/products-category-filters'
import ProductsSortControls from '../molecules/products-sort-controls'
import ViewModeToggle from '../atoms/view-mode-toggle'
import ProductsActiveFilters from '../molecules/products-active-filters'
import { ProductsFiltersPanelProps } from '@/lib/types/products-page'

export default function ProductsFiltersPanel({
    filters,
    categories,
    viewMode,
    showFilters,
    isLoading,
    onFiltersChange,
    onViewModeChange,
    onToggleFilters,
    onClearFilters,
}: ProductsFiltersPanelProps) {
    const locale = useLocale()

    const handleSearchChange = (value: string) => {
        onFiltersChange({ query: value, page: 1 })
    }

    const handleSearch = () => {
        // Search is triggered automatically on filter change
    }

    const handleCategoryChange = (categorySlug: string) => {
        const newCategorySlug = categorySlug === 'all' ? undefined : categorySlug
        onFiltersChange({ categorySlug: newCategorySlug, page: 1 })
    }

    const handleSortChange = (sort: any) => {
        onFiltersChange({ sortBy: sort, page: 1 })
    }

    const handleRemoveSearch = () => {
        onFiltersChange({ query: '', page: 1 })
    }

    const handleRemoveCategory = () => {
        onFiltersChange({ categorySlug: undefined, page: 1 })
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="space-y-4">
                <ProductsSearchBar
                    searchQuery={filters.query}
                    onSearchChange={handleSearchChange}
                    onSearch={handleSearch}
                    onToggleFilters={onToggleFilters}
                    showFilters={showFilters}
                    isExecuting={isLoading}
                />

                <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
                    <div className="space-y-4">
                        <ProductsCategoryFilters
                            categories={categories}
                            selectedCategory={filters.categorySlug}
                            onCategoryChange={handleCategoryChange}
                            onClearAll={handleRemoveCategory}
                            disabled={isLoading}
                            locale={locale}
                        />

                        <div className="flex flex-col lg:flex-row gap-4 justify-between">
                            <ProductsSortControls
                                sortBy={filters.sortBy}
                                onSortChange={handleSortChange}
                                disabled={isLoading}
                            />

                            <ViewModeToggle
                                viewMode={viewMode}
                                onViewModeChange={onViewModeChange}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ProductsActiveFilters
                searchQuery={filters.query}
                selectedCategory={filters.categorySlug}
                categories={categories}
                onRemoveSearch={handleRemoveSearch}
                onRemoveCategory={handleRemoveCategory}
                onClearAll={onClearFilters}
                locale={locale}
            />
        </div>
    )
} 