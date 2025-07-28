# Components Structure

This directory follows the Atomic Design methodology, organizing components into atoms, molecules, organisms, and templates.

## Structure

### Atoms
The smallest building blocks - basic UI components that can't be broken down further.

- `sort-button.tsx` - Reusable sort button with icon and label
- `category-filter-button.tsx` - Category filter button with icon and name
- `view-mode-toggle.tsx` - Grid/List view toggle buttons
- `active-filter-badge.tsx` - Removable filter badge
- `product-rating.tsx` - Product rating display with stars
- `product-price.tsx` - Product price display with old price support
- `product-stock-badge.tsx` - Stock status badge (in stock/out of stock)
- `quantity-controls.tsx` - Quantity increase/decrease controls

### Molecules
Simple combinations of atoms that form a functional unit.

- `products-search-bar.tsx` - Search input with search and filter buttons
- `products-category-filters.tsx` - Category filter section with all categories
- `products-sort-controls.tsx` - Sort options with all sort buttons
- `products-active-filters.tsx` - Active filters display with remove options
- `products-results-header.tsx` - Results count and pagination info
- `products-empty-state.tsx` - Empty state when no products found

### Organisms
Complex combinations of molecules that form a distinct section.

- `products-filters-panel.tsx` - Complete filters panel with search, categories, sort, and view controls
- `products-display.tsx` - Products display with grid/list view and pagination

## Usage

### Importing Components

```typescript
// Import individual components
import { SortButton } from "@/components/atoms";
import { ProductsSearchBar } from "@/components/molecules";
import { ProductsFiltersPanel } from "@/components/organisms";

// Or import from specific files
import SortButton from "@/components/atoms/sort-button";
```

### Types

Shared types are defined in `@/lib/types/products-page.ts`:

```typescript
import { Category, ViewMode, SortOption, ProductsPageProps } from "@/lib/types/products-page";
```

### Utilities

Sorting utilities are available in `@/lib/utils/products-sort.ts`:

```typescript
import { sortProducts, mapSortOptionToDatabaseSort } from "@/lib/utils/products-sort";
```

### Custom Hooks

The main logic is encapsulated in custom hooks:

```typescript
import { useProductsPage } from "@/hooks/use-products-page";
import { useProductItem } from "@/hooks/use-product-item";
```

## Benefits

1. **Reusability** - Components can be easily reused across different parts of the application
2. **Maintainability** - Each component has a single responsibility
3. **Testability** - Small, focused components are easier to test
4. **Scalability** - New features can be built by combining existing components
5. **Consistency** - Shared components ensure consistent UI/UX

## Adding New Components

When adding new components:

1. Determine the appropriate level (atom, molecule, organism)
2. Create the component with proper TypeScript interfaces
3. Add it to the appropriate index file
4. Update this README if needed
5. Consider if it should be added to shared types 