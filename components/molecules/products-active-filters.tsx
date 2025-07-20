"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import ActiveFilterBadge from "../atoms/active-filter-badge";
import { Category } from "@/lib/types/products-page";

interface Props {
    searchQuery: string;
    selectedCategory?: string;
    categories: Category[];
    onRemoveSearch: () => void;
    onRemoveCategory: () => void;
    onClearAll: () => void;
    locale: string;
}

export default function ProductsActiveFilters({
    searchQuery,
    selectedCategory,
    categories,
    onRemoveSearch,
    onRemoveCategory,
    onClearAll,
    locale,
}: Props) {
    const t = useTranslations("products");

    const getCategoryName = (categorySlug: string) => {
        const category = categories.find(
            (cat) => cat.slug === categorySlug || cat.slug_ar === categorySlug
        );
        if (!category) return null;
        return locale === "ar"
            ? category.name_ar || category.name_en
            : category.name_en;
    };

    if (!searchQuery && !selectedCategory) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
                {t("activeFilters") || "Active filters"}:
            </span>
            {searchQuery && (
                <ActiveFilterBadge
                    label={searchQuery}
                    onRemove={onRemoveSearch}
                />
            )}
            {selectedCategory && (
                <ActiveFilterBadge
                    label={getCategoryName(selectedCategory) || selectedCategory}
                    onRemove={onRemoveCategory}
                />
            )}
            <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-secondary-600"
            >
                {t("clearAll") || "Clear All"}
            </Button>
        </div>
    );
} 