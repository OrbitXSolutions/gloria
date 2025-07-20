"use client";

import { Button } from "@/components/ui/button";
import CategoryIcon from "./category-icon";
import { Category } from "@/lib/types/products-page";

interface Props {
    category: Category;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
    locale: string;
}

export default function CategoryFilterButton({
    category,
    isActive,
    onClick,
    disabled = false,
    locale,
}: Props) {
    const getCategoryName = (category: Category) => {
        return locale === "ar"
            ? category.name_ar || category.name_en
            : category.name_en;
    };

    return (
        <Button
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            disabled={disabled}
        >
            <div className="w-8 h-8 bg-gradient-to-br from-secondary-100 to-pink-100 rounded-full flex items-center justify-center">
                <CategoryIcon
                    className="w-6 h-6 text-secondary-200 rounded-full"
                    name={category.slug || ""}
                />
            </div>
            <span className="text-xs">{getCategoryName(category)}</span>
        </Button>
    );
} 