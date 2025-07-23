"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
    onToggleFilters: () => void;
    showFilters: boolean;
    isExecuting: boolean;
}

export default function ProductsSearchBar({
    searchQuery,
    onSearchChange,
    onSearch,
    onToggleFilters,
    showFilters,
    isExecuting,
}: Props) {
    const t = useTranslations("products");

    return (
        <div className="flex gap-4">
            <div className="flex-1 relative">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                    type="text"
                    name="q"
                    placeholder={t("search") || "Search perfumes..."}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="ps-10 h-12"
                    disabled={isExecuting}
                />
            </div>
            <Button
                type="button"
                size="lg"
                className="bg-secondary-600 hover:bg-secondary-700"
                onClick={onSearch}
                disabled={isExecuting}
            >
                {isExecuting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Search className="h-5 w-5" />
                )}
            </Button>
            <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onToggleFilters}
                className="lg:hidden"
                disabled={isExecuting}
            >
                <Filter className="h-5 w-5" />
            </Button>
        </div>
    );
} 