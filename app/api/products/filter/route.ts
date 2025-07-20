import { NextRequest, NextResponse } from "next/server";
import { filterProducts, ProductFilterParams } from "@/lib/common/queries-product";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const params: ProductFilterParams = {
            page: Number(searchParams.get("page") ?? 1),
            pageSize: Number(searchParams.get("page_size") ?? 99),
            sortBy: searchParams.get("sort_by") ?? "created_at",
            sortOrder: searchParams.get("sort_order") === "asc",
            showDeleted: searchParams.get("show_deleted") === "true",
            queryString: searchParams.get("queryString") || undefined,
            categoryId: searchParams.get("category_id") || undefined,
            categorySlug: searchParams.get("category_slug") || undefined,
            minPrice: searchParams.get("min_price") || undefined,
            maxPrice: searchParams.get("max_price") || undefined,
        };

        const result = await filterProducts(params);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in filter products API:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "An error occurred",
            },
            { status: 500 }
        );
    }
} 