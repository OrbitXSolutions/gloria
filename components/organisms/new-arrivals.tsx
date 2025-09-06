
import { filterProductsServer } from "@/lib/queries/queries-product";
import { createSsrClient } from "@/lib/supabase/server";
import NewArrivalsClient from "../molecules/new-arrivals-client";

export default async function NewArrivals() {
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use the filter_products RPC function for consistency
  const result = await filterProductsServer({
    page: 1,
    pageSize: 4,
    sortBy: "created_at",
    sortOrder: false, // false = descending (newest first)
    showDeleted: false,
  });

  const products = result.data;

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://www.glorianaturals.ae/products/${p.slug || p.slug_ar || p.id}`,
      name: p.name_en || p.name_ar
    }))
  };

  return <>
    <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify(itemListJsonLd)}</script>
    <NewArrivalsClient products={products} />
  </>;
}
