"use client";

import { useTranslations } from "next-intl";
import { ProductWithUserData } from "@/lib/types/database.types";
import { Category, ProductsPageProps } from "@/lib/types/products-page";
import { useProductsPage } from "@/hooks/use-products-page";
import ProductsFiltersPanel from "@/components/organisms/products-filters-panel";
import ProductsDisplay from "@/components/organisms/products-display";
import CollectionSection from "@/components/molecules/collection-section";

interface Props extends ProductsPageProps { }

export default function ProductsPageClient({
  initialProducts,
  categories,
  initialQuery,
  initialCategorySlug,
  initialSort,
  initialOrder,
  currentPage,
  hasMore,
}: Props) {
  const t = useTranslations("products");

  const {
    // State
    products,
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
    onSearchChange,
    onSearch,
    onCategoryChange,
    onClearAll,
    onClearCategory,
    onPageChange,
    onRemoveSearch,
    onRemoveCategory,
    onSortChange,
    onViewModeChange,
    onToggleFilters,
  } = useProductsPage({
    initialProducts,
    categories,
    initialQuery,
    initialCategorySlug,
    initialSort,
    initialOrder,
    currentPage,
    hasMore,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Collection Section */}
      <CollectionSection />

      <div className="container mx-auto px-4 py-8">
        {/* Filters Panel */}
        <ProductsFiltersPanel
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          categories={categories}
          viewMode={viewMode}
          sortBy={sortBy}
          showFilters={showFilters}
          isExecuting={isExecuting}
          onSearchChange={onSearchChange}
          onSearch={onSearch}
          onToggleFilters={onToggleFilters}
          onCategoryChange={onCategoryChange}
          onClearAll={onClearAll}
          onClearCategory={onClearCategory}
          onSortChange={onSortChange}
          onViewModeChange={onViewModeChange}
          onRemoveSearch={onRemoveSearch}
          onRemoveCategory={onRemoveCategory}
        />

        {/* Products Display */}
        <ProductsDisplay
          products={products}
          viewMode={viewMode}
          currentPage={page}
          totalPages={totalPages}
          totalProducts={totalProducts}
          searchQuery={searchQuery}
          hasMore={hasMore}
          isExecuting={isExecuting}
          onClearFilters={onClearAll}
        />
      </div>
    </div>
  );
}
