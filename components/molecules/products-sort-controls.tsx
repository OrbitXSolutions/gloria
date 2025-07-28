"use client";

import {
    Clock,
    TrendingUp,
    TrendingDown,
    ArrowUpAZ,
    Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import SortButton from "../atoms/sort-button";

import { SortOption } from "@/lib/types/products-page";

interface Props {
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    disabled?: boolean;
}

export default function ProductsSortControls({
    sortBy,
    onSortChange,
    disabled = false,
}: Props) {
    const t = useTranslations("products");

    const sortOptions = [
        {
            key: "newest" as const,
            icon: Clock,
            label: t("sort.newest") || "Newest",
        },
        {
            key: "price-low" as const,
            icon: TrendingUp,
            label: t("sort.priceLow") || "Price ↑",
        },
        {
            key: "price-high" as const,
            icon: TrendingDown,
            label: t("sort.priceHigh") || "Price ↓",
        },
        {
            key: "name-az" as const,
            icon: ArrowUpAZ,
            label: t("sort.nameAZ") || "A-Z",
        },
        {
            key: "rating-high" as const,
            icon: Star,
            label: t("sort.ratingHigh") || "Rating ↓",
        },
        {
            key: "rating-low" as const,
            icon: Star,
            label: t("sort.ratingLow") || "Rating ↑",
        },
    ];

    return (
        <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sort By</h3>
            <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                    <SortButton
                        key={option.key}
                        icon={option.icon}
                        label={option.label}
                        isActive={sortBy === option.key}
                        onClick={() => onSortChange(option.key)}
                        disabled={disabled}
                    />
                ))}
            </div>
        </div>
    );
} 