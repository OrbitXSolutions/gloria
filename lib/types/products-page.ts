import { ProductWithUserData } from './database.types'

// Core product page types
export interface Category {
    id: number
    name_en: string
    name_ar: string
    slug: string
    slug_ar: string
    image: string | null
    meta_title_en: string | null
    meta_title_ar: string | null
    meta_description_en: string | null
    meta_description_ar: string | null
}

export type ViewMode = 'grid' | 'list'

export type SortOption =
    | 'newest'
    | 'oldest'
    | 'price-low'
    | 'price-high'
    | 'name-az'
    | 'name-za'
    | 'rating-high'
    | 'rating-low'

export type SortField = 'created_at' | 'name' | 'price' | 'total_rates'
export type SortOrder = 'asc' | 'desc'

// Filter state interface
export interface ProductFilters {
    query: string
    categorySlug?: string
    sortBy: SortOption
    page: number
    limit: number
}

// Server-side query parameters
export interface ProductsQueryParams {
    queryString?: string
    category_slug?: string
    sort?: SortField
    order?: SortOrder
    page?: number
    limit?: number
}

// Pagination response
export interface PaginatedProductsResponse {
    data: ProductWithUserData[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

// Client-side state
export interface ProductsPageState {
    products: ProductWithUserData[]
    filters: ProductFilters
    viewMode: ViewMode
    showFilters: boolean
    isLoading: boolean
    error: string | null
    totalProducts: number
    totalPages: number
}

// Action types for state management
export type ProductsPageAction =
    | { type: 'SET_PRODUCTS'; payload: ProductWithUserData[] }
    | { type: 'SET_FILTERS'; payload: Partial<ProductFilters> }
    | { type: 'SET_VIEW_MODE'; payload: ViewMode }
    | { type: 'SET_SHOW_FILTERS'; payload: boolean }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_PAGINATION'; payload: { total: number; totalPages: number } }
    | { type: 'RESET_FILTERS' }
    | { type: 'CLEAR_ERROR' }

// Hook return type
export interface UseProductsPageReturn {
    // State
    state: ProductsPageState

    // Actions
    updateFilters: (filters: Partial<ProductFilters>) => void
    setViewMode: (mode: ViewMode) => void
    toggleFilters: () => void
    clearFilters: () => void
    clearError: () => void

    // Computed values
    hasActiveFilters: boolean
    currentSortField: SortField
    currentSortOrder: SortOrder
}

// Component props
export interface ProductsPageProps {
    initialProducts: ProductWithUserData[]
    categories: Category[]
    initialQuery: string
    initialCategorySlug?: string
    currentPage: number
    hasMore: boolean
    initialSort: SortField
    initialOrder: SortOrder
}

export interface ProductsFiltersPanelProps {
    filters: ProductFilters
    categories: Category[]
    viewMode: ViewMode
    showFilters: boolean
    isLoading: boolean
    onFiltersChange: (filters: Partial<ProductFilters>) => void
    onViewModeChange: (mode: ViewMode) => void
    onToggleFilters: () => void
    onClearFilters: () => void
}

export interface ProductsDisplayProps {
    products: ProductWithUserData[]
    viewMode: ViewMode
    currentPage: number
    totalPages: number
    totalProducts: number
    hasMore: boolean
    isLoading: boolean
    error: string | null
    onPageChange: (page: number) => void
    onClearFilters: () => void
} 