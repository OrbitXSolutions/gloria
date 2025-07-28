'use client'

import { useReducer, useCallback, useMemo, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useLocale } from 'next-intl'
import { queryProductsAction } from '@/app/_actions/query-products'
import {
    ProductsPageState,
    ProductsPageAction,
    ProductFilters,
    SortOption,
    SortField,
    SortOrder,
    UseProductsPageReturn
} from '@/lib/types/products-page'
import { ProductWithUserData } from '@/lib/types/database.types'

// Reducer for state management
function productsPageReducer(state: ProductsPageState, action: ProductsPageAction): ProductsPageState {
    switch (action.type) {
        case 'SET_PRODUCTS':
            return { ...state, products: action.payload }

        case 'SET_FILTERS':
            return {
                ...state,
                filters: { ...state.filters, ...action.payload },
                // Reset page when filters change
                ...(action.payload.page === undefined && { filters: { ...state.filters, ...action.payload, page: 1 } })
            }

        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload }

        case 'SET_SHOW_FILTERS':
            return { ...state, showFilters: action.payload }

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }

        case 'SET_ERROR':
            return { ...state, error: action.payload }

        case 'SET_PAGINATION':
            return {
                ...state,
                totalProducts: action.payload.total,
                totalPages: action.payload.totalPages
            }

        case 'RESET_FILTERS':
            return {
                ...state,
                filters: {
                    query: '',
                    categorySlug: undefined,
                    sortBy: 'newest',
                    page: 1,
                    limit: 12
                }
            }

        case 'CLEAR_ERROR':
            return { ...state, error: null }

        default:
            return state
    }
}

// Utility function to map sort option to database fields
function mapSortOptionToDatabase(sortOption: SortOption): { field: SortField; order: SortOrder } {
    switch (sortOption) {
        case 'newest':
            return { field: 'created_at', order: 'desc' }
        case 'oldest':
            return { field: 'created_at', order: 'asc' }
        case 'price-low':
            return { field: 'price', order: 'asc' }
        case 'price-high':
            return { field: 'price', order: 'desc' }
        case 'name-az':
            return { field: 'name', order: 'asc' }
        case 'name-za':
            return { field: 'name', order: 'desc' }
        case 'rating-high':
            return { field: 'total_rates', order: 'desc' }
        case 'rating-low':
            return { field: 'total_rates', order: 'asc' }
        default:
            return { field: 'created_at', order: 'desc' }
    }
}

// Utility function to map sortBy enum to query params
function mapSortByToQuery(sortBy: SortOption): { sort: string, order: 'asc' | 'desc' } {
    switch (sortBy) {
        case 'newest':
            return { sort: 'created_at', order: 'desc' }
        case 'oldest':
            return { sort: 'created_at', order: 'asc' }
        case 'price-low':
            return { sort: 'price', order: 'asc' }
        case 'price-high':
            return { sort: 'price', order: 'desc' }
        case 'name-az':
            return { sort: 'name', order: 'asc' }
        case 'name-za':
            return { sort: 'name', order: 'desc' }
        case 'rating-high':
            return { sort: 'total_rates', order: 'desc' }
        case 'rating-low':
            return { sort: 'total_rates', order: 'asc' }
        default:
            return { sort: 'created_at', order: 'desc' }
    }
}

// Parse sort/order from query params to sortBy enum
function parseSortParamsFromQuery(sort: string | null, order: string | null): SortOption {
    if (sort === 'created_at' && order === 'desc') return 'newest'
    if (sort === 'created_at' && order === 'asc') return 'oldest'
    if (sort === 'price' && order === 'asc') return 'price-low'
    if (sort === 'price' && order === 'desc') return 'price-high'
    if (sort === 'name' && order === 'asc') return 'name-az'
    if (sort === 'name' && order === 'desc') return 'name-za'
    if (sort === 'total_rates' && order === 'desc') return 'rating-high'
    if (sort === 'total_rates' && order === 'asc') return 'rating-low'
    return 'newest'
}
// Parse sortBy enum to query params
function parseSortParamsToQuery(sortBy: SortOption): { sort: string, order: 'asc' | 'desc' } {
    switch (sortBy) {
        case 'newest':
            return { sort: 'created_at', order: 'desc' }
        case 'oldest':
            return { sort: 'created_at', order: 'asc' }
        case 'price-low':
            return { sort: 'price', order: 'asc' }
        case 'price-high':
            return { sort: 'price', order: 'desc' }
        case 'name-az':
            return { sort: 'name', order: 'asc' }
        case 'name-za':
            return { sort: 'name', order: 'desc' }
        case 'rating-high':
            return { sort: 'total_rates', order: 'desc' }
        case 'rating-low':
            return { sort: 'total_rates', order: 'asc' }
        default:
            return { sort: 'created_at', order: 'desc' }
    }
}

// Initial state factory
function createInitialState(
    initialProducts: ProductWithUserData[],
    initialQuery: string,
    initialCategorySlug: string | undefined,
    initialSort: SortField,
    initialOrder: SortOrder,
    currentPage: number,
    hasMore: boolean
): ProductsPageState {
    // Map initial sort to UI sort option
    const getInitialSortOption = (): SortOption => {
        if (initialSort === 'created_at') {
            return initialOrder === 'desc' ? 'newest' : 'oldest'
        }
        if (initialSort === 'price') {
            return initialOrder === 'asc' ? 'price-low' : 'price-high'
        }
        if (initialSort === 'name') {
            return initialOrder === 'asc' ? 'name-az' : 'name-za'
        }
        if (initialSort === 'total_rates') {
            return initialOrder === 'desc' ? 'rating-high' : 'rating-low'
        }
        return 'newest'
    }

    const totalPages = Math.ceil((initialProducts.length >= 12 ? (hasMore ? initialProducts.length * 2 : initialProducts.length) : initialProducts.length) / 12)

    return {
        products: initialProducts,
        filters: {
            query: initialQuery,
            categorySlug: initialCategorySlug,
            sortBy: getInitialSortOption(),
            page: currentPage,
            limit: 12
        },
        viewMode: 'grid',
        showFilters: false,
        isLoading: false,
        error: null,
        totalProducts: initialProducts.length >= 12 ? (hasMore ? initialProducts.length * 2 : initialProducts.length) : initialProducts.length,
        totalPages
    }
}

interface UseProductsPageProps {
    initialProducts: ProductWithUserData[]
    initialQuery: string
    initialCategorySlug?: string
    initialSort: SortField
    initialOrder: SortOrder
    currentPage: number
    hasMore: boolean
}

export function useProductsPage({
    initialProducts,
    initialQuery,
    initialCategorySlug,
    initialSort,
    initialOrder,
    currentPage,
    hasMore
}: UseProductsPageProps): UseProductsPageReturn {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Initialize state with reducer
    const [state, dispatch] = useReducer(
        productsPageReducer,
        createInitialState(
            initialProducts,
            initialQuery,
            initialCategorySlug,
            initialSort,
            initialOrder,
            currentPage,
            hasMore
        )
    )

    // Server action for fetching products
    const searchAction = useAction(queryProductsAction, {
        onSuccess: ({ data }) => {
            if (!data) return

            dispatch({ type: 'SET_PRODUCTS', payload: data.data })
            dispatch({
                type: 'SET_PAGINATION',
                payload: {
                    total: data.total,
                    totalPages: Math.ceil(data.total / state.filters.limit)
                }
            })
            dispatch({ type: 'SET_LOADING', payload: false })
            dispatch({ type: 'CLEAR_ERROR' })
        },
        onError: ({ error }) => {
            console.error('Error fetching products:', error)
            const errorMessage = typeof error === 'string' ? error : error?.serverError || 'Failed to fetch products'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    })

    // Update URL without causing navigation
    const updateURL = useCallback((filters: Partial<ProductFilters>) => {
        const current = new URLSearchParams(searchParams.toString())

        // Update URL parameters
        if (filters.query !== undefined) {
            if (filters.query) {
                current.set('q', filters.query)
            } else {
                current.delete('q')
            }
        }

        if (filters.categorySlug !== undefined && filters.categorySlug !== null) {
            if (filters.categorySlug && filters.categorySlug !== 'all') {
                current.set('category', filters.categorySlug)
            } else {
                current.delete('category')
            }
        } else if (filters.categorySlug === undefined || filters.categorySlug === null) {
            current.delete('category')
        }

        if (filters.page !== undefined && filters.page > 1) {
            current.set('page', filters.page.toString())
        } else {
            current.delete('page')
        }

        if (filters.sortBy !== undefined) {
            const { sort, order } = parseSortParamsToQuery(filters.sortBy)
            if (filters.sortBy !== 'newest') {
                current.set('sort', sort)
                current.set('order', order)
            } else {
                current.delete('sort')
                current.delete('order')
            }
        }

        const search = current.toString()
        const query = search ? `?${search}` : ''

        startTransition(() => {
            router.replace(`${pathname}${query}`, { scroll: false })
        })
    }, [pathname, router, searchParams])

    // Fetch products with current filters
    const fetchProducts = useCallback(async (filters: ProductFilters) => {
        const { sort, order } = mapSortByToQuery(filters.sortBy)

        dispatch({ type: 'SET_LOADING', payload: true })

        searchAction.execute({
            queryString: filters.query || undefined,
            category_slug: filters.categorySlug,
            page: filters.page,
            limit: filters.limit,
            sort: sort as SortField,
            order
        })
    }, [searchAction])

    // Update filters and fetch products
    const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
        const updatedFilters = { ...state.filters, ...newFilters }

        dispatch({ type: 'SET_FILTERS', payload: newFilters })
        updateURL(updatedFilters)
        fetchProducts(updatedFilters)
    }, [state.filters, updateURL, fetchProducts])

    // Set view mode
    const setViewMode = useCallback((mode: 'grid' | 'list') => {
        dispatch({ type: 'SET_VIEW_MODE', payload: mode })
    }, [])

    // Toggle filters panel
    const toggleFilters = useCallback(() => {
        dispatch({ type: 'SET_SHOW_FILTERS', payload: !state.showFilters })
    }, [state.showFilters])

    // Clear all filters
    const clearFilters = useCallback(() => {
        dispatch({ type: 'RESET_FILTERS' })
        updateURL({ query: '', categorySlug: undefined, page: 1, sortBy: 'newest' })
        fetchProducts({ query: '', categorySlug: undefined, sortBy: 'newest', page: 1, limit: 12 })
    }, [updateURL, fetchProducts])

    // Clear error
    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' })
    }, [])

    // Computed values
    const hasActiveFilters = useMemo(() => {
        return state.filters.query !== '' ||
            state.filters.categorySlug !== undefined ||
            state.filters.sortBy !== 'newest'
    }, [state.filters])

    const { field: currentSortField, order: currentSortOrder } = useMemo(() => {
        return mapSortOptionToDatabase(state.filters.sortBy)
    }, [state.filters.sortBy])

    // Sync with URL params on mount and URL changes
    useEffect(() => {
        const urlQuery = searchParams.get('q') || ''
        const urlCategory = searchParams.get('category') || undefined
        const urlPage = parseInt(searchParams.get('page') || '1', 10)
        const urlSort = searchParams.get('sort')
        const urlOrder = searchParams.get('order')
        const urlSortBy = parseSortParamsFromQuery(urlSort, urlOrder)
        const hasUrlChanges =
            urlQuery !== state.filters.query ||
            urlCategory !== state.filters.categorySlug ||
            urlPage !== state.filters.page ||
            urlSortBy !== state.filters.sortBy

        if (hasUrlChanges) {
            const newFilters = {
                query: urlQuery,
                categorySlug: urlCategory,
                page: urlPage,
                sortBy: urlSortBy
            }

            dispatch({ type: 'SET_FILTERS', payload: newFilters })
            fetchProducts({ ...state.filters, ...newFilters })
        }
    }, [searchParams, state.filters, fetchProducts])

    // Update loading state based on pending state
    useEffect(() => {
        if (isPending) {
            dispatch({ type: 'SET_LOADING', payload: true })
        }
    }, [isPending])

    return {
        state,
        updateFilters,
        setViewMode,
        toggleFilters,
        clearFilters,
        clearError,
        hasActiveFilters,
        currentSortField,
        currentSortOrder
    }
} 