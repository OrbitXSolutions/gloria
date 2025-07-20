"use server";
import { actionClient } from "@/lib/common/safe-action";
import { Database, ProductWithUserData } from "@/lib/types/database.types";
import { PaginatedResponse } from "@/lib/types/query/query";
import { PaginatedProducts, ProductsQuerySchema } from "@/lib/schemas/query/products-query.schema";
import { createSsrClient } from "@/lib/supabase/server";
import { returnValidationErrors } from "next-safe-action";
import { filterProducts } from "@/lib/common/queries-product";

export const queryProductsAction = actionClient.inputSchema(ProductsQuerySchema).action(async ({ parsedInput: query }) => {
    const { queryString, category_slug, page, limit, sort, order } = query;

    try {
        const result = await filterProducts({
            page: page ?? 1,
            pageSize: limit ?? 10,
            sortBy: sort ?? "created_at",
            sortOrder: order === "asc",
            showDeleted: false,
            queryString: queryString || undefined,
            categorySlug: category_slug || undefined,
        });

        return {
            data: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
        } as PaginatedProducts;
    } catch (error) {
        returnValidationErrors(ProductsQuerySchema, {
            _errors: [error instanceof Error ? error.message : "An error occurred"],
        });
    }
});