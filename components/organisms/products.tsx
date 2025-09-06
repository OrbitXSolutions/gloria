import { createSsrClient } from "@/lib/supabase/server";
import { filterProductsServer } from "@/lib/queries/queries-product";
import ProductsClient from "../molecules/products-client";

export default async function Products() {
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use the filter_products RPC function for consistency
  const result = await filterProductsServer({
    page: 1,
    pageSize: 8,
    sortBy: "created_at",
    sortOrder: false, // false = descending (newest first)
    showDeleted: false,
  });

  return <ProductsClient products={result.data} />;
}
