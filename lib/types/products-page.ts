import { Database, ProductWithUserData } from "@/lib/types/database.types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type ViewMode = "grid" | "list";
export type SortOption =
    | "newest"
    | "oldest"
    | "price-low"
    | "price-high"
    | "name-az"
    | "name-za"
    | "rating-high"
    | "rating-low";

export interface ProductsPageProps {
    initialProducts: ProductWithUserData[];
    categories: Category[];
    initialQuery: string;
    initialCategorySlug?: string;
    initialSort: "created_at" | "name" | "price" | "total_rates";
    initialOrder: "asc" | "desc";
    currentPage: number;
    hasMore: boolean;
} 