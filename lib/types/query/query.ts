// export type Query = {
//     queryString?: string;
//     page?: number;
//     limit?: number;
// };


// export type QueryProducts = Query & {
//     // original slug or slug_ar
//     category_slug?: string;
// };


// export type QueryCategories = Query & {
// }

export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
}