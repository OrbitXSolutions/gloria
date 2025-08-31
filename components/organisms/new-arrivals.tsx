
import { getNewArrivals } from "@/lib/common/supabase-queries";
import { createSsrClient } from "@/lib/supabase/server";
import NewArrivalsClient from "../molecules/new-arrivals-client";

export default async function NewArrivals() {
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = await getNewArrivals(4, user?.user_metadata.user_id);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://eleva-boutique.net/products/${p.slug || p.slug_ar || p.id}`,
      name: p.name_en || p.name_ar
    }))
  };

  return <>
    <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify(itemListJsonLd)}</script>
    <NewArrivalsClient products={products} />
  </>;
}
