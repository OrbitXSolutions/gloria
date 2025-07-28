"use client";

import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { ProductsPageProps } from "@/lib/types/products-page";
import { useProductsPage } from "@/hooks/use-products-page";
import ProductsFiltersPanel from "@/components/organisms/products-filters-panel";
import ProductsDisplay from "@/components/organisms/products-display";
import CollectionSection from "@/components/molecules/collection-section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Props extends ProductsPageProps {}

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
    state,
    updateFilters,
    setViewMode,
    toggleFilters,
    clearFilters,
    clearError,
    hasActiveFilters,
  } = useProductsPage({
    initialProducts,
    initialQuery,
    initialCategorySlug,
    initialSort,
    initialOrder,
    currentPage,
    hasMore,
  });

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    // Smooth scroll to top of products section
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Collection Section */}
      <Suspense fallback={<div className="h-64 bg-gray-200 animate-pulse" />}>
        <CollectionSection />
      </Suspense>

      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{state.error}</span>
              <button
                onClick={clearError}
                className="text-sm underline hover:no-underline"
              >
                {t("dismiss")}
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters Panel */}
        <ProductsFiltersPanel
          filters={state.filters}
          categories={categories}
          viewMode={state.viewMode}
          showFilters={state.showFilters}
          isLoading={state.isLoading}
          onFiltersChange={updateFilters}
          onViewModeChange={setViewMode}
          onToggleFilters={toggleFilters}
          onClearFilters={clearFilters}
        />

        {/* Products Display */}
        <ProductsDisplay
          products={state.products}
          viewMode={state.viewMode}
          currentPage={state.filters.page}
          totalPages={state.totalPages}
          totalProducts={state.totalProducts}
          hasMore={
            state.totalProducts > state.filters.page * state.filters.limit
          }
          isLoading={state.isLoading}
          error={state.error}
          onPageChange={handlePageChange}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
}
