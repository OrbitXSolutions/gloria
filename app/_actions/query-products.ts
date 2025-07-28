'use server'

import { actionClient } from '@/lib/common/safe-action'
import { ProductsQuerySchema } from '@/lib/schemas/query/products-query.schema'
import { filterProducts } from '@/lib/queries/queries-product'
import { returnValidationErrors } from 'next-safe-action'
import { revalidateTag } from 'next/cache'

export const queryProductsAction = actionClient
    .inputSchema(ProductsQuerySchema)
    .action(async ({ parsedInput: query }) => {
        const { queryString, category_slug, page, limit, sort, order } = query

        try {
            // Add cache tag for potential revalidation
            const cacheTag = `products-${category_slug || 'all'}-${queryString || 'all'}`

            const result = await filterProducts({
                page: page ?? 1,
                pageSize: limit ?? 12,
                sortBy: sort ?? 'created_at',
                sortOrder: order === 'asc',
                showDeleted: false,
                queryString: queryString || undefined,
                categorySlug: category_slug || undefined,
            })

            // Revalidate the cache tag to ensure fresh data
            // revalidateTag(cacheTag)

            return {
                data: result.data,
                total: result.total,
                page: result.page,
                limit: result.limit,
            }
        } catch (error) {
            console.error('Error in queryProductsAction:', error)

            // Return validation errors for known issues
            if (error instanceof Error) {
                returnValidationErrors(ProductsQuerySchema, {
                    _errors: [error.message],
                })
            }

            // Return a generic error for unknown issues
            returnValidationErrors(ProductsQuerySchema, {
                _errors: ['An unexpected error occurred while fetching products'],
            })
        }
    })