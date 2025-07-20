"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import ProductCard from "../molecules/product-card";
import ProductListItem from "../../app/products/ProductListItem";
import ProductsResultsHeader from "../molecules/products-results-header";
import ProductsEmptyState from "../molecules/products-empty-state";
import { ProductWithUserData } from "@/lib/types/database.types";
import { ViewMode } from "@/lib/types/products-page";

interface Props {
    products: ProductWithUserData[];
    viewMode: ViewMode;
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    searchQuery: string;
    hasMore: boolean;
    isExecuting: boolean;
    onClearFilters: () => void;
}

export default function ProductsDisplay({
    products,
    viewMode,
    currentPage,
    totalPages,
    totalProducts,
    searchQuery,
    hasMore,
    isExecuting,
    onClearFilters,
}: Props) {
    const searchParams = useSearchParams();

    if (isExecuting) {
        return (
            <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-secondary-600" />
                <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
        );
    }

    if (products.length === 0) {
        return <ProductsEmptyState onClearFilters={onClearFilters} />;
    }

    return (
        <>
            <ProductsResultsHeader
                productsCount={products.length}
                totalProducts={totalProducts}
                currentPage={currentPage}
                totalPages={totalPages}
                searchQuery={searchQuery}
                hasMore={hasMore}
            />

            {viewMode === "grid" ? (
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

            {(totalPages > 1 || (products.length >= 8 && hasMore)) && (
                <div className="flex justify-center mt-8">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href={
                                        currentPage <= 1
                                            ? undefined
                                            : `?${new URLSearchParams({
                                                ...Object.fromEntries(searchParams.entries()),
                                                page: (currentPage - 1).toString(),
                                            }).toString()}`
                                    }
                                    className={
                                        currentPage <= 1
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
                                                isActive={pageNum === currentPage}
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
                                        currentPage >=
                                            Math.max(totalPages, Math.ceil(products.length / 8))
                                            ? undefined
                                            : `?${new URLSearchParams({
                                                ...Object.fromEntries(searchParams.entries()),
                                                page: (currentPage + 1).toString(),
                                            }).toString()}`
                                    }
                                    className={
                                        currentPage >=
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
    );
} 