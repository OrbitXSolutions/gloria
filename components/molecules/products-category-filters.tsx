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
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
                {t("categories.title") || "Categories"}
            </h3>
            <div className="flex flex-wrap gap-4">
                <Button
                    type="button"
                    variant={!selectedCategory ? "default" : "outline"}
                    size="sm"
                    onClick={onClearAll}
                    className={`group flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl transition-all duration-300 border-2 min-w-[80px] ${!selectedCategory
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-600 shadow-lg shadow-purple-200/50 scale-105"
                            : "bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 border-purple-200 hover:border-purple-300 hover:shadow-md hover:scale-102"
                        }`}
                    disabled={disabled}
                >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${!selectedCategory
                            ? "bg-white/20 backdrop-blur-sm"
                            : "bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 group-hover:from-purple-200 group-hover:via-pink-100 group-hover:to-purple-200"
                        }`}>
                        <Grid className={`h-5 w-5 transition-all duration-300 ${!selectedCategory ? "text-white" : "text-purple-600 group-hover:text-purple-700"
                            }`} />
                    </div>
                    <span className={`text-xs font-medium transition-all duration-300 leading-tight text-center ${!selectedCategory ? "text-white" : "text-gray-700 group-hover:text-purple-700"
                        }`}>
                        {t("categories.all") || "All"}
                    </span>
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