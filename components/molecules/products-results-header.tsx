"use client";

import { useTranslations } from "next-intl";

interface Props {
    productsCount: number;
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    searchQuery: string;
    hasMore: boolean;
}

export default function ProductsResultsHeader({
    productsCount,
    totalProducts,
    currentPage,
    totalPages,
    searchQuery,
    hasMore,
}: Props) {
    const t = useTranslations("products");

    return (
        <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
                {productsCount > 0 ? (
                    <>
                        {t("resultsCount") || "Showing"} {(currentPage - 1) * 8 + 1}-
                        {Math.min(currentPage * 8, Math.max(productsCount, totalProducts))}{" "}
                        {t("of") || "of"}{" "}
                        {totalProducts > 0 ? totalProducts : productsCount}{" "}
                        {t("results") || "results"}
                        {searchQuery && ` ${t("for") || "for"} "${searchQuery}"`}
                    </>
                ) : (
                    `0 ${t("results") || "results"}`
                )}
            </p>
            {(totalPages > 1 || (productsCount >= 8 && hasMore)) && (
                <p className="text-sm text-gray-500">
                    {t("page") || "Page"} {currentPage} {t("of") || "of"}{" "}
                    {totalPages > 0 ? totalPages : Math.ceil(productsCount / 8)}
                </p>
            )}
        </div>
    );
} 