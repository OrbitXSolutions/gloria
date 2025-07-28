"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    onClearFilters: () => void;
}

export default function ProductsEmptyState({ onClearFilters }: Props) {
    const t = useTranslations("products");

    return (
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
                    onClick={onClearFilters}
                    className="bg-secondary-600 hover:bg-secondary-700"
                >
                    {t("clearFilters") || "Clear Filters"}
                </Button>
            </div>
        </div>
    );
} 