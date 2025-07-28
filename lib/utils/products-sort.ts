import { ProductWithUserData } from "@/lib/types/database.types";
import { SortOption } from "@/lib/types/products-page";

export const sortProducts = (
    products: ProductWithUserData[],
    sortOption: SortOption,
    locale: string
) => {
    const sorted = [...products];

    switch (sortOption) {
        case "newest":
            return sorted.sort(
                (a, b) =>
                    new Date(b.created_at!).getTime() -
                    new Date(a.created_at!).getTime()
            );
        case "oldest":
            return sorted.sort(
                (a, b) =>
                    new Date(a.created_at!).getTime() -
                    new Date(b.created_at!).getTime()
            );
        case "price-low":
            return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        case "price-high":
            return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        case "name-az":
            return sorted.sort((a, b) => {
                const nameA =
                    locale === "ar" ? a.name_ar || a.name_en || "" : a.name_en || "";
                const nameB =
                    locale === "ar" ? b.name_ar || b.name_en || "" : b.name_en || "";
                return nameA.localeCompare(nameB);
            });
        case "name-za":
            return sorted.sort((a, b) => {
                const nameA =
                    locale === "ar" ? a.name_ar || a.name_en || "" : a.name_en || "";
                const nameB =
                    locale === "ar" ? b.name_ar || b.name_en || "" : b.name_en || "";
                return nameB.localeCompare(nameA);
            });
        case "rating-high":
            return sorted.sort(
                (a, b) => (b.total_rates || 0) - (a.total_rates || 0)
            );
        case "rating-low":
            return sorted.sort(
                (a, b) => (a.total_rates || 0) - (b.total_rates || 0)
            );
        default:
            return sorted;
    }
};

export const mapSortOptionToDatabaseSort = (sortOption: SortOption): {
    sort: "created_at" | "name" | "price" | "total_rates";
    order: "asc" | "desc";
} => {
    switch (sortOption) {
        case "newest":
            return { sort: "created_at", order: "desc" };
        case "oldest":
            return { sort: "created_at", order: "asc" };
        case "price-low":
            return { sort: "price", order: "asc" };
        case "price-high":
            return { sort: "price", order: "desc" };
        case "name-az":
            return { sort: "name", order: "asc" };
        case "name-za":
            return { sort: "name", order: "desc" };
        case "rating-high":
            return { sort: "total_rates", order: "desc" };
        case "rating-low":
            return { sort: "total_rates", order: "asc" };
        default:
            return { sort: "created_at", order: "desc" };
    }
}; 