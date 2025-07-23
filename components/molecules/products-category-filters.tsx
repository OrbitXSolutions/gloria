"use client";

import { Button } from "@/components/ui/button";
import { Grid } from "lucide-react";
import { useTranslations } from "next-intl";
import CategoryFilterButton from "../atoms/category-filter-button";
import { Category } from "@/lib/types/products-page";

interface Props {
    categories: Category[];
    selectedCategory?: string;
    onCategoryChange: (categorySlug: string) => void;
    onClearAll: () => void;
    disabled?: boolean;
    locale: string;
}

export default function ProductsCategoryFilters({
    categories,
    selectedCategory,
    onCategoryChange,
    onClearAll,
    disabled = false,
    locale,
}: Props) {
    const t = useTranslations("products");

    return (
        <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
                {t("categories.title") || "Categories"}
            </h3>
            <div className="flex flex-wrap gap-3">
                <Button
                    type="button"
                    variant={!selectedCategory ? "default" : "outline"}
                    size="sm"
                    onClick={onClearAll}
                    className="flex flex-col items-center gap-1 h-auto py-2 px-3"
                    disabled={disabled}
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Grid className="h-4 w-4 text-secondary-600" />
                    </div>
                    <span className="text-xs">{t("categories.all") || "All"}</span>
                </Button>
                {categories.map((category) => (
                    <CategoryFilterButton
                        key={category.id}
                        category={category}
                        isActive={selectedCategory === category.slug}
                        onClick={() => {
                            const slug = category.slug;
                            if (!slug) return;
                            onCategoryChange(slug);
                        }}
                        disabled={disabled}
                        locale={locale}
                    />
                ))}
            </div>
        </div>
    );
} 