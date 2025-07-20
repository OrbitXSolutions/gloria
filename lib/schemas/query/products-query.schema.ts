import { z } from "zod";
import { QuerySchema } from "./query.schema";
import { PaginatedResponse } from "@/lib/types/query/query";
import { ProductWithUserData } from "@/lib/types/database.types";


export const ProductsQuerySchema = QuerySchema.extend({
    category_slug: z.string().optional(),
    sort: z.enum(["created_at", "name", "price", "total_rates"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
});

export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;


export type Product = ProductWithUserData;
export type PaginatedProducts = PaginatedResponse<Product>;