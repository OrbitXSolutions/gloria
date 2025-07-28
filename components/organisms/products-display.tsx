'use client'

import { Loader2 } from 'lucide-react'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import ProductCard from '../molecules/product-card'
import ProductListItem from '../../app/products/ProductListItem'
import ProductsResultsHeader from '../molecules/products-results-header'
import ProductsEmptyState from '../molecules/products-empty-state'
import { ProductsDisplayProps } from '@/lib/types/products-page'

export default function ProductsDisplay({
    products,
    viewMode,
    currentPage,
    totalPages,
    totalProducts,
    hasMore,
    isLoading,
    error,
    onPageChange,
    onClearFilters,
}: ProductsDisplayProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-secondary-600" />
                <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={onClearFilters}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    Clear Filters
                </button>
            </div>
        )
    }

    if (products.length === 0) {
        return <ProductsEmptyState onClearFilters={onClearFilters} />
    }

    const handlePageChange = (page: number) => {
        onPageChange(page)
    }

    return (
        <>
            <ProductsResultsHeader
                productsCount={products.length}
                totalProducts={totalProducts}
                currentPage={currentPage}
                totalPages={totalPages}
                searchQuery=""
                hasMore={hasMore}
            />

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4 mb-8">
                    {products.map((product) => (
                        <ProductListItem key={product.id} product={product} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                    className={
                                        currentPage <= 1
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => {
                                const pageNum = i + 1
                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            onClick={() => handlePageChange(pageNum)}
                                            isActive={pageNum === currentPage}
                                            className="cursor-pointer"
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                    className={
                                        currentPage >= totalPages
                                            ? 'pointer-events-none opacity-50'
                                            : 'cursor-pointer'
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </>
    )
} 